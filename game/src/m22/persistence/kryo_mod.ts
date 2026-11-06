/** M22 partial port: persistence/src/kryo/mod.rs::KryoError and bounded read errors.
 * Error messages include byte position; used by parser boundary and tests. */
export class KryoParseError extends Error {
 constructor(readonly position:number,message:string){super(`kryo: ${message} (at byte ${position})`);this.name='KryoParseError';}
}
/** Checked range of byte arrays, no allocations for oversized or negative offsets. */
export function kryoCheckedSlice(data:Uint8Array,position:number,length:number):Uint8Array {
 if(!Number.isSafeInteger(position)||!Number.isSafeInteger(length)||position<0||length<0||position+length>data.length)
  throw new KryoParseError(position,'unexpected end of file');
 return data.subarray(position,position+length);
}
