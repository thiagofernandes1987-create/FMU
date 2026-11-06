/**
 * M26 — leitor/escritor REAL do envelope nativo `.bfn` (Rust native.rs).
 * Frames: skippable zstd [magic BF NX + SaveMeta JSON] + quadro Zstandard com CBOR.
 * Dependências: Node.js 22.16+ zlib zstd, `src/m22/persistence/native`, `cbor.ts`.
 * Efeitos: nenhum disco alterado; codec puro in-memory, limite 64 MiB descomprimidos.
 * Não confundir CBOR decodificado com `World` validado: `worldLoaded=false`.
 * CBOR migration v1/v2 requer validação semântica; fica `migrationRequired=true`.
 * Testes: `tests/m26_bfn_codec.test.ts`.
 */
declare function require(name:string):any;
const zlib=require('node:zlib');
import {decodeBfnHeader,BFN_FORMAT_VERSION,encodeBfnHeader} from '../../m22/persistence/native';
import {decodeCbor,encodeCbor,CborValue} from './cbor';
export interface BfnDecoded {meta:Readonly<Record<string,unknown>>;payload:CborValue; worldLoaded:false;migrationRequired:boolean; compressedBytes:number; }
const MAX_COMPRESSED=64*1024*1024,MAX_UNCOMPRESSED=64*1024*1024;
/** `native::decode_save` until CBOR decode; validates decompression boundaries. */
export function readBfnPayload(bytes:Uint8Array):BfnDecoded {
 if(bytes.length>MAX_COMPRESSED)throw Error('BFN exceeds compressed size limit');
 const {meta,payload}=decodeBfnHeader(bytes);
 if(payload.length<4)throw Error('Missing zstd payload');
 const version=meta.format_version;
 if(!Number.isInteger(version)||Number(version)<1||Number(version)>BFN_FORMAT_VERSION)throw Error('Invalid BFN format version');
 let raw:Uint8Array;
 try{raw=zlib.zstdDecompressSync(payload,{maxOutputLength:MAX_UNCOMPRESSED}) as Uint8Array;}
 catch(e){throw new Error('BFN zstd decode failed: '+(e instanceof Error?e.message:String(e)));}
 return {meta,payload:decodeCbor(raw),worldLoaded:false,migrationRequired:Number(version)<BFN_FORMAT_VERSION,compressedBytes:payload.length};
}
/** `native::encode_save`: frame Rust-compatible; lossless for supported CBOR values. */
export function writeBfnPayload(meta:Readonly<Record<string,unknown>>,value:CborValue):Uint8Array {
 const header=encodeBfnHeader({...meta});
 const cbor=encodeCbor(value,{allowNonFinite:true});
 if(cbor.length>MAX_UNCOMPRESSED)throw Error('BFN payload too large');
 const packed=zlib.zstdCompressSync(cbor,{level:3,params:{[zlib.constants.ZSTD_c_checksumFlag]:1}}) as Uint8Array;
 if(packed.length>MAX_COMPRESSED)throw Error('BFN compressed frame too large');
 const result=new Uint8Array(header.length+packed.length);result.set(header);result.set(packed,header.length);return result;
}
/** Read-only preview of real `.bfn` structure. NO automatic import to DemoCareer. */
export function summarizeBfnPayload(save:BfnDecoded):{version:number;season:number|undefined;topFields:string[];worldLoaded:false;migrationRequired:boolean} {
 const obj=save.payload;
 return {version:Number(save.meta.format_version),season:typeof save.meta.season==='number'?save.meta.season:undefined,
  topFields:obj&&typeof obj==='object'&&!Array.isArray(obj)&&!(obj instanceof Map)&&!(obj instanceof Uint8Array)&&!('tag' in obj)?Object.keys(obj).sort():[],
  worldLoaded:false,migrationRequired:save.migrationRequired};
}
