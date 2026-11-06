/**
 * Compatibility boundary for the M27/M28 `WorldDocument` shaped `{world, meta}`.
 * Does not decode `.bfn` or reserialize it; preserve its original metadata,
 * arenas and unknown fields untouched. Accepts decoded Rust integer numbers or
 * bigint and normalizes financial i64 amounts without loss of precision.
 * Must pass a validated WorldDocument from the existing native BFN loader.
 */
import {World,validateWorld,worldIdentityIntegrity} from './world';
export interface ParsedWorldDocument {world:unknown;meta?:unknown;validation?:{valid?:boolean};[key:string]:unknown;}
const record=(v:unknown):v is Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const int=(v:unknown,field:string):number=>{
 if(typeof v==='number'&&Number.isSafeInteger(v))return v;
 if(typeof v==='bigint'&&v>=BigInt(Number.MIN_SAFE_INTEGER)&&v<=BigInt(Number.MAX_SAFE_INTEGER))return Number(v);
 throw Error('Unsafe or missing Rust integer: '+field);
};
const big=(v:unknown,field:string):bigint=>{
 if(typeof v==='bigint')return v;
 if(typeof v==='number'&&Number.isSafeInteger(v))return BigInt(v);
 throw Error('Lossy or missing Rust i64: '+field);
};
/** Only normalizes known i64 fields; all other CBOR arrays and IDs stay the same. */
export function normalizeImportedWorld(doc:ParsedWorldDocument):World {
 if(doc.validation?.valid===false)throw Error('BFN World decoder reported invalid structure');
 if(!record(doc.world))throw Error('Missing WorldDocument.world');
 const w=structuredClone(doc.world) as unknown as World;
 if(!Array.isArray(w.clubs)||!Array.isArray(w.players)||!Array.isArray(w.matches)||!w.game)throw Error('Rust World arenas missing');
 w.game.day=int(w.game.day,'game.day');w.game.season=int(w.game.season,'game.season');
 if(!Array.isArray(w.game.days))throw Error('Rust World days missing');
 for(const [i,d] of w.game.days.entries()){d.date=int(d.date,`game.days[${i}].date`);}
 for(const [i,c] of w.clubs.entries()){
  c.cash=big(c.cash,`clubs[${i}].cash`);
  if(!record(c.finances))throw Error('Invalid finances for club '+i);
  c.finances.expense_salaries=big(c.finances.expense_salaries,`clubs[${i}].finances.expense_salaries`);
  c.finances.bank_interest=int(c.finances.bank_interest,`clubs[${i}].finances.bank_interest`);
  c.finances.expense_type4=int(c.finances.expense_type4,`clubs[${i}].finances.expense_type4`);
 }
 validateWorld(w);const refs=worldIdentityIntegrity(w);
 if(refs.errors.length)throw Error('Invalid roster references: '+refs.errors[0]);
 return w;
}
/** Clone-on-write patches World ONLY. The original .bfn importer owns metadata and migrations. */
export function attachWorldToDocument<T extends ParsedWorldDocument>(doc:T,world:World):T {
 validateWorld(world);
 const refs=worldIdentityIntegrity(world);if(refs.errors.length)throw Error('Invalid World identity references');
 return {...doc,world:structuredClone(world)} as T;
}
