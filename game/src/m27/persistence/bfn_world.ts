/**
 * M27 — decodificador .bfn → World persistente e validado contra os tipos Rust.
 * Fontes: crates/persistence/src/native.rs + migrations.rs;
 *         crates/model/src/world.rs + saved.rs + mods.rs + ids.rs + save_numbers.rs.
 *
 * Entrada: quadro Zstandard com CBOR; saída: WorldDocument (11 arenas e Game).
 * Dependências: codec M26, 89 struct schemas gerados do Rust, node:fs somente
 * no método de gravação. Nenhum ponteiro de arena é renumerado na importação.
 * Efeitos: loader/migração/validação imutáveis; writer faz fsync + rename e
 * guarda até três .bak. Campos desconhecidos são preservados no grafo CBOR.
 * Limites: identidade de objetos Java/Kryo não existe dentro do CBOR: usamos
 * índices das arenas com checagem de limites. NÃO traduz o grafo para a
 * carreira simplificada M24, NÃO executa a engine Rust e não valida 100%
 * das invariantes semânticas dos 89 tipos (ex.: regulamentação de torneios).
 */

declare function require(name:string):any;
const fs=require('node:fs');
import schema from './world_schema.generated.json';
import {BfnDecoded,readBfnPayload,writeBfnPayload} from '../../m26/persistence/bfn_codec';
import {CborValue,CborRecord,CborTag} from '../../m26/persistence/cbor';
import {GAME_RENAMES} from '../../m22/persistence/migrations';

export type WorldArena='players'|'clubs'|'coaches'|'stadiums'|'matches'|'competitions'|'stages'|'countries'|'state_leagues';
export const WORLD_ARENAS:readonly WorldArena[]=['players','clubs','coaches','stadiums','matches','competitions','stages','countries','state_leagues'];
export interface RustWorld extends Record<string,CborValue> {
 game:CborRecord;job_market:CborRecord;
 players:CborRecord[];clubs:CborRecord[];coaches:CborRecord[];
 stadiums:CborRecord[];matches:CborRecord[];competitions:CborRecord[];
 stages:CborRecord[];countries:CborRecord[];state_leagues:CborRecord[];
 mods?:CborRecord;
}
export interface ValidationIssue {path:string;code:string;description:string}
export interface WorldValidation {valid:boolean;checkedFields:number;checkedReferences:number;rootArenas:Record<WorldArena,number>;errors:ValidationIssue[];warnings:ValidationIssue[];profile:'complete'|'structural'}
export interface WorldDocument {world:RustWorld;meta:Readonly<Record<string,unknown>>;originalFormat:number;migrationSteps:readonly number[];validation:WorldValidation;runtimePreflight:RuntimePreflight;}
export interface WorldLoadOptions {profile?:'complete'|'structural';maxIssues?:number; relink?:boolean;requireRuntimePreflight?:boolean;}
interface FieldSpec {type:string;default:boolean}
interface StructSpec {fields:Record<string,FieldSpec>;origin:string}
const schemaStructs=schema.structs as Record<string,StructSpec>;
const arenaTypes=schema.arena_types as Record<string,WorldArena>;
const enumMembers=schema.enums as Record<string,string[]>;
const MAX_ERRORS=200;

function record(v:CborValue):v is CborRecord {
 return v!==null && typeof v==='object'&&!Array.isArray(v)&&!(v instanceof Uint8Array)&&!(v instanceof Map)&&!('tag' in v);
}
function positiveIndex(v:CborValue):number|undefined {
 if(typeof v==='number'&&Number.isSafeInteger(v)&&v>=0)return v;
 if(typeof v==='bigint'&&v>=0n&&v<=BigInt(Number.MAX_SAFE_INTEGER))return Number(v);
 return undefined;
}
function intValue(v:CborValue):bigint|undefined {
 if(typeof v==='bigint')return v;
 if(typeof v==='number'&&Number.isSafeInteger(v))return BigInt(v);
 return undefined;
}
function cloneCbor<T extends CborValue>(value:T,depth=0):T {
 if(depth>128)throw Error('World CBOR cloning depth exceeded');
 if(value===null||typeof value!=='object')return value;
 if(value instanceof Uint8Array)return new Uint8Array(value) as T;
 if(Array.isArray(value))return value.map(x=>cloneCbor(x,depth+1)) as T;
 if(value instanceof Map)return new Map(Array.from(value.entries(),([k,v])=>[cloneCbor(k,depth+1),cloneCbor(v,depth+1)] as [CborValue,CborValue])) as T;
 if('tag' in value)return {tag:value.tag,value:cloneCbor(value.value,depth+1)} as T;
 const copy:Record<string,CborValue>=Object.create(null);
 for(const [key,val] of Object.entries(value))Object.defineProperty(copy,key,{value:cloneCbor(val,depth+1),writable:true,configurable:true,enumerable:true});
 return copy as T;
}
function splitTop(s:string,sep:string):string[] {
 const out:string[]=[];let token='',depth=0;
 for(const c of s){if('<(['.includes(c))depth++;else if('>)]'.includes(c))depth--;
  if(c===sep&&depth===0){out.push(token.trim());token='';}else token+=c;
 }
 out.push(token.trim());return out;
}
function inner(s:string,head:string):string|undefined {
 return s.startsWith(head+'<')&&s.endsWith('>')?s.slice(head.length+1,-1):undefined;
}
function normalizeType(s:string):string{return s.replace(/^std::collections::/,'');}
/** Checks CBOR types and every recognized arena reference, nested under structs and containers. */
export function validateRustWorld(value:CborValue,opts:WorldLoadOptions={}):WorldValidation {
 const profile=opts.profile??'complete',maxIssues=Math.max(1,Math.min(1000,opts.maxIssues??MAX_ERRORS));
 const errors:ValidationIssue[]=[],warnings:ValidationIssue[]=[];
 let checkedFields=0,checkedReferences=0;
 const counts=Object.create(null) as Record<WorldArena,number>;
 for(const key of WORLD_ARENAS)counts[key]=record(value)&&Array.isArray(value[key])?(value[key] as CborValue[]).length:0;
 function error(path:string,code:string,description:string):void{if(errors.length<maxIssues)errors.push({path,code,description});}
 function warning(path:string,code:string,description:string):void{if(warnings.length<maxIssues)warnings.push({path,code,description});}
 function visit(v:CborValue,t:string,path:string,depth:number):void {
  if(errors.length>=maxIssues)return;
  if(depth>96){error(path,'MAX_DEPTH','World nesting exceeds 96');return;}
  t=normalizeType(t.trim());checkedFields++;
  const optional=inner(t,'Option');if(optional!==undefined){if(v===null||v===undefined)return;visit(v,optional,path,depth+1);return;}
  const vec=inner(t,'Vec');if(vec!==undefined){if(!Array.isArray(v)){error(path,'TYPE','Expected '+t);return;}
   for(let i=0;i<v.length;i++)visit(v[i],vec,`${path}[${i}]`,depth+1);return;}
  const set=inner(t,'BTreeSet');if(set!==undefined){if(!Array.isArray(v)){error(path,'TYPE','Expected '+t);return;}
   for(let i=0;i<v.length;i++)visit(v[i],set,`${path}[${i}]`,depth+1);return;}
  const map=inner(t,'BTreeMap')??inner(t,'HashMap');if(map!==undefined){
   const fields=splitTop(map,',');if(fields.length!==2){warning(path,'UNRECOGNIZED_TYPE',t);return;}
   const entries=v instanceof Map?[...v]:record(v)?Object.entries(v):undefined;
   if(!entries){error(path,'TYPE','Expected CBOR map');return;}
   for(const [k,item] of entries){
    const castKey: CborValue= typeof k==='string'&&/^-?\d+$/.test(k)&&fields[0]!== 'String'?Number(k):k;
    visit(castKey,fields[0]!,path+'{key}',depth+1);
    visit(item,fields[1]!,`${path}{${String(k)}}`,depth+1);
   }return;
  }
  if(t.startsWith('[')&&t.endsWith(']')){const parts=splitTop(t.slice(1,-1),';');
   if(parts.length!==2||!Array.isArray(v)||v.length!==Number(parts[1])){error(path,'TYPE','Expected '+t);return;}
   for(let i=0;i<v.length;i++)visit(v[i],parts[0]!,`${path}[${i}]`,depth+1);return;}
  if(t.startsWith('(')&&t.endsWith(')')){const parts=splitTop(t.slice(1,-1),',');
   if(!Array.isArray(v)||v.length!==parts.length){error(path,'TYPE','Expected tuple '+t);return;}
   parts.forEach((q,i)=>visit(v[i],q,`${path}[${i}]`,depth+1));return;}
  if(t in arenaTypes){checkedReferences++;
   const ref=positiveIndex(v);if(ref===undefined||ref>=counts[arenaTypes[t]!]!){error(path,'DANGLING_REFERENCE',`Invalid ${t} → ${arenaTypes[t]} length ${counts[arenaTypes[t]!]}`);}return;}
  if(['i8','i16','i32','i64','isize','u8','u16','u32','u64','usize','EpochMillis'].includes(t)){
   const n=intValue(v);if(n===undefined){error(path,'TYPE','Expected integer '+t);return;}
   const unsigned=t.startsWith('u');const bits=/\d+/.exec(t)?.[0];
   if(unsigned&&n<0n){error(path,'RANGE','Unsigned negative');return;}
   if(bits){const b=BigInt(bits),min=unsigned?0n:-(1n<<(b-1n)),max=unsigned?(1n<<b)-1n:(1n<<(b-1n))-1n;
    if(n<min||n>max)error(path,'RANGE',`${t} overflow`);}
   return;
  }
  if(['f32','f64'].includes(t)){if(typeof v!=='number')error(path,'TYPE','Expected float '+t);return;}
  if(t==='bool'){if(typeof v!=='boolean')error(path,'TYPE','Expected bool');return;}
  if(t==='String'){if(typeof v!=='string')error(path,'TYPE','Expected string');return;}
  const def=schemaStructs[t];if(def){if(!record(v)){error(path,'TYPE','Expected struct '+t);return;}
   for(const [f,spec] of Object.entries(def.fields)){
    if(!Object.hasOwn(v,f)){
     if(profile==='complete'&&!spec.default&&!spec.type.startsWith('Option<'))error(path+'.'+f,'MISSING_FIELD',`Missing ${t}.${f}`);
     continue;
    }
    visit(v[f],spec.type,path+'.'+f,depth+1);
   }return;
  }
  if(t in enumMembers){if(typeof v==='string'){
    if(!enumMembers[t]!.includes(v))error(path,'ENUM','Unknown '+t+' variant '+v);
   }else if(!record(v)){error(path,'TYPE','Expected enum '+t);}
   return;}
  // External declarative type not in saved.rs/mods.rs; preserve it, but flag unverified.
  warning(path,'UNKNOWN_RUST_TYPE',t);
 }
 if(!record(value)){error('$','WORLD_ROOT','World CBOR must be string-keyed map');return {valid:false,profile,errors,warnings,checkedFields,checkedReferences,rootArenas:counts};}
 for(const [key,type] of Object.entries(schema.root)){
  if(!Object.hasOwn(value,key)){
   if(key==='mods')continue; // #[serde(default)] for World.mods
   error('$.'.concat(key),'MISSING_ARENA','World requires '+key);continue;
  }
  visit(value[key],type,'$.'+key,0);
 }
 // Semantic checks not handled by Rust serde itself, guarded for safe mutation.
 const game=value.game;
 if(record(game)){
  if(typeof game.season==='number'&&game.season<0)error('$.game.season','RANGE','Negative season');
  if(typeof game.day==='number'&&game.day<0)error('$.game.day','RANGE','Negative day');
 }
 return {valid:errors.length===0,profile,errors,warnings,checkedFields,checkedReferences,rootArenas:counts};
}
const CLASS_RENAMES:Readonly<Record<string,string>>={
 QualifiersN:'SouthAmericanQualifiers',QualifiersI:'AfricanQualifiers',QualifiersPlayoff:'AsianQualifiers',
 QualifiersM:'OceaniaQualifiers',QualifiersK:'ConcacafQualifiers'};
const COMP_RENAMES:Readonly<Record<string,string>>={
 semi_final_1:'quarter_finals',semi_final_2:'semi_finals',
 libertadores_champion:'europe_champion',champions_league_champion:'south_america_champion',
 semi_finalist_1:'africa_champion',semi_finalist_2:'asia_champion',
 finalist_1:'oceania_champion',finalist_2:'concacaf_champion'};
function rename(o:CborRecord,from:string,to:string):void {if(Object.hasOwn(o,from)){
 if(Object.hasOwn(o,to))throw Error('Migration collision: '+from+' → '+to);
 o[to]=o[from];delete o[from];
}}
/** Exact Rust migrations::add_save_numbers (v1→v2), preserving unknown keys. */
export function migrateV1SaveNumbers(w:CborRecord):void {
 const players=w.players,game=w.game;
 if(!Array.isArray(players)||!record(game))throw Error('Invalid v1 World structure');
 const numbers=players.map(()=>[-1,-1]);let number=0;
 for(const [kind,list] of [[1,game.players],[2,game.youth_players]] as const){
  if(!Array.isArray(list))continue;
  for(const id of list){const i=positiveIndex(id);if(i!==undefined&&i<players.length)numbers[i]=[number,kind];number++;}
 }
 for(let i=0;i<players.length;i++){
  const p=players[i];if(!record(p))throw Error('Invalid v1 player');
  p.save_number=numbers[i]![0]!;p.save_list=numbers[i]![1]!;
 }
 if(Array.isArray(game.transfers))for(const t of game.transfers){
  if(!record(t))throw Error('Invalid v1 transfer');
  const id=positiveIndex(t.player),pair=id!==undefined?numbers[id]:undefined;
  t.player_number=pair?.[0]??-1;t.player_list=pair?.[1]??-1;
 }
}
/** Exact Rust migrations::name_national_tournaments (v2→v3) in CBOR shape. */
export function migrateV2NamedTournaments(w:CborRecord):void {
 const game=w.game;
 if(record(game)){
  for(const [from,to] of Object.entries(GAME_RENAMES))rename(game,from,to);
  if(Object.hasOwn(game,'continental_cup_h')){
   if(Object.hasOwn(game,'europa_league')&&Object.hasOwn(game,'conference_league')){
    const a=game.europa_league;game.europa_league=game.conference_league;game.conference_league=a;
   }else if(Object.hasOwn(game,'europa_league'))rename(game,'europa_league','conference_league');
   else if(Object.hasOwn(game,'conference_league'))rename(game,'conference_league','europa_league');
   rename(game,'continental_cup_h','copa_sudamericana');
  }
  rename(game,'club_world_cup','finalissima');rename(game,'list_aw','stadium_works');
 }
 const legacy:number[]=[];
 if(Array.isArray(w.competitions))for(const c of w.competitions){
  if(!record(c))throw Error('Invalid v2 competition');
  const kind=intValue(c.kind);
  if(typeof c.class==='string'){
   if(c.class==='ConferenceLeague'&&kind===6n)c.class='EuropaLeague';
   else if(c.class==='EuropaLeague'&&kind===12n)c.class='ConferenceLeague';
   else if(c.class==='ClubWorldCup')c.class='Finalissima';
   else if(c.class==='ContinentalCupH')c.class='CopaSudamericana';
   else c.class=CLASS_RENAMES[c.class]??c.class;
  }
  for(const [from,to] of Object.entries(COMP_RENAMES))rename(c,from,to);
  if(Object.hasOwn(c,'list_ym'))c.list_ym=[];
  legacy.push(Number(intValue(c.legacy_id)??-1n));
 }
 if(Array.isArray(w.clubs))for(const c of w.clubs){if(record(c)&&Array.isArray(c.competition_records)){
  for(const r of c.competition_records)if(record(r))rename(r,'value_no','league_move');
 }}
 if(Array.isArray(w.players))for(const p of w.players){if(record(p)&&Array.isArray(p.competition_stats)){
  for(const stats of p.competition_stats){if(!record(stats))continue;
   const id=positiveIndex(stats.competition_id),value=id===undefined?-1:(legacy[id]??-1);
   stats.competition_number=value>=0?value:-1;
  }
 }}
}
/** Apply exactly the advertised v1→v2→v3 migrations on a CBOR graph clone. */
export function migrateWorld(value:CborValue,sourceVersion:number):{payload:CborValue;steps:number[]} {
 if(!Number.isInteger(sourceVersion)||sourceVersion<1||sourceVersion>3)throw Error('Unsupported BFN World version');
 const payload=cloneCbor(value),steps:number[]=[];
 if(sourceVersion<3){if(!record(payload))throw Error('Expected root World map');
  if(sourceVersion===1){migrateV1SaveNumbers(payload);steps.push(1);}
  migrateV2NamedTournaments(payload);steps.push(2);
 }
 return {payload,steps};
}
/**
 * Preflight of **minimum** playable World invariants. Passing this preflight is
 * NOT equivalent to a successful original-Rust career load or match execution.
 * The original Linux binary accepts synthetic empty-World CBOR but panics during
 * screen initialization; fail this safer gate for such saves.
 */
export interface RuntimePreflight {minimumReady:boolean;rustExecutionVerified:false;blockers:ValidationIssue[];}
export function preflightWorldRuntime(w:RustWorld):RuntimePreflight {
 const blockers:ValidationIssue[]=[];
 const guard=(condition:boolean,path:string,description:string)=>{if(!condition)blockers.push({path,code:'RUNTIME_PREFLIGHT',description});};
 const days=w.game.days,clubs=w.game.clubs,players=w.game.players;
 guard(Array.isArray(days)&&days.length>0,'$.game.days','Calendar has no days to advance');
 guard(Array.isArray(clubs)&&clubs.length>0,'$.game.clubs','No active clubs for a career');
 guard(Array.isArray(players)&&players.length>0,'$.game.players','No active players for a career');
 guard(w.clubs.length>0,'$.clubs','No clubs in global arena');
 guard(w.players.length>0,'$.players','No players in global arena');
 guard(w.coaches.length>0,'$.coaches','No coaches in global arena');
 const day=positiveIndex(w.game.day);
 guard(day!==undefined&&Array.isArray(days)&&day<days.length,'$.game.day','Day cursor points outside the calendar');
 return {minimumReady:blockers.length===0,rustExecutionVerified:false,blockers};
}
/** SaveMeta validation equivalent to Rust serde::Deserialize on native::SaveMeta. */
export function assertRustSaveMeta(meta:Readonly<Record<string,unknown>>):void {
 const required=['format_version','app_version','club','coach','date','season','saved_at'];
 for(const key of required)if(!Object.hasOwn(meta,key))throw Error('Invalid BFN SaveMeta: missing '+key);
 for(const key of ['app_version','club','coach','date'])if(typeof meta[key]!=='string')throw Error('Invalid BFN SaveMeta string: '+key);
 const v=meta.format_version,season=meta.season,stamp=meta.saved_at;
 if(!Number.isSafeInteger(v)||Number(v)<1||Number(v)>3)throw Error('Invalid BFN SaveMeta format_version');
 if(!Number.isSafeInteger(season)||Number(season)<-0x80000000||Number(season)>0x7fffffff)throw Error('Invalid BFN SaveMeta season');
 if(!Number.isSafeInteger(stamp)||Number(stamp)<0)throw Error('Invalid BFN SaveMeta saved_at');
 if(meta.imported_from!==undefined&&meta.imported_from!==null&&typeof meta.imported_from!=='string')throw Error('Invalid BFN SaveMeta imported_from');
}
/** Parse and validate the World without losing arena indexes, unknown fields or bigint. */
export function loadBfnWorld(bytes:Uint8Array,opts:WorldLoadOptions={}):WorldDocument {
 const decoded:BfnDecoded=readBfnPayload(bytes),version=Number(decoded.meta.format_version);
 assertRustSaveMeta(decoded.meta);
 const {payload,steps}=migrateWorld(decoded.payload,version);
 const report=validateRustWorld(payload,opts);
 if(!report.valid)throw new WorldValidationError(report);
 if(!record(payload))throw Error('Impossible invalid World root');
 const preflight=preflightWorldRuntime(payload as RustWorld);
 if(opts.requireRuntimePreflight&&!preflight.minimumReady)throw Error('BFN World not ready for gameplay: '+preflight.blockers.map(x=>x.path).join(', '));
 const doc={world:payload as RustWorld,meta:decoded.meta,originalFormat:version,migrationSteps:steps,validation:report,runtimePreflight:preflight};
 if(opts.relink)relinkWorldReferences(doc.world);
 return doc;
}
export class WorldValidationError extends Error {
 constructor(readonly report:WorldValidation){super('Invalid BFN World: '+report.errors.slice(0,5).map(x=>x.path+' '+x.code).join('; '));this.name='WorldValidationError';}
}
/** Strict access to one Rust arena index, without identity loss. */
export function worldArenaObject(doc:WorldDocument,arena:WorldArena,index:number):CborRecord {
 if(!Number.isSafeInteger(index)||index<0||index>=doc.world[arena].length)throw RangeError('World arena index out of range: '+arena+'['+index+']');
 const v=doc.world[arena][index]!;
 if(!record(v))throw Error('World arena entry not a struct');return v;
}
/**
 * Rust model/save_numbers.rs: restore transfers and competition statistics
 * by (save_list, save_number) and competition legacy IDs, not by object copies.
 * Explicit opt-in: preserves all other arena indexes and fields untouched.
 */
export function relinkWorldReferences(w:RustWorld):{transfers:number;competitionStats:number} {
 const first=new Map<string,number>();const game=w.game;
 for(const [kind,list] of [[1,game.players],[2,game.youth_players]] as const){
  if(!Array.isArray(list))continue;
  for(const id of list){const index=positiveIndex(id);if(index===undefined||index>=w.players.length)continue;
   const p=w.players[index]!,num=intValue(p.save_number);
   if(num!==undefined&&num>=0n){const key=kind+':'+num.toString();if(!first.has(key))first.set(key,index);}
  }
 }
 let transfers=0;
 if(Array.isArray(game.transfers))for(const t of game.transfers){if(!record(t))continue;
  const kind=intValue(t.player_list),num=intValue(t.player_number);
  if(kind===undefined||num===undefined||num<0n)continue;
  const id=first.get(kind.toString()+':'+num.toString());
  if(id!==undefined){t.player=id;transfers++;}else t.player=null;
 }
 const ordered:number[]=[],seen=new Set<number>();
 if(Array.isArray(game.days))for(const d of game.days){if(!record(d)||!Array.isArray(d.competitions))continue;
  for(const ref of d.competitions){const idx=positiveIndex(ref);if(idx===undefined||idx>=w.competitions.length||seen.has(idx))continue;
   seen.add(idx);ordered.push(idx);
  }
 }
 const byNumber=new Map<string,number>();
 for(const id of [...ordered].reverse()){
  const n=intValue(w.competitions[id]!.legacy_id);if(n!==undefined)byNumber.set(n.toString(),id);
 }
 let competitionStats=0;
 if(Array.isArray(game.players))for(const ref of game.players){const id=positiveIndex(ref);
  if(id===undefined||id>=w.players.length)continue;
  const stats=w.players[id]!.competition_stats;if(!Array.isArray(stats))continue;
  for(const st of stats){if(!record(st))continue;
   const n=intValue(st.competition_number);if(n!==undefined&&n>=0n){
    const link=byNumber.get(n.toString());if(link!==undefined){st.competition_id=link;competitionStats++;}
   }
  }
 }
 return {transfers,competitionStats};
}
/** Save a validated World; writers never silently serialize incomplete arena graphs. */
export function encodeWorldDocument(doc:WorldDocument):Uint8Array {
 assertRustSaveMeta(doc.meta);
 const report=validateRustWorld(doc.world,{profile:'complete'});
 if(!report.valid)throw new WorldValidationError(report);
 return writeBfnPayload(doc.meta,doc.world);
}
/**
 * Native Rust write_save: fsync temporary file, rotate .bak1..bak3, rename.
 * Version field normalizes to 3 on output; all payload fields/refs preserved.
 */
export function writeBfnWorldAtomic(path:string,doc:WorldDocument):void {
 if(!path.toLowerCase().endsWith('.bfn'))throw Error('World save path must end in .bfn');
 const bytes=encodeWorldDocument(doc),temp=path+'.tmp';
 let fd:undefined|number;
 try{
  fd=fs.openSync(temp,'wx');
  let written=0;while(written<bytes.length){const count=fs.writeSync(fd,bytes,written,bytes.length-written,written);if(count<=0)throw Error('World save write interrupted');written+=count;}
  fs.fsyncSync(fd);fs.closeSync(fd);fd=undefined;
  if(fs.existsSync(path)){
   for(let i=2;i>=1;i--)if(fs.existsSync(path+'.bak'+i))fs.renameSync(path+'.bak'+i,path+'.bak'+(i+1));
   fs.copyFileSync(path,path+'.bak1');
  }
  fs.renameSync(temp,path);
  // Persist rename in directory metadata where supported.
  try{const dir=fs.openSync(require('node:path').dirname(path),'r');try{fs.fsyncSync(dir);}finally{fs.closeSync(dir);}}catch{/* Windows may not support directory fsync. */}
 }catch(e){if(fd!==undefined)fs.closeSync(fd);if(fs.existsSync(temp))fs.unlinkSync(temp);throw e;}
}
