/** Fonte: datapack/src/database.rs::LayeredTree, removes/compose owner map.
 * Port do comportamento de sobreposição/removal; parser TOML/CSV segue dependência separada.
 * Efeitos: retorna um Map novo; não altera arquivos do chamador. */
export interface DbLayer {kind:'base'|'patch';files:ReadonlyMap<string,Uint8Array>;
 remove:{clubs:readonly string[];leagues:readonly string[];stateLeagues:readonly string[]};}
/** Port de `removes`: escopo da remoção é o próprio patch e todos os níveis inferiores. */
export function removesPath(layer:DbLayer,path:string):boolean {
 return layer.remove.clubs.some(id=>path.startsWith(`clubs/${id}/`))||
 layer.remove.leagues.some(s=>path===`leagues/${s.toLowerCase()}.toml`)||
 layer.remove.stateLeagues.some(s=>path===`state-leagues/${s.toLowerCase()}.toml`);
}
export interface ComposedDb {files:Map<string,Uint8Array>;owner:Map<string,number>;issues:string[];}
/** Port das regras de camadas: último patch prevalece, `remove` impede fontes antigas. */
export function composeLayers(layers:readonly DbLayer[]):ComposedDb {
 const issues:string[]=[],files=new Map<string,Uint8Array>(),owner=new Map<string,number>();
 if(!layers.length)issues.push('MissingManifest');
 else if(layers[0]!.kind==='patch')issues.push('PatchWithoutBase');
 for(let i=0;i<layers.length;i++){
  const layer=layers[i]!;
  for(const id of layer.remove.clubs)if(![...files.keys()].some(p=>p.startsWith(`clubs/${id}/`)))issues.push(`UnknownRemoval:${id}`);
  for(const id of layer.remove.leagues)if(!files.has(`leagues/${id.toLowerCase()}.toml`))issues.push(`UnknownRemoval:${id}`);
  for(const id of layer.remove.stateLeagues)if(!files.has(`state-leagues/${id.toLowerCase()}.toml`))issues.push(`UnknownRemoval:${id}`);
  for(const path of files.keys())if(removesPath(layer,path)){files.delete(path);owner.delete(path);}
  for(const [path,data] of layer.files){files.set(path,new Uint8Array(data));owner.set(path,i);}
 }
 return {files,owner,issues};
}
