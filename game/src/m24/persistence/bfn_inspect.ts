/**
 * M24 — adaptação de leitura de metadados da ferramenta Rust
 * `crates/persistence/examples/open_bfn.rs`.
 * Entrada: Uint8Array do `.bfn`, não inclui acesso ao disco.
 * Dependências: decodeBfnHeader da crate persistence M22.
 * Saída: versão/campos da cabeçalho, `worldLoaded=false` explícito.
 * NÃO alegar leitura de temporada/clubes sem CBOR+Zstd World reais.
 */
import {decodeBfnHeader} from '../../m22/persistence/native';
export interface BfnInspection {formatVersion:number;payloadBytes:number;worldLoaded:false;fields:string[];}
export function inspectBfnMetadata(bytes:Uint8Array):BfnInspection {
 const parsed=decodeBfnHeader(bytes),version=parsed.meta.format_version;
 if(typeof version!=='number'||!Number.isInteger(version))throw Error('Invalid BFN format version');
 return {formatVersion:version,payloadBytes:parsed.payload.byteLength,worldLoaded:false,fields:Object.keys(parsed.meta).sort()};
}
