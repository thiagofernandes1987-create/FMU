/**
 * FMU M25 — `persistence/src/import/mod.rs` (partial, graph-level).
 * FONTE: Rust Brafoot Next bd2ccbd, GPL-3.0-only; `ImportError`, `import_graph`,
 * `convert_world` root checks and arena enumeration.
 * RESPONSABILIDADE: validar as duas raízes Kryo (`best.f`, `best.ay`) antes de
 *   preparar a importação; enumerar as arenas de entidades compartilhadas
 *   preservando índices e referências sem copiar nem inventar dados.
 * DEPENDÊNCIAS: `KryoGraph22`, `GraphValue`, `arenaOfClass`, `buildArenaIndex`.
 * ENTRADA: grafo JÁ DECODIFICADO por um parser Kryo externo + raízes.
 * SAÍDA: plano imutável para conversor real; `worldLoaded:false` explícito.
 * EFEITOS: nenhum sobre o grafo, banco, UI ou disco; erros estruturais geram
 *   `S22NotASaveError` em vez de importar um World inválido.
 * LIMITAÇÕES: o parser completo `.s22` e os 11 `convert_*` do Rust NÃO estão
 *   ligados; este módulo **não carrega save binário** nem cria `World` jogável.
 * REGRESSÕES: tests/m25_import_s22_graph.test.ts.
 */
import {KryoGraph22,GraphValue} from '../../m22/persistence/kryo_graph';
import {ArenaName,buildArenaIndex} from '../../m22/persistence/import_context';
export class S22NotASaveError extends Error {
 constructor(message:string){super(`import: not a Brasfoot save (${message})`);this.name='S22NotASaveError';}
}
export const S22_ROOT_CLASSES=['best.f','best.ay'] as const;
export const S22_ARENAS:readonly ArenaName[]=[
 'Player','Club','Coach','Stadium','Match','Competition','Stage','Country','StateLeague'
] as const;
export interface S22ImportPlan {
 gameNode:number;jobMarketNode:number;
 arenas:Record<ArenaName,readonly number[]>;
 classSummary:Readonly<Record<string,number>>;
 nodeCount:number;worldLoaded:false;
 /** Roots copied for inspectability, never interpreted as fully converted. */
 roots:readonly [number,number];
}
/** `convert_world` first validates root 0 and 1 have the expected class names. */
export function s22RootNode(graph:KryoGraph22,root:GraphValue|undefined,index:0|1):number {
 const expected=S22_ROOT_CLASSES[index];
 if(!root||typeof root!=='object'||Array.isArray(root)||!('node' in root))
  throw new S22NotASaveError(`root ${index} is not a class ${expected} reference`);
 const id=root.node;
 if(!Number.isSafeInteger(id)||id<0)throw new S22NotASaveError(`root ${index} has invalid node ID`);
 let actual:string;
 try{const node=graph.node(id);actual=graph.className(node.classId);}
 catch{throw new S22NotASaveError(`root ${index} refers to unavailable object`);}
 if(actual!==expected)throw new S22NotASaveError(`root ${index}: expected ${expected}, got ${actual}`);
 return id;
}
/** `import_graph` boundary: verifica esquema, referências e arenas. Não converte campos. */
export function stageS22Import(graph:KryoGraph22,roots:readonly GraphValue[]):S22ImportPlan {
 if(!Array.isArray(roots)||roots.length<2)throw new S22NotASaveError('missing game or job market root');
 const game=s22RootNode(graph,roots[0],0),market=s22RootNode(graph,roots[1],1);
 const classes:{id:number;className:string}[]=[],summary:Record<string,number>=Object.create(null);
 for(let id=0;id<graph.nodes.length;id++){
  const node=graph.node(id);let className:string;
  try{className=graph.className(node.classId);}
  catch{throw new S22NotASaveError(`node ${id} has unknown class`);}
  classes.push({id,className});summary[className]=(summary[className]??0)+1;
  // Não resolvemos referências profundas; garantimos ao menos IDs e formas dos nós.
  if(!node.data||typeof node.data!=='object')throw new S22NotASaveError(`node ${id} has invalid payload`);
 }
 const byArena=buildArenaIndex(classes);
 const arenas=Object.freeze(Object.fromEntries(S22_ARENAS.map(a=>[a,Object.freeze([...(byArena[a]??[])])]))) as Record<ArenaName,readonly number[]>;
 return Object.freeze({gameNode:game,jobMarketNode:market,arenas,classSummary:Object.freeze(summary),
  roots:Object.freeze([game,market]) as readonly [number,number],nodeCount:graph.nodes.length,worldLoaded:false as const});
}
/** Inspeção referencial opcional para detectar ponteiros Kryo inválidos em campos.
 * Não é validação semântica de todos os campos do jogo Rust. */
export function validateS22NodeReferences(graph:KryoGraph22,maxDepth=32):{references:number;invalid:number[]} {
 if(!Number.isInteger(maxDepth)||maxDepth<1||maxDepth>512)throw Error('Invalid reference depth');
 let refs=0;const invalid:number[]=[];
 const walk=(v:GraphValue,depth:number):void=>{
  if(depth>maxDepth)throw new S22NotASaveError('nested value depth exceeded');
  if(v===null||typeof v!=='object')return;
  if(Array.isArray(v)){for(const item of v)walk(item,depth+1);return;}
  if('node' in v){refs++;const id=v.node;
   if(!Number.isSafeInteger(id)||id<0||id>=graph.nodes.length)invalid.push(id);
  }
 };
 for(const n of graph.nodes){const values=Array.isArray(n.data)?n.data:Object.values(n.data);
  for(const v of values)walk(v,0);
 }
 return {references:refs,invalid};
}
