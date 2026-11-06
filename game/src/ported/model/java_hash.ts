/** M21 — crates/model/src/java_hash.rs: Java UTF-16 hash + HashMap iteration order.
 * Contratos: somente put/get/computeIfAbsent (Rust não implementa remove); ordem
 * dos bins por capacidade e inserção. Árvores com >=9 colisões em cap>=64 não
 * são reproduzidas na própria fonte Rust — preservada esta limitação. */
export function javaHash(value:string|number):number{
 if(typeof value==='number'){
  if(!Number.isInteger(value)||value<-(2**31)||value>2**31-1)throw new RangeError('Expected Java Integer');
  return value|0;
 }
 let hash=0;for(let i=0;i<value.length;i++)hash=(Math.imul(hash,31)+value.charCodeAt(i))|0;
 return hash;
}
function spread(hash:number):number{return (hash^(hash>>>16))>>>0;}
export class JavaHashMap<V>{
 private entriesArray:[string|number,V][]=[];
 private hashes:number[]=[];
 private lookup=new Map<string|number,number>();
 private bins:number[]=Array(16).fill(0);
 private capacity=16;
 len():number{return this.entriesArray.length;}
 isEmpty():boolean{return this.len()===0;}
 containsKey(key:string|number):boolean{return this.lookup.has(key);}
 get(key:string|number):V|undefined{return this.lookup.has(key)?this.entriesArray[this.lookup.get(key)!]![1]:undefined;}
 /** Java `put`: atualiza valor sem mudar ordem da chave. */
 insert(key:string|number,value:V):void{
  const old=this.lookup.get(key);
  if(old!==undefined){this.entriesArray[old]![1]=value;return;}
  this.add(key,value);
 }
 entryOrInsertWith(key:string|number,f:()=>V):V{
  const old=this.lookup.get(key);if(old!==undefined)return this.entriesArray[old]![1];
  const result=f();this.add(key,result);return result;
 }
 private add(key:string|number,value:V):void{
  const h=spread(javaHash(key)),bucket=h&(this.capacity-1),before=this.bins[bucket]!;
  this.bins[bucket]=before+1;
  this.lookup.set(key,this.len());this.entriesArray.push([key,value]);this.hashes.push(h);
  if(before>=8&&this.capacity<64)this.resize();
  if(this.len()>Math.trunc(this.capacity/4)*3)this.resize();
 }
 private resize():void{
  this.capacity*=2;this.bins=Array(this.capacity).fill(0);
  for(const h of this.hashes)this.bins[h&(this.capacity-1)]!++;
 }
 /** Ordenação Java: bucket final crescente, insertion order dentro do bucket. */
 entries():[string|number,V][]{
  return this.entriesArray.map((pair,i)=>({pair,index:i,bucket:this.hashes[i]!&(this.capacity-1)}))
   .sort((a,b)=>a.bucket-b.bucket||a.index-b.index).map(x=>[x.pair[0],x.pair[1]]);
 }
 values():V[]{return this.entries().map(x=>x[1]);}
 intoValues():V[]{return this.values();}
 capacityForTest():number{return this.capacity;}
}
