/**
 * M31 — faithful, typed counterpart of persistence/src/kryo/graph.rs.
 * Graph arena IDs, not JS object references, preserve Kryo aliasing and cycles.
 * i64 values and IEEE-754 bit payloads are never coerced to unsafe JS numbers.
 * All values originate in a trusted decoder or in explicit synthetic fixtures.
 */
export type KryoValue =
 | {type:'null'}
 | {type:'bool';value:boolean}
 | {type:'byte'|'short'|'char'|'int';value:number}
 | {type:'long';value:bigint}
 | {type:'float';bits:number}
 | {type:'double';bits:bigint}
 | {type:'string';id:number}
 | {type:'enum';classId:number;ordinal:number}
 | {type:'node';id:number};
export type KryoPrimitiveKind='int'|'long'|'double'|'float'|'boolean'|'short'|'byte'|'char';
export interface KryoCalendar {timeZone:string;millis:bigint;lenient:boolean;firstDayOfWeek:number;minimalDaysInFirstWeek:number;gregorianChange:bigint;}
export type KryoNodeData=
 | {kind:'object';values:KryoValue[]}
 | {kind:'items';values:KryoValue[]}
 | {kind:'map';entries:Array<[KryoValue,KryoValue]>}
 | {kind:'ints'|'shorts'|'bytes'|'chars';values:number[]}
 | {kind:'longs';values:bigint[]}
 | {kind:'floats';bits:number[]}
 | {kind:'doubles';bits:bigint[]}
 | {kind:'booleans';values:boolean[]}
 | {kind:'calendar';value:KryoCalendar};
export interface KryoNode {classId:number;data:KryoNodeData;}
export interface KryoClass {name:string;fields:string[];}
export interface KryoGraph {classes:KryoClass[];strings:string[];nodes:KryoNode[];roots:KryoValue[];}
export const KNULL:KryoValue={type:'null'};
export function isIndex(id:number,length:number):boolean{return Number.isSafeInteger(id)&&id>=0&&id<length;}
/** Reject broken links up front: unlike the original panic-prone Rust dump, this fails closed. */
export function validateKryoGraph(graph:KryoGraph):void {
 if(graph.roots.length>64||graph.nodes.length>5_000_000)throw Error('Kryo graph exceeds safe limits');
 for(const [i,cls] of graph.classes.entries()) {
  if(!cls.name||cls.fields.some(f=>typeof f!=='string'||!f))throw Error(`Kryo class ${i} is invalid`);
 }
 const value=(v:KryoValue,path:string):void=>{
  if(!v||typeof v!=='object')throw Error(`Bad Kryo value ${path}`);
  if(v.type==='node'&&!isIndex(v.id,graph.nodes.length))throw Error(`Broken Kryo node ref ${path}`);
  if(v.type==='string'&&!isIndex(v.id,graph.strings.length))throw Error(`Broken Kryo string ref ${path}`);
  if(v.type==='enum'&&(!isIndex(v.classId,graph.classes.length)||!Number.isSafeInteger(v.ordinal)||v.ordinal<0))throw Error(`Broken Kryo enum ${path}`);
  if(['byte','short','char','int'].includes(v.type)&&!Number.isSafeInteger((v as {value:number}).value))throw Error(`Invalid integer ${path}`);
  if(v.type==='long'&&typeof v.value!=='bigint')throw Error(`Invalid i64 ${path}`);
  if(v.type==='double'&&typeof v.bits!=='bigint')throw Error(`Invalid double bits ${path}`);
  if(v.type==='float'&&(!Number.isSafeInteger(v.bits)||v.bits<0||v.bits>0xffffffff))throw Error(`Invalid float bits ${path}`);
 };
 graph.roots.forEach((v,i)=>value(v,`root[${i}]`));
 graph.nodes.forEach((n,i)=>{
  if(!isIndex(n.classId,graph.classes.length))throw Error(`Invalid Kryo class ID at node ${i}`);
  const data=n.data;
  switch(data.kind){
   case 'object':
    if(data.values.length!==graph.classes[n.classId]!.fields.length)throw Error(`Field count mismatch node ${i}`);
   case 'items':data.values.forEach((v,j)=>value(v,`node[${i}][${j}]`));break;
   case 'map':data.entries.forEach(([k,v],j)=>{value(k,`node[${i}].key${j}`);value(v,`node[${i}].value${j}`);});break;
   case 'ints':case 'shorts':case 'bytes':case 'chars':
    if(data.values.some(v=>!Number.isSafeInteger(v)))throw Error(`Bad integral array node ${i}`);break;
   case 'longs':if(data.values.some(v=>typeof v!=='bigint'))throw Error(`Bad long array node ${i}`);break;
   case 'floats':if(data.bits.some(v=>!Number.isSafeInteger(v)||v<0||v>0xffffffff))throw Error(`Bad float array node ${i}`);break;
   case 'doubles':if(data.bits.some(v=>typeof v!=='bigint'))throw Error(`Bad double array node ${i}`);break;
   case 'booleans':if(data.values.some(v=>typeof v!=='boolean'))throw Error(`Bad boolean array node ${i}`);break;
   case 'calendar':if(typeof data.value.timeZone!=='string'||typeof data.value.millis!=='bigint')throw Error(`Bad calendar node ${i}`);break;
   default:throw Error(`Unsupported Kryo node data at ${i}`);
  }
 });
}
