/** M27 — loads typed .bfn World, Rust schema migrations, all nine arena references and atomic persistence. */
declare function require(name:string):any;
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const os=require('node:os'),path=require('node:path'),zlib=require('node:zlib');
import schema from '../src/m27/persistence/world_schema.generated.json';
import {CborRecord,CborValue,encodeCbor,decodeCbor} from '../src/m26/persistence/cbor';
import {writeBfnPayload,readBfnPayload} from '../src/m26/persistence/bfn_codec';
import {encodeBfnHeader} from '../src/m22/persistence/native';
import {
 validateRustWorld,loadBfnWorld,encodeWorldDocument,writeBfnWorldAtomic,WorldValidationError,
 worldArenaObject,relinkWorldReferences,migrateWorld,preflightWorldRuntime,assertRustSaveMeta,RustWorld,WorldDocument,WorldArena,WORLD_ARENAS
} from '../src/m27/persistence/bfn_world';
const META={app_version:'m27',club:'Clube Fictício',coach:'Treinadora',date:'2031-04-15',season:2031,
 saved_at:1710000000,imported_from:null,format_version:3};
const structs=schema.structs as Record<string,{fields:Record<string,{type:string;default:boolean}>}>;
const arenas=schema.arena_types as Record<string,string>;
function splitTop(s:string,sep:string):string[]{let d=0,q='',out:string[]=[];
 for(const c of s){if('<(['.includes(c))d++;if('>)]'.includes(c))d--;
  if(c===sep&&d===0){out.push(q.trim());q='';}else q+=c;
 }out.push(q.trim());return out;
}
function fromType(t:string,depth=0):CborValue{
 if(depth>32)throw Error('test generator circular default: '+t);
 t=t.replace(/^std::collections::/,'');
 if(t.startsWith('Option<'))return null;
 if(t.startsWith('Vec<')||t.startsWith('BTreeSet<'))return [];
 if(t.startsWith('BTreeMap<'))return new Map();
 if(t.startsWith('[')){
  const [q,n]=splitTop(t.slice(1,-1),';');return Array.from({length:Number(n)},()=>fromType(q!,depth+1));
 }
 if(t.startsWith('('))return splitTop(t.slice(1,-1),',').map(q=>fromType(q,depth+1));
 if(t==='String')return '';
 if(t==='bool')return false;
 if(t==='f64'||t==='f32'||t==='EpochMillis'||t==='u64'||t==='i64'||/^[iu]\d+$/.test(t))return 0;
 if(arenas[t])return 0;
 if(schema.enums[t as keyof typeof schema.enums])return schema.enums[t as keyof typeof schema.enums][0]??'';
 if(structs[t]){const o:Record<string,CborValue>=Object.create(null);
  for(const [key,field] of Object.entries(structs[t]!.fields))o[key]=fromType(field.type,depth+1);
  return o;
 }
 return null;
}
function world():RustWorld {
 const out:Record<string,CborValue>=Object.create(null);
 for(const [key,type] of Object.entries(schema.root))out[key]=fromType(type);
 const w=out as RustWorld;w.game.season=2031;w.game.day=0;
 return w;
}
function fixturePayload(w:RustWorld=world()):Uint8Array{return writeBfnPayload(META,w);}
function versionSave(w:RustWorld,version:number):Uint8Array{
 const json=new TextEncoder().encode('BFNX'+JSON.stringify({...META,format_version:version}));
 const h=new Uint8Array(json.length+8),d=new DataView(h.buffer);d.setUint32(0,0x184d2a50,true);d.setUint32(4,json.length,true);h.set(json,8);
 const z=zlib.zstdCompressSync(encodeCbor(w,{allowNonFinite:true}));const b=new Uint8Array(h.length+z.length);b.set(h);b.set(z,h.length);return b;
}
function addPlayer(w:RustWorld):number {const p=fromType('Player') as CborRecord;w.players.push(p);return w.players.length-1;}
function addClub(w:RustWorld):number {const c=fromType('Club') as CborRecord;w.clubs.push(c);return w.clubs.length-1;}
function addCompetition(w:RustWorld):number {const c=fromType('Competition') as CborRecord;w.competitions.push(c);return w.competitions.length-1;}
function testValid(doc:RustWorld){const r=validateRustWorld(doc);assert.equal(r.valid,true,JSON.stringify(r.errors.slice(0,5)));return r;}
test('M27 schema: 89 Rust structs and >=950 typed fields with hash metadata',()=>{
 assert.equal(Object.keys(structs).length,89);
 assert.ok(Object.values(structs).reduce((n,x)=>n+Object.keys(x.fields).length,0)>=950);
 assert.equal(Object.keys(schema.arena_types).length,9);assert.equal(Object.keys(schema.root).length,12);
});
test('M27: World completo sintético, onze campos raiz, 9 arenas',()=>{
 const w=world(),r=testValid(w);assert.equal(r.checkedReferences,0);
 assert.equal(r.rootArenas.players,0);assert.ok(r.checkedFields>110);
});
test('M27: .bfn sintético da forma World completa é lido e validado',()=>{
 const doc=loadBfnWorld(fixturePayload());assert.equal(doc.validation.valid,true);
 assert.equal(doc.meta.format_version,3);assert.equal(doc.world.game.season,2031);
 assert.equal(doc.originalFormat,3);assert.deepEqual(doc.migrationSteps,[]);
});
test('M27: arquivo .bfn data-only é rejeitado como World; não inflar qualidade do fixture',()=>{
 const bytes=fs.readFileSync(path.join(process.cwd(),'tests/fixtures/m26_sample_data_only.bfn'));
 assert.throws(()=>loadBfnWorld(bytes),WorldValidationError);
});
test('M27: strict exige campos Rust; structural informa perfil alternativo',()=>{
 const w=world();delete w.game.players;
 const r=validateRustWorld(w);assert.equal(r.valid,false);
 assert.ok(r.errors.some(x=>x.path==='$.game.players'&&x.code==='MISSING_FIELD'));
 const s=validateRustWorld(w,{profile:'structural'});assert.equal(s.valid,true);
});
test('M27: mapa raiz e armazém de jogadores exigem tipos válidos',()=>{
 assert.equal(validateRustWorld(null).valid,false);
 const w=world();(w as unknown as Record<string,CborValue>).players={bad:1};
 assert.ok(validateRustWorld(w).errors.some(x=>x.path==='$.players'));
});
for(const [id,arena] of Object.entries(arenas)){
 test(`M27: ${id} preserva índice de arena ${arena}, rejeita referência pendurada`,()=>{
  const w=world();
  // Validate a fake reference by injecting into an existing correct field where possible.
  const f=Object.entries(structs.Game!.fields).find(([_,v])=>v.type===`Option<${id}>`||v.type===`Vec<${id}>`);
  let target:CborRecord=w.game;
  if(!f){
   const candidates=Object.entries(structs).flatMap(([name,s])=>Object.entries(s.fields).filter(([_,v])=>v.type===`Option<${id}>`||v.type===`Vec<${id}>`).map(([key,v])=>({name,key,type:v.type})));
   assert.ok(candidates.length>0,id);
   const c=candidates.find(x=>['Player','Club','Coach','Competition','Stage','Day'].includes(x.name))!;
   assert.ok(c,id);
   const key=({Player:'players',Club:'clubs',Coach:'coaches',Competition:'competitions',Stage:'stages'} as Record<string,WorldArena>)[c.name];
   const obj=fromType(c.name) as CborRecord;
   if(c.name==='Day')(w.game.days as CborRecord[]).push(obj);else (w[key!] as CborRecord[]).push(obj);
   target=obj;target[c.key]=c.type.startsWith('Vec')?[9]:9;
  }else target[f[0]]=f[1].type.startsWith('Vec')?[9]:9;
  const result=validateRustWorld(w,{maxIssues:10});
  assert.ok(result.errors.some(x=>x.code==='DANGLING_REFERENCE'),JSON.stringify(result.errors));
 });
}
test('M27: índice válido permanece o mesmo após salvar e recarregar',()=>{
 const w=world(),p=addPlayer(w),c=addClub(w);w.players[p]!.club=c;w.clubs[c]!.squad=[p];w.game.players=[p];w.game.clubs=[c];
 const doc=loadBfnWorld(fixturePayload(w));assert.equal(doc.validation.checkedReferences,4);
 assert.equal(worldArenaObject(doc,'players',p).club,c);
 assert.deepEqual(worldArenaObject(doc,'clubs',c).squad,[p]);
 const after=loadBfnWorld(encodeWorldDocument(doc));assert.equal(after.world.players[p]!.club,c);
 assert.deepEqual(after.world.game.players,[p]);
});
test('M27: invalid World rejects refs missing arena (no repaired indices)',()=>{
 const w=world(),p=addPlayer(w);w.game.players=[p];w.players[p]!.club=2;
 assert.throws(()=>loadBfnWorld(fixturePayload(w)),(e:Error)=>e instanceof WorldValidationError && (e as WorldValidationError).report.errors.some(x=>x.code==='DANGLING_REFERENCE'));
});
test('M27: campos desconhecidos, arrays e mapas com bigint sobrevivem leitura/escrita',()=>{
 const w=world();w.game.extra_future={coins:9007199254740997n,notes:Uint8Array.from([1,2,3]),x:new Map<CborValue,CborValue>([[12,'doze']])};
 const doc=loadBfnWorld(fixturePayload(w));const again=loadBfnWorld(encodeWorldDocument(doc));
 const extra=again.world.game.extra_future as CborRecord;
 assert.equal(extra.coins,9007199254740997n);assert.deepEqual(extra.notes,Uint8Array.from([1,2,3]));
 assert.ok(extra.x instanceof Map);assert.equal((extra.x as Map<CborValue,CborValue>).get(12),'doze');
});
test('M27: f64 NaN/infinity/-0 no payload World não são convertidos em zero',()=>{
 const w=world();w.game.future_test={arr:[NaN,Infinity,-Infinity,-0]};
 const d=loadBfnWorld(fixturePayload(w)),e=loadBfnWorld(encodeWorldDocument(d));
 const values=(e.world.game.future_test as CborRecord).arr as number[];
 assert.ok(Number.isNaN(values[0]));assert.equal(values[1],Infinity);assert.equal(values[2],-Infinity);assert.ok(Object.is(values[3],-0));
 assert.throws(()=>encodeCbor(NaN),/non-finite/); // fixture safety default unchanged
});
test('M27: unknown __proto__ CBOR key remains data, not prototype',()=>{
 const w=world();Object.defineProperty(w.game,'__proto__',{value:{marker:1},writable:true,enumerable:true,configurable:true});
 const d=loadBfnWorld(fixturePayload(w));
 assert.equal(Object.getPrototypeOf(d.world.game),null);
 assert.equal((d.world.game['__proto__'] as CborRecord).marker,1);
 assert.equal(({} as Record<string,unknown>).marker,undefined);
});
test('M27: v1 saves get save numbers, transfer number and relink after migrate',()=>{
 const w=world(),a=addPlayer(w),b=addPlayer(w),c=addPlayer(w);
 w.game.players=[b,a];w.game.youth_players=[c];
 w.game.transfers=[{player:a} as CborRecord];
 for(const p of w.players){delete p.save_number;delete p.save_list;}
 const result=migrateWorld(w,1);const x=result.payload as RustWorld;
 assert.deepEqual(result.steps,[1,2]);
 assert.deepEqual(x.players.map(p=>[p.save_number,p.save_list]),[[1,1],[0,1],[2,2]]);
 const t=(x.game.transfers as CborRecord[])[0]!;
 assert.equal(t.player_number,1);assert.equal(t.player_list,1);
 // Later typed restore should reject a deliberately incomplete Transfer (requires fields).
 assert.equal(validateRustWorld(x,{profile:'complete'}).valid,false);
});
test('M27: v2 tournament field + competition class migration uses Rust decision table',()=>{
 const w=world();w.game.value_iz=4;delete w.game.finalissima_season;
 w.game.europa_league=1;w.game.conference_league=2;delete w.game.copa_sudamericana;w.game.continental_cup_h=3;
 w.competitions=[Object.assign(fromType('Competition') as CborRecord,{class:'ConferenceLeague',kind:6,legacy_id:3}),
  Object.assign(fromType('Competition') as CborRecord,{class:'EuropaLeague',kind:12,legacy_id:6})];
 w.players=[Object.assign(fromType('Player') as CborRecord,{competition_stats:[Object.assign(fromType('CompetitionStats') as CborRecord,{competition_id:0})]})];
 const d=migrateWorld(w,2),x=d.payload as RustWorld;
 assert.deepEqual(d.steps,[2]);assert.equal(x.game.finalissima_season,4);
 assert.equal(x.game.europa_league,2);assert.equal(x.game.conference_league,1);
 assert.equal(x.game.copa_sudamericana,3);
 assert.equal(x.competitions[0]!.class,'EuropaLeague');assert.equal(x.competitions[1]!.class,'ConferenceLeague');
 assert.equal((x.players[0]!.competition_stats as CborRecord[])[0]!.competition_number,3);
 assert.equal(Object.hasOwn(w.game,'value_iz'),true);
});
test('M27: invalid migration version, future frame and CBOR corrupted fail closed',()=>{
 assert.throws(()=>migrateWorld(world(),0),/Unsupported/);
 assert.throws(()=>migrateWorld(world(),4),/Unsupported/);
 assert.throws(()=>loadBfnWorld(Uint8Array.of(1,2,3)),/BFN|Truncated/);
});
test('M27: valid v2 World migrates to v3 and encodes with version 3',()=>{
 const w=world(),payload=versionSave(w,2);
 const d=loadBfnWorld(payload);assert.deepEqual(d.migrationSteps,[2]);assert.equal(d.originalFormat,2);
 assert.equal(readBfnPayload(encodeWorldDocument(d)).meta.format_version,3);
});
test('M27: atomic save creates file and 3 rotating backup copies',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'fmu-m27-'));
 try{
  const filename=path.join(tmp,'career.bfn');let d=loadBfnWorld(fixturePayload());
  for(let n=0;n<5;n++){d.world.game.season=2031+n;writeBfnWorldAtomic(filename,d);}
  assert.equal(loadBfnWorld(fs.readFileSync(filename)).world.game.season,2035);
  assert.equal(loadBfnWorld(fs.readFileSync(filename+'.bak1')).world.game.season,2034);
  assert.equal(loadBfnWorld(fs.readFileSync(filename+'.bak3')).world.game.season,2032);
  assert.equal(fs.existsSync(filename+'.bak4'),false);assert.equal(fs.existsSync(filename+'.tmp'),false);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('M27: attempt save with dangling pointer leaves original bytes untouched',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'fmu-m27-'));
 try{
  const filename=path.join(tmp,'career.bfn'),d=loadBfnWorld(fixturePayload());
  writeBfnWorldAtomic(filename,d);const before=fs.readFileSync(filename);
  d.world.game.clubs=[199];assert.throws(()=>writeBfnWorldAtomic(filename,d),WorldValidationError);
  assert.deepEqual(fs.readFileSync(filename),before);assert.equal(fs.existsSync(filename+'.tmp'),false);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('M27: invalid writer path rejected before mutation',()=>{
 const d=loadBfnWorld(fixturePayload());assert.throws(()=>writeBfnWorldAtomic('/tmp/world.json',d),/\.bfn/);
});
test('M27: relink transfers via (save_list,save_number) and competition_id via legacy_id',()=>{
 const w=world(),p=addPlayer(w),q=addPlayer(w),comp=addCompetition(w);
 w.players[p]!.save_list=1;w.players[p]!.save_number=2;
 w.players[q]!.save_list=1;w.players[q]!.save_number=1;
 w.game.players=[p,q];w.game.transfers=[Object.assign(fromType('Transfer') as CborRecord,{player:null,player_list:1,player_number:2})];
 w.game.days=[Object.assign(fromType('Day') as CborRecord,{competitions:[comp]})];
 w.competitions[comp]!.legacy_id=8;
 w.players[p]!.competition_stats=[Object.assign(fromType('CompetitionStats') as CborRecord,{competition_number:8,competition_id:null})];
 const result=relinkWorldReferences(w);
 assert.deepEqual(result,{transfers:1,competitionStats:1});
 assert.equal((w.game.transfers as CborRecord[])[0]!.player,p);
 assert.equal((w.players[p]!.competition_stats as CborRecord[])[0]!.competition_id,comp);
});
test('M27: player with no save number does not acquire a transfer reference',()=>{
 const w=world(),p=addPlayer(w);w.game.players=[p];w.players[p]!.save_number=-1;
 w.game.transfers=[Object.assign(fromType('Transfer') as CborRecord,{player:null,player_list:1,player_number:42})];
 const x=relinkWorldReferences(w);assert.equal(x.transfers,0);
 assert.equal((w.game.transfers as CborRecord[])[0]!.player,null);
});
import {inspectWorldFile,upgradeWorldFile,runM27WorldCli} from '../src/m27/persistence/world_cli';
test('M27 CLI: inspecionar arquivo físico sem modificar mtime ou bytes',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'fmu-m27-cli-'));
 try{
  const filename=path.join(tmp,'in.bfn'),raw=fixturePayload();fs.writeFileSync(filename,raw);
  const before=fs.statSync(filename).mtimeMs,x=inspectWorldFile(filename);
  assert.equal(x.season,2031);assert.equal(x.arenas.clubs,0);assert.equal(x.migrations.length,0);
  assert.equal(fs.statSync(filename).mtimeMs,before);assert.deepEqual([...fs.readFileSync(filename)],[...raw]);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('M27 CLI: migrar arquivo v2→v3 sem alterar origem',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'fmu-m27-cli-'));
 try{
  const input=path.join(tmp,'old.bfn'),output=path.join(tmp,'new.bfn');
  const original=versionSave(world(),2);fs.writeFileSync(input,original);
  const info=upgradeWorldFile(input,output);
  assert.deepEqual(info.migrations,[2]);assert.equal(readBfnPayload(fs.readFileSync(output)).meta.format_version,3);
  assert.deepEqual([...fs.readFileSync(input)],[...original]);
  assert.equal(runM27WorldCli(['inspect',output]).format,3);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('M27 CLI: não promove JSON ou .s22 a World .bfn sem importador Kryo',()=>{
 assert.throws(()=>inspectWorldFile('/tmp/in.json'),/Only \.bfn/);
 assert.throws(()=>runM27WorldCli(['import-s22','raw.s22']),/Usage/);
 assert.throws(()=>runM27WorldCli([]),/Usage/);
});

test('M27 safety: binary-readable empty World is NOT accepted as playable career',()=>{
 const doc=loadBfnWorld(fixturePayload());assert.equal(doc.validation.valid,true);
 assert.equal(doc.runtimePreflight.minimumReady,false);assert.equal(doc.runtimePreflight.rustExecutionVerified,false);
 assert.ok(doc.runtimePreflight.blockers.some(x=>x.path==='$.game.days'));
 assert.throws(()=>loadBfnWorld(fixturePayload(),{requireRuntimePreflight:true}),/not ready for gameplay/);
});

test('M27: SaveMeta Rust fields are mandatory and typed, unlike only checking BFN frame',()=>{
 assert.doesNotThrow(()=>assertRustSaveMeta(META));
 assert.throws(()=>loadBfnWorld(writeBfnPayload({format_version:3},world())),/SaveMeta/);
 assert.throws(()=>assertRustSaveMeta({...META,season:'2031'}),/season/);
 assert.throws(()=>assertRustSaveMeta({...META,saved_at:-1}),/saved_at/);
 assert.throws(()=>assertRustSaveMeta({...META,imported_from:2}),/imported_from/);
});
