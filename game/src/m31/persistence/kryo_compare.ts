/**
 * Differential reporter derived from the first_difference() of Rust
 * crates/{simulation,systems}/tests/world.rs. Only compares actual golden
 * canonical dumps; absence of original fixture must be reported UNVERIFIED.
 */
export interface CanonicalDifference {line:number;fieldTrail:string[];actualContext:string;expectedContext:string;actualLine:string|undefined;expectedLine:string|undefined;}
export type CanonicalCheck={status:'PASS'|'FAIL'|'UNVERIFIED';difference?:CanonicalDifference;reason?:string};
export function firstCanonicalDifference(actual:string,expected:string):CanonicalDifference|undefined {
 const lines=(s:string)=>{const x=s.replace(/\r\n/g,'\n').split('\n');if(x.at(-1)==='')x.pop();return x;};
 const a=lines(actual),e=lines(expected);
 let i=0;while(i<Math.min(a.length,e.length)&&a[i]===e[i])i++;
 if(i===a.length&&i===e.length)return undefined;
 const start=Math.max(0,i-4),end=(xs:string[])=>Math.min(xs.length,i+4);
 return {line:i+1,fieldTrail:e.slice(0,i).reverse().filter(l=>l.startsWith('.')).slice(0,6),
  actualContext:a.slice(start,end(a)).join('\n'),expectedContext:e.slice(start,end(e)).join('\n'),
  actualLine:a[i],expectedLine:e[i]};
}
/** Provenance and the raw input SHA are intentionally required for a PASS. */
declare function require(name:string):any;
const crypto=require('node:crypto');
export function checkCanonicalAgainstGolden(actual:string,expected:string|undefined,input:Uint8Array|undefined,provenance?:{rustCommit:string;inputSha256:string;binarySha256:string}):CanonicalCheck {
 if(expected===undefined)return {status:'UNVERIFIED',reason:'Original Java/Rust canonical fixture not supplied'};
 if(!input||!provenance||!/^[a-f0-9]{7,40}$/.test(provenance.rustCommit)||![provenance.inputSha256,provenance.binarySha256].every(x=>/^[a-f0-9]{64}$/.test(x)))
  return {status:'UNVERIFIED',reason:'Canonical golden missing verified source/binary provenance'};
 const digest=crypto.createHash('sha256').update(input).digest('hex');
 if(digest!==provenance.inputSha256)return {status:'UNVERIFIED',reason:'Canonical golden belongs to a different input SHA-256'};
 const difference=firstCanonicalDifference(actual,expected);
 return difference?{status:'FAIL',difference}:{status:'PASS'};
}
