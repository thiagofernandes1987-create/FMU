/**
 * M24 — port parcial de `crates/persistence/examples/graph_stats.rs`.
 * Responsabilidade: contagem de instâncias/compartilhamentos e referências por
 * classe/campo a partir de um KryoGraph22 JÁ decodificado.
 * Depende de `src/m22/persistence/kryo_graph.ts`; não faz parse de `.s22` bruto.
 * Função pura: recebe objetos e retorna resumo ordenado, sem leitura de disco.
 * Testes: `tests/m24_persistence_examples.test.ts`.
 */
import {KryoGraph22,GraphValue} from '../../m22/persistence/kryo_graph';
export interface GraphClassStat {name:string;instances:number;shared:number;holders:{place:string;references:number}[];}
export function graphOwnershipStats(graph:KryoGraph22,only?:string,top=8):GraphClassStat[]{
 if(!Number.isInteger(top)||top<0||top>100)throw Error('Invalid graph holder limit');
 const incoming=new Array(graph.nodes.length).fill(0) as number[];
 const holders=new Map<string,Map<string,number>>();
 const visit=(value:GraphValue,place:string):void=>{
  if(Array.isArray(value)){for(const item of value)visit(item,place+'[]');return;}
  if(value===null||typeof value!=='object'||!('node' in value))return;
  const id=value.node;
  if(!Number.isInteger(id)||id<0||id>=graph.nodes.length)throw Error('Out-of-range Kryo reference');
  incoming[id]!++;
  const name=graph.className(graph.nodes[id]!.classId);
  let by=holders.get(name);if(!by){by=new Map();holders.set(name,by);}
  by.set(place,(by.get(place)??0)+1);
 };
 graph.nodes.forEach(node=>{
  const owner=graph.className(node.classId),schema=graph.classes[node.classId];
  if(!schema)throw Error('Unknown Kryo class');
  if(Array.isArray(node.data))node.data.forEach((v,i)=>visit(v,owner+'['+i+']'));
  else for(const [field,v] of Object.entries(node.data))visit(v,owner+'.'+field);
 });
 const counts=new Map<string,{instances:number;shared:number}>();
 graph.nodes.forEach((n,i)=>{
  const name=graph.className(n.classId),v=counts.get(name)??{instances:0,shared:0};
  v.instances++;if(incoming[i]!>1)v.shared++;counts.set(name,v);
 });
 return [...counts].filter(([name])=>!only||name===only).sort((a,b)=>a[0].localeCompare(b[0])).map(([name,c])=>({
  name,...c,holders:[...(holders.get(name)?.entries()??[])].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,only?100:top).map(([place,references])=>({place,references}))
 }));
}
