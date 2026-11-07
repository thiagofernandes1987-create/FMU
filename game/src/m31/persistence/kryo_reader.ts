/**
 * M31: Kryo 4.0.2 object-stream reader from crates/persistence/src/kryo/reader.rs.
 * Input: raw Kryo bytes AND jar-exported class schema (dependency injected).
 * Output: strongly typed Kryo graph preserving aliasing, cycles, strings, IEEE bits.
 * Each `writeClassAndObject` root resets name registrations and object references.
 * No code execution, no disk writes. Size/depth limits guard untrusted streams.
 * The original `data/kryo-schema.json` is NOT in the supplied snapshot, so real
 * Brasfoot `.s22` decoding has not been verified against actual game saves.
 */
import {KryoInput22} from '../../m22/persistence/kryo_input';
import {KryoClassSchema,KryoSchema22} from '../../m22/persistence/kryo_schema';
import {KNULL,KryoCalendar,KryoClass,KryoGraph,KryoNodeData,KryoPrimitiveKind,KryoValue,validateKryoGraph} from './kryo_graph';
const BUILTINS=['java.lang.Integer','java.lang.String','java.lang.Float',
 'java.lang.Boolean','java.lang.Byte','java.lang.Character','java.lang.Short','java.lang.Long','java.lang.Double'] as const;
type FieldPlan={type:'primitive';kind:KryoPrimitiveKind}|{type:'dynamic'}|{type:'final';classId:number};
type Serializer={type:'fields';fields:FieldPlan[]}
 | {type:'collection'|'map'|'string'|'calendar'|'enum'|'string-array'}
 | {type:'boxed'|'primitive-array';primitive:KryoPrimitiveKind}
 | {type:'object-array';component:number;sameType:boolean}
 | {type:'unsupported';name:string};
export interface KryoReadOptions {maxNodes?:number;maxItems?:number;maxDepth?:number;maxRoots?:number;maxBytes?:number;}
const DEFAULT={maxNodes:1_000_000,maxItems:2_000_000,maxDepth:1024,maxRoots:64,maxBytes:64*1024*1024};
const primitiveKinds=new Set<KryoPrimitiveKind>(['int','long','double','float','boolean','short','byte','char']);
export class KryoStreamReader {
 private readonly input:KryoInput22;
 private readonly max:Required<KryoReadOptions>;
 private readonly classIds=new Map<string,number>();
 private readonly plans:Serializer[]=[];
 private readonly nameIds=new Map<number,number>();
 private readonly references:Array<KryoValue|undefined>=[];
 private readonly stringIds=new Map<string,number>();
 private readonly graph:KryoGraph={classes:[],strings:[],nodes:[],roots:[]};
 private countItems=0;
 constructor(bytes:Uint8Array,private readonly schema:KryoSchema22,options:KryoReadOptions={}){
  this.max={...DEFAULT,...options};
  for(const [key,val] of Object.entries(this.max))if(!Number.isSafeInteger(val)||val<1)throw Error(`Invalid Kryo limit ${key}`);
  if(bytes.length>this.max.maxBytes)throw Error('Kryo byte input exceeds limit');
  if(schema.format!=='Kryo'||!schema.classes||typeof schema.classes!=='object')throw Error('Kryo schema unavailable/invalid');
  this.input=new KryoInput22(bytes);
 }
 private error(text:string):never{throw Error(`Kryo ${text} at byte ${this.input.offset}`);}
 private count(length:number):number{
  if(!Number.isInteger(length)||length<0||length>this.max.maxItems-this.countItems)this.error(`invalid allocation or item limit ${length}`);
  this.countItems+=length;return length;
 }
 private depth(depth:number):void{if(depth>this.max.maxDepth)this.error('nesting limit');}
 private classId(name:string):number{
  const existing=this.classIds.get(name);if(existing!==undefined)return existing;
  const def=this.schema.classes[name];if(!def)this.error('class not in schema: '+name);
  const id=this.plans.length;this.classIds.set(name,id);
  this.plans.push({type:'unsupported',name:'recursive placeholder'});
  this.graph.classes.push({name,fields:(def.fields??[]).map(f=>f.name)});
  const kind=def.serializer;
  let plan:Serializer;
  switch(kind){
   case 'field':plan={type:'fields',fields:(def.fields??[]).map(f=>{
    if(f.type==='object')return f.valueClass?{type:'final',classId:this.classId(f.valueClass)}:{type:'dynamic'};
    if(!primitiveKinds.has(f.type as KryoPrimitiveKind))this.error('unknown primitive '+f.type);
    return {type:'primitive',kind:f.type as KryoPrimitiveKind};
   })};break;
   case 'collection':case 'map':case 'string':case 'calendar':case 'enum':case 'string-array':plan={type:kind};break;
   case 'object-array':{
    const component=def.component??'';
    const comp=this.schema.classes[component];
    plan={type:'object-array',component:this.classId(component),sameType:component.startsWith('[')||comp?.final===true};break;
   }
   default:{const stripped=kind.endsWith('-array')?kind.slice(0,-6):undefined;
    if(stripped&&primitiveKinds.has(stripped as KryoPrimitiveKind))plan={type:'primitive-array',primitive:stripped as KryoPrimitiveKind};
    else if(primitiveKinds.has(kind as KryoPrimitiveKind))plan={type:'boxed',primitive:kind as KryoPrimitiveKind};
    else plan={type:'unsupported',name:kind};
   }
  }
  this.plans[id]=plan;return id;
 }
 private readClass():number|undefined{
  const id=this.input.readVarInt(true);
  if(id===0)return undefined;
  if(id===1){const nameId=this.input.readVarInt(true),previous=this.nameIds.get(nameId);
   if(previous!==undefined)return previous;
   const name=this.input.readString();if(name===null)this.error('null class name');
   const result=this.classId(name);this.nameIds.set(nameId,result);return result;
  }
  const name=BUILTINS[id-2];if(!name)this.error(`unregistered class ID ${id-2}`);
  return this.classId(name);
 }
 private usesReferences(classId:number):boolean{return this.plans[classId]!.type!=='boxed';}
 private refOrNull(classId:number,mayBeNull:boolean):{type:'null'}|{type:'existing';value:KryoValue}|{type:'new';slot?:number}{
  const supported=this.usesReferences(classId);
  let marker:number;
  if(mayBeNull){marker=this.input.readVarInt(true);
   if(marker===0)return {type:'null'};
   if(!supported)return {type:'new'};
  }else{
   if(!supported)return {type:'new'};
   marker=this.input.readVarInt(true);
  }
  if(marker===1){const slot=this.references.length;
   if(slot>=this.max.maxNodes)this.error('too many Kryo references');
   this.references.push(undefined);return {type:'new',slot};
  }
  if(marker<2)this.error('invalid reference marker');
  const result=this.references[marker-2];if(!result)this.error(`reference ${marker-2} to an object not read yet`);
  return {type:'existing',value:result};
 }
 private putReference(slot:number|undefined,v:KryoValue):void{if(slot!==undefined)this.references[slot]=v;}
 private newNode(classId:number,slot?:number):number{
  if(this.graph.nodes.length>=this.max.maxNodes)this.error('node count limit');
  const id=this.graph.nodes.length;
  this.graph.nodes.push({classId,data:{kind:'items',values:[]}});
  this.putReference(slot,{type:'node',id});return id;
 }
 private pushNode(classId:number,data:KryoNodeData):KryoValue{
  if(this.graph.nodes.length>=this.max.maxNodes)this.error('node count limit');
  const id=this.graph.nodes.length;this.graph.nodes.push({classId,data});return {type:'node',id};
 }
 private intern(s:string):KryoValue{
  const old=this.stringIds.get(s);if(old!==undefined)return {type:'string',id:old};
  const id=this.graph.strings.length;this.graph.strings.push(s);this.stringIds.set(s,id);return {type:'string',id};
 }
 private primitive(p:KryoPrimitiveKind):KryoValue{
  const i=this.input;
  switch(p){
   case 'int':return {type:'int',value:i.readVarInt(false)};
   case 'long':return {type:'long',value:i.readVarLong(false)};
   case 'float':return {type:'float',bits:i.readFloatBits()};
   case 'double':return {type:'double',bits:i.readDoubleBits()};
   case 'boolean':return {type:'bool',value:i.readBoolean()};
   case 'short':return {type:'short',value:i.readShort()};
   case 'byte':return {type:'byte',value:i.readByte()};
   case 'char':return {type:'char',value:i.readChar()};
  }
 }
 private primitiveArray(p:KryoPrimitiveKind,length:number):KryoNodeData{
  const v=Array.from({length},()=>this.primitive(p));
  switch(p){
   case 'int':return {kind:'ints',values:v.map(x=>(x as {value:number}).value)};
   case 'short':return {kind:'shorts',values:v.map(x=>(x as {value:number}).value)};
   case 'byte':return {kind:'bytes',values:v.map(x=>(x as {value:number}).value)};
   case 'char':return {kind:'chars',values:v.map(x=>(x as {value:number}).value)};
   case 'boolean':return {kind:'booleans',values:v.map(x=>(x as {value:boolean}).value)};
   case 'long':return {kind:'longs',values:v.map(x=>(x as {value:bigint}).value)};
   case 'float':return {kind:'floats',bits:v.map(x=>(x as {bits:number}).bits)};
   case 'double':return {kind:'doubles',bits:v.map(x=>(x as {bits:bigint}).bits)};
  }
 }
 private readClassAndObject(depth:number):KryoValue{
  this.depth(depth);
  const c=this.readClass();return c===undefined?KNULL:this.readObject(c,false,depth);
 }
 private readObject(classId:number,mayBeNull:boolean,depth:number):KryoValue{
  this.depth(depth);
  const ref=this.refOrNull(classId,mayBeNull);
  if(ref.type==='null')return KNULL;
  if(ref.type==='existing')return ref.value;
  const slot=ref.slot,plan=this.plans[classId]!;
  let value:KryoValue;
  switch(plan.type){
   case 'fields':{
    const id=this.newNode(classId,slot);
    const values=plan.fields.map(f=>f.type==='dynamic'?this.readClassAndObject(depth+1):
     f.type==='primitive'?this.primitive(f.kind):this.readObject(f.classId,true,depth+1));
    this.graph.nodes[id]!.data={kind:'object',values};return {type:'node',id};
   }
   case 'collection':{
    const id=this.newNode(classId,slot);const length=this.count(this.input.readVarInt(true));
    const values:Array<KryoValue>=[];
    for(let i=0;i<length;i++)values.push(this.readClassAndObject(depth+1));
    this.graph.nodes[id]!.data={kind:'items',values};return {type:'node',id};
   }
   case 'map':{
    const length=this.count(this.input.readVarInt(true));const id=this.newNode(classId,slot);
    const entries:Array<[KryoValue,KryoValue]>=[];
    for(let i=0;i<length;i++)entries.push([this.readClassAndObject(depth+1),this.readClassAndObject(depth+1)]);
    this.graph.nodes[id]!.data={kind:'map',entries};return {type:'node',id};
   }
   case 'object-array':{
    const n=this.input.readVarInt(true);if(n===0)return KNULL;
    const length=this.count(n-1),id=this.newNode(classId,slot);const values:KryoValue[]=[];
    for(let i=0;i<length;i++)values.push(plan.sameType?this.readObject(plan.component,true,depth+1):this.readClassAndObject(depth+1));
    this.graph.nodes[id]!.data={kind:'items',values};return {type:'node',id};
   }
   case 'string':{const s=this.input.readString();value=s===null?KNULL:this.intern(s);break;}
   case 'boxed':value=this.primitive(plan.primitive);break;
   case 'enum':{
    const ordinal=this.input.readVarInt(true);
    value=ordinal===0?KNULL:{type:'enum',classId,ordinal:ordinal-1};break;
   }
   case 'calendar':{
    const timeZone=this.input.readString()??'';
    const c:KryoCalendar={timeZone,millis:this.input.readVarLong(true),lenient:this.input.readBoolean(),
      firstDayOfWeek:this.input.readVarInt(true),minimalDaysInFirstWeek:this.input.readVarInt(true),gregorianChange:this.input.readVarLong(false)};
    value=this.pushNode(classId,{kind:'calendar',value:c});break;
   }
   case 'string-array':{
    const n=this.input.readVarInt(true);if(n===0)return KNULL;
    const length=this.count(n-1),stringClass=this.classId('java.lang.String'),values:KryoValue[]=[];
    for(let i=0;i<length;i++)values.push(this.readObject(stringClass,true,depth+1));
    value=this.pushNode(classId,{kind:'items',values});break;
   }
   case 'primitive-array':{
    const n=this.input.readVarInt(true);if(n===0)return KNULL;
    value=this.pushNode(classId,this.primitiveArray(plan.primitive,this.count(n-1)));break;
   }
   case 'unsupported':this.error(`no reader for ${this.graph.classes[classId]!.name} (serializer ${plan.name})`);
  }
  if(value.type!=='null')this.putReference(slot,value);
  return value;
 }
 /** Reads all top-level writeClassAndObject calls; each is its own reference scope. */
 readAll():KryoGraph{
  while(!this.input.isAtEnd()){
   if(this.graph.roots.length>=this.max.maxRoots)this.error('too many roots');
   const root=this.readClassAndObject(0);
   this.graph.roots.push(root);this.nameIds.clear();this.references.length=0;
  }
  validateKryoGraph(this.graph);return this.graph;
 }
}
export function readKryoGraph(bytes:Uint8Array,schema:KryoSchema22,options:KryoReadOptions={}):KryoGraph{
 return new KryoStreamReader(bytes,schema,options).readAll();
}
