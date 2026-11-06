/**
 * M24 — port funcional da rotina `collect` + diff de
 * `crates/persistence/examples/bfn_schema_diff.rs` para estruturas JSON.
 * Origem Rust coleta mapas, array path[] e valores textuais de `class`.
 * Entrada: duas árvores já decodificadas (não descompacta Zstd nem CBOR).
 * Saída: diferenças por caminho e classes não escritas; sem efeitos colaterais.
 */
export interface SchemaDifference {path:string;oldOnly:string[];newOnly:string[];}
export interface SchemaDiffResult {fieldChanges:SchemaDifference[];removedClasses:{path:string;classes:string[]}[];}
interface Traced {maps:Map<string,Set<string>>;classes:Map<string,Set<string>>;}
function collectJson(node:unknown,path:string,result:Traced):void {
 if(Array.isArray(node)){for(const v of node)collectJson(v,path+'[]',result);return;}
 if(node===null||typeof node!=='object')return;
 const items=Object.entries(node as Record<string,unknown>);
 let fields=result.maps.get(path);if(!fields){fields=new Set();result.maps.set(path,fields);}
 for(const [k,v] of items){fields.add(k);if(k==='class'&&typeof v==='string'){
   let classes=result.classes.get(path);if(!classes){classes=new Set();result.classes.set(path,classes);}
   classes.add(v);
  }
  collectJson(v,path+'.'+k,result);
 }
}
export function compareDecodedSchemas(previous:unknown,current:unknown):SchemaDiffResult {
 const a:Traced={maps:new Map(),classes:new Map()},b:Traced={maps:new Map(),classes:new Map()};
 collectJson(previous,'',a);collectJson(current,'',b);
 const changes:SchemaDifference[]=[];
 for(const path of [...new Set([...a.maps.keys(),...b.maps.keys()])].sort()){
  const old=a.maps.get(path),now=b.maps.get(path);if(!old||!now)continue;
  const oldOnly=[...old].filter(k=>!now.has(k)).sort(),newOnly=[...now].filter(k=>!old.has(k)).sort();
  if(oldOnly.length||newOnly.length)changes.push({path,oldOnly,newOnly});
 }
 const removedClasses=[...a.classes].sort((x,y)=>x[0].localeCompare(y[0]))
 .map(([path,v])=>({path,classes:[...v].filter(c=>!(b.classes.get(path)?.has(c))).sort()}))
 .filter(row=>row.classes.length);
 return {fieldChanges:changes,removedClasses};
}
