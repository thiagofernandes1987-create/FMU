/**
 * M31 — wire-level preflight for Brasfoot Next legacy saves.
 * Equivalent entry/root/arena checks to persistence/src/import/mod.rs.
 * Unlike M25 stageS22Import this starts with **raw Kryo bytes**, and preserves
 * the full typed graph (i64, floating bits, enum, maps, loops).
 * Does NOT claim `World` conversion; generated/11 convert_* functions remain
 * unported, and real game schema must be supplied externally.
 */
import {KryoSchema22} from '../../m22/persistence/kryo_schema';
import {arenaOfClass,ArenaName} from '../../m22/persistence/import_context';
import {KryoGraph,KryoValue,validateKryoGraph} from './kryo_graph';
import {readKryoGraph,KryoReadOptions} from './kryo_reader';
export interface S22BinaryPreflight {worldLoaded:false;roots:readonly [number,number];nodeCount:number;
 schemaClasses:number;arenas:Readonly<Record<ArenaName,readonly number[]>>;classCounts:Readonly<Record<string,number>>;graph:KryoGraph;}
const rootClass=(graph:KryoGraph,value:KryoValue|undefined,index:0|1,expected:string):number=>{
 if(!value||value.type!=='node')throw Error(`Not a Brasfoot .s22 save: root ${index} is not a ${expected} node`);
 const id=value.id;
 if(graph.classes[graph.nodes[id]!.classId]!.name!==expected)throw Error(`Not a Brasfoot .s22 save: root ${index} must be ${expected}`);
 return id;
};
/** Strict boundary for real two-root `.s22`; extra roots are not silently imported. */
export function stageTypedS22Graph(graph:KryoGraph):S22BinaryPreflight {
 validateKryoGraph(graph);
 if(graph.roots.length!==2)throw Error(`Not a Brasfoot .s22 save: expected exactly 2 roots, got ${graph.roots.length}`);
 const game=rootClass(graph,graph.roots[0],0,'best.f'),jobs=rootClass(graph,graph.roots[1],1,'best.ay');
 const names=['Player','Club','Coach','Stadium','Match','Country','StateLeague','Stage','Competition'] as const;
 const arenas=Object.fromEntries(names.map(n=>[n,[] as number[]])) as Record<ArenaName,number[]>;
 const summary:Record<string,number>=Object.create(null);
 for(const [id,n] of graph.nodes.entries()){
  const name=graph.classes[n.classId]!.name;summary[name]=(summary[name]??0)+1;
  const arena=arenaOfClass(name);if(arena)arenas[arena].push(id);
 }
 for(const n of names)Object.freeze(arenas[n]);
 return {worldLoaded:false,roots:[game,jobs],nodeCount:graph.nodes.length,
  schemaClasses:graph.classes.length,arenas:Object.freeze(arenas),classCounts:Object.freeze(summary),graph};
}
/** Actual binary reader + graph-staging pipeline. Import to World is a separate operation. */
export function preflightS22Bytes(bytes:Uint8Array,schema:KryoSchema22,opts:KryoReadOptions={}):S22BinaryPreflight {
 return stageTypedS22Graph(readKryoGraph(bytes,schema,opts));
}
