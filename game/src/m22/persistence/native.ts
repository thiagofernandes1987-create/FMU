/** M22 partial port: persistence/src/native.rs .bfn skippable zstd metadata frame.
 * Input byte stream; output parsed header and payload offset. Decoding zstd/CBOR requires native codec.
 * Side effects: none; validates length/format before allocation; intentionally not an encoder. */
declare const require:(name:string)=>any;
const {TextDecoder,TextEncoder}=require('node:util');
export const BFN_FORMAT_VERSION=3, BFN_BACKUPS=3, BFN_EXTENSION='bfn';
export interface BfnHeader{meta:Record<string,unknown>;nextOffset:number;payload:Uint8Array}
export function decodeBfnHeader(bytes:Uint8Array):BfnHeader {
 if(bytes.byteLength<12)throw Error('Truncated BFN header');
 const d=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 const magic=d.getUint32(0,true),size=d.getUint32(4,true);
 if(magic!==0x184d2a50)throw Error('Invalid BFN skippable magic');
 if(size>bytes.byteLength-8 || size<4)throw Error('Invalid BFN metadata size');
 const tag=new TextDecoder().decode(bytes.subarray(8,12));if(tag!=='BFNX')throw Error('Invalid BFN metadata tag');
 const raw=new TextDecoder('utf-8',{fatal:true}).decode(bytes.subarray(12,8+size));
 const meta=JSON.parse(raw) as Record<string,unknown>;
 if(!meta||Array.isArray(meta)||typeof meta!=='object')throw Error('Invalid BFN metadata object');
 if(!Number.isInteger(meta.format_version)||Number(meta.format_version)>BFN_FORMAT_VERSION)throw Error('Unsupported future BFN format version');
 return {meta,nextOffset:8+size,payload:bytes.subarray(8+size)};
}
/** Utility for Rust-compatible header, useful for deterministic round-trip fixture testing. */
export function encodeBfnHeader(meta:Record<string,unknown>):Uint8Array {
 const bytes=new TextEncoder().encode('BFNX'+JSON.stringify({...meta,format_version:BFN_FORMAT_VERSION}));
 const a=new Uint8Array(bytes.length+8);const d=new DataView(a.buffer);
 d.setUint32(0,0x184d2a50,true);d.setUint32(4,bytes.length,true);a.set(bytes,8);return a;
}
