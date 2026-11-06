/** M21 — crates/datapack/src/tree.rs, implementação de FileTree e camadas.
 * MemTree armazena cópia dos bytes; DirectoryTree recebe scanner callbacks do
 * consumidor para permitir uso browser/Node; `from_zip` requer extração externa.
 * LayeredTree prioriza camada posterior e suporta remoções condicionais.
 * Não permite path traversal. Testes: m21_datapack. */
export interface FileTree {files():string[];read(path:string):Uint8Array;}
function safe(path:string):boolean{return path!==''&&!path.split('/').some(p=>p===''||p==='..'||p.startsWith('.'));}
export class MemTree implements FileTree{
 private data=new Map<string,Uint8Array>();
 insert(path:string,bytes:Uint8Array):void{if(!safe(path))throw new RangeError('Unsafe pack path');this.data.set(path,bytes.slice());}
 files():string[]{return [...this.data.keys()].sort();}
 read(path:string):Uint8Array{const data=this.data.get(path);if(!data)throw new Error('FileTree NotFound '+path);return data.slice();}
 /** Adapta arquivos do ZIP já extraídos, sem introduzir dependência de compressor. */
 static fromExtracted(entries:Iterable<readonly [string,Uint8Array]>):MemTree{
  const pairs=[...entries],files=new MemTree();
  const hasManifest=pairs.some(x=>x[0]==='manifest.toml');
  let prefix='';
  if(!hasManifest){const candidates=pairs.map(x=>x[0]).filter(s=>s.endsWith('/manifest.toml'));
   for(const c of candidates){const folder=c.slice(0,c.indexOf('/')+1);if(pairs.every(x=>x[0].startsWith(folder))){prefix=folder;break;}}
  }
  for(const [name,bytes] of pairs){const path=name.slice(prefix.length);if(safe(path))files.insert(path,bytes);}
  return files;
 }
}
export class LayeredTree implements FileTree {
 private owner=new Map<string,number>();
 constructor(private readonly layers:readonly FileTree[],removed:(layer:number,path:string)=>boolean){
  layers.forEach((layer,i)=>{
   for(const path of [...this.owner.keys()])if(removed(i,path))this.owner.delete(path);
   for(const path of layer.files())if(path!=='manifest.toml')this.owner.set(path,i);
  });
 }
 layerOf(path:string):number|undefined{return this.owner.get(path);}
 files():string[]{return [...this.owner.keys()].sort();}
 read(path:string):Uint8Array{const i=this.owner.get(path);if(i===undefined)throw new Error('FileTree NotFound '+path);return this.layers[i]!.read(path);}
}
/** Origem DirTree.files: injeção de itens em lugar de leitura de diretório nativa. */
export function directoryTree(files:Iterable<readonly [string,Uint8Array]>):MemTree{
 return MemTree.fromExtracted(files);
}
