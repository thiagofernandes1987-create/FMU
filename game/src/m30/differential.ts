/**
 * FMU M30 — strict Rust/TS differential harness, with zero simulated parity.
 *
 * The original Brasfoot Next source has tests that require actual `.s22` golden
 * fixtures and executed Rust reference traces. This module verifies provenance
 * and compares nested `World`, RNG and event traces field-by-field.
 * It cannot manufacture a Rust golden fixture or assert production parity.
 *
 * Source convention: crates/model/rng.rs and crates/systems/tests/simulation.rs.
 */
declare function require(name:string):any;
const crypto=require('node:crypto');
export type RuntimeTrace={world:unknown;rng:unknown;events:unknown;};
export type RustGolden={kind:'rust-executed';rustCommit:string;rustBinarySha256:string;
 inputSha256:string;trace:RuntimeTrace;title:string;};
export type Difference={path:string;reference:string;typescript:string};
export type DifferentialResult={status:'PASS'|'FAIL'|'UNVERIFIED';differences:Difference[];
 rustCommit?:string;reason?:string;referenceDigest?:string;typescriptDigest?:string;};
const isSha=(s:unknown):s is string=>typeof s==='string'&&/^[0-9a-f]{64}$/.test(s);
function canonicalInner(x:unknown,seen:WeakSet<object>,depth:number):string{
 if(depth>256)throw Error('Canonical depth exceeded');
 if(x===null)return 'null';
 if(typeof x==='undefined')return 'undefined';
 if(typeof x==='boolean')return x?'true':'false';
 if(typeof x==='string')return 's:'+JSON.stringify(x);
 if(typeof x==='bigint')return 'i:'+x.toString();
 if(typeof x==='number'){
  if(Object.is(x,-0))return 'n:-0';if(Number.isNaN(x))return 'n:NaN';
  if(x===Infinity)return 'n:Infinity';if(x===-Infinity)return 'n:-Infinity';return 'n:'+x;
 }
 if(typeof x!=='object')throw Error('Unsupported canonical value');
 if(seen.has(x))throw Error('Cyclic World cannot be canonicalized without arena IDs');
 seen.add(x);
 let out:string;
 if(x instanceof Uint8Array)out='bytes:'+require('node:buffer').Buffer.from(x).toString('hex');
 else if(Array.isArray(x))out='['+x.map(v=>canonicalInner(v,seen,depth+1)).join(',')+']';
 else if(x instanceof Map){const entries=Array.from(x,([k,v])=>[canonicalInner(k,seen,depth+1),canonicalInner(v,seen,depth+1)] as const);
  entries.sort((a,b)=>a[0].localeCompare(b[0]));out='map{'+entries.map(([k,v])=>k+':'+v).join(',')+'}';}
 else{
  const obj=x as Record<string,unknown>,keys=Object.keys(obj).sort();
  out='obj{'+keys.map(k=>JSON.stringify(k)+':'+canonicalInner(obj[k],seen,depth+1)).join(',')+'}';
 }
 seen.delete(x);return out;
}
export function canonical(x:unknown):string{return canonicalInner(x,new WeakSet(),0);}
export function shaCanonical(x:unknown):string{return crypto.createHash('sha256').update(canonical(x)).digest('hex');}
const preview=(v:unknown)=>{let s:string;try{s=canonical(v);}catch{s=String(v);}return s.length>180?s.slice(0,180)+'…':s;};
export function compareTraces(reference:RuntimeTrace,typescript:RuntimeTrace,maxDifferences=200):Difference[]{
 if(!Number.isInteger(maxDifferences)||maxDifferences<1||maxDifferences>10_000)throw Error('Invalid diff limit');
 const result:Difference[]=[];
 function compare(a:unknown,b:unknown,path:string,depth:number):void {
  if(result.length>=maxDifferences)return;
  if(depth>256)throw Error('Differential depth exceeded');
  if(canonical(a)===canonical(b))return;
  if(a!==null&&b!==null&&typeof a==='object'&&typeof b==='object'){
   if(Array.isArray(a)&&Array.isArray(b)){
    const n=Math.max(a.length,b.length);for(let i=0;i<n;i++)compare(a[i],b[i],`${path}[${i}]`,depth+1);return;
   }
   if(a instanceof Map&&b instanceof Map){
    const aa=new Map(Array.from(a,([k,v])=>[canonical(k),v]));const bb=new Map(Array.from(b,([k,v])=>[canonical(k),v]));
    for(const k of [...new Set([...aa.keys(),...bb.keys()])].sort())compare(aa.get(k),bb.get(k),`${path}{${k}}`,depth+1);return;
   }
   if(!(a instanceof Uint8Array)&&!(b instanceof Uint8Array)&&!Array.isArray(a)&&!Array.isArray(b)&&!(a instanceof Map)&&!(b instanceof Map)){
    const x=a as Record<string,unknown>,y=b as Record<string,unknown>;
    for(const key of [...new Set([...Object.keys(x),...Object.keys(y)])].sort()){
     const suffix=/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)?'.'+key:'['+JSON.stringify(key)+']';
     compare(x[key],y[key],path+suffix,depth+1);
    }return;
   }
  }
  result.push({path,reference:preview(a),typescript:preview(b)});
 }
 compare(reference.world,typescript.world,'$.world',0);
 compare(reference.rng,typescript.rng,'$.rng',0);
 compare(reference.events,typescript.events,'$.events',0);
 return result;
}
/** Fails closed without a real executed Rust golden and matching raw input SHA. */
export function verifyDifferential(input:Uint8Array,typescript:RuntimeTrace,golden?:RustGolden):DifferentialResult{
 if(!golden)return {status:'UNVERIFIED',reason:'No executed Rust golden fixture was provided',differences:[]};
 if(golden.kind!=='rust-executed'||!isSha(golden.rustBinarySha256)||!isSha(golden.inputSha256)
  ||typeof golden.rustCommit!=='string'||!/^[0-9a-f]{7,40}$/.test(golden.rustCommit)||!golden.title)
  return {status:'UNVERIFIED',reason:'Invalid Rust golden provenance',differences:[]};
 const inputHash=crypto.createHash('sha256').update(input).digest('hex');
 if(inputHash!==golden.inputSha256)return {status:'UNVERIFIED',reason:'Golden input SHA does not match supplied .bfn/.s22',differences:[]};
 const differences=compareTraces(golden.trace,typescript);
 return {status:differences.length?'FAIL':'PASS',differences,rustCommit:golden.rustCommit,
  referenceDigest:shaCanonical(golden.trace),typescriptDigest:shaCanonical(typescript)};
}
