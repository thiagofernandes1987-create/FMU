/**
 * M27 — consultas reais de carreira a partir das arenas `World` CBOR/Serde.
 * Fonte: model/world.rs (arenas), saved.rs (campos Club/Player/Match),
 * persistence/native.rs (World import/export). Não usa clubes artificiais M24.
 * Entrada: WorldDocument validado, IDs numéricos; saída: cartões somente leitura.
 * Dependências: bfn_world. Sem alteração de ordens, IDs, referências ou dinheiro.
 * Esquemas futuros desconhecidos permanecem no documento original.
 */
import {WorldDocument,RustWorld,WorldValidationError,worldArenaObject,validateRustWorld,preflightWorldRuntime,RuntimePreflight} from './bfn_world';
import {CborValue,CborRecord} from '../../m26/persistence/cbor';
function asSafeInt(v:CborValue,path:string):number {
 if(typeof v==='number'&&Number.isSafeInteger(v))return v;
 if(typeof v==='bigint'&&v<=BigInt(Number.MAX_SAFE_INTEGER)&&v>=BigInt(Number.MIN_SAFE_INTEGER))return Number(v);
 throw Error('Unsafe World integer: '+path);
}
function asText(v:CborValue):string{return typeof v==='string'?v:'';}
export interface WorldClubView {arenaId:number;gameId:number;name:string;fileRef:string;human:boolean;cash:bigint;squad:number[];}
export interface WorldPlayerView {arenaId:number;name:string;clubArenaId:number|undefined;age:number;position:number;strength:number;salary:number;}
export interface WorldMatchView {arenaId:number;homeClub:number|undefined;awayClub:number|undefined;homeGoals:number;awayGoals:number;}
/** Avoids Number conversion for i64 money; typed bigint is the financial canonical value. */
export function viewWorldClub(doc:WorldDocument,index:number):WorldClubView {
 const c=worldArenaObject(doc,'clubs',index);
 const id=asSafeInt(c.id,`clubs[${index}].id`),cash=c.cash;
 const balance=typeof cash==='bigint'?cash:BigInt(asSafeInt(cash,`clubs[${index}].cash`));
 const squad=c.squad;if(!Array.isArray(squad))throw Error('Invalid club.squad');
 return {arenaId:index,gameId:id,name:asText(c.name),fileRef:asText(c.file_ref),human:c.human===true,
  cash:balance,squad:squad.map((p,i)=>asSafeInt(p,`clubs[${index}].squad[${i}]`))};
}
export function viewWorldPlayer(doc:WorldDocument,index:number):WorldPlayerView {
 const p=worldArenaObject(doc,'players',index);
 const linked=p.club===null||p.club===undefined?undefined:asSafeInt(p.club,'player.club');
 return {arenaId:index,name:asText(p.name),clubArenaId:linked,age:asSafeInt(p.age,'player.age'),
 position:asSafeInt(p.position,'player.position'),strength:asSafeInt(p.strength,'player.strength'),
 salary:asSafeInt(p.salary,'player.salary')};
}
export function viewWorldMatch(doc:WorldDocument,index:number):WorldMatchView {
 const m=worldArenaObject(doc,'matches',index);
 return {arenaId:index,homeClub:m.home==null?undefined:asSafeInt(m.home,'match.home'),
  awayClub:m.away==null?undefined:asSafeInt(m.away,'match.away'),
  homeGoals:asSafeInt(m.home_goals,'match.home_goals'),awayGoals:asSafeInt(m.away_goals,'match.away_goals')};
}
/** Exact copy-on-write transaction over World CBOR, with post-validation before commit. */
export function worldTransaction(doc:WorldDocument,mutate:(w:RustWorld)=>void):WorldDocument {
 // The CBOR encode/decode copy preserves maps, buffers, BigInt, NaN, extra fields and -0.
 const {encodeCbor,decodeCbor}=requireCbor();
 const value=decodeCbor(encodeCbor(doc.world,{allowNonFinite:true}));
 if(!value||typeof value!=='object'||Array.isArray(value)||value instanceof Map||value instanceof Uint8Array||'tag' in value)throw Error('Invalid World root');
 const changed=value as RustWorld;
 mutate(changed);
 const report=validateRustWorld(changed,{profile:'complete'});
 if(!report.valid)throw new WorldValidationError(report);
 return {world:changed,meta:doc.meta,originalFormat:doc.originalFormat,migrationSteps:doc.migrationSteps,
  validation:report,runtimePreflight:preflightWorldRuntime(changed)};
}
function requireCbor():{encodeCbor:(v:CborValue,o:{allowNonFinite:boolean})=>Uint8Array;decodeCbor:(v:Uint8Array)=>CborValue} {
 return require('../../m26/persistence/cbor');
}
declare function require(name:string):any;
