/** Fonte: datapack/src/pack.rs. Particionamento determinístico de assets e índice.
 * Entradas: paths relativos, chunks validados; efeitos: nenhum; consumidores: downloader/importador.
 * O ZIP binário e SHA-256 de chunk são responsabilidade do empacotador, não deste DTO. */
export interface PackChunk { file:string; sha256:string; size:number; files:number; }
export interface PackIndex { format:number; manifest:unknown; commit?:string; chunks:PackChunk[]; }
/** Port de `chunk_name`: imagens agrupadas por área ou inicial do país, dados em data.zip. */
export function chunkName(path:string):string {
 if(!path.endsWith('.png'))return 'data.zip';
 const parts=path.split('/');
 if(parts[0]==='clubs'&&parts.length>=3)return `clubs-${[...parts[1]!][0]??'_'}.zip`;
 if(parts.length>=2)return `${parts[0]}.zip`;
 return 'data.zip';
}
/** `PackIndex::total_size`, exige tamanhos inteiros seguros e não negativos. */
export function packTotalSize(index:PackIndex):number {
 let size=0;for(const c of index.chunks){if(!Number.isSafeInteger(c.size)||c.size<0)throw Error('Invalid chunk size');size+=c.size;}
 if(!Number.isSafeInteger(size))throw Error('Unsafe total chunk size');return size;
}
/** `parse_index`: parseia e valida forma, não valida a integridade dos chunks. */
export function parsePackIndex(text:string):PackIndex{
 const x=JSON.parse(text) as PackIndex;
 if(!x||!Number.isInteger(x.format)||!Array.isArray(x.chunks)||x.chunks.some(c=>typeof c.file!=='string'||!/^[a-f0-9]{64}$/.test(c.sha256)||!Number.isSafeInteger(c.files)||c.files<0))throw Error('Invalid pack index');
 packTotalSize(x);return x;
}
