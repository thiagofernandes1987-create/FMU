/** Fonte: persistence/src/kryo/graph.rs. Grafo de objetos compartilhados do save.
 * Dependências: valores tipados e IDs, nenhum parser de bytes. O método field exige índice válido. */
export type GraphValue = null|boolean|number|string|{node:number}|GraphValue[];
export interface GraphClass {name:string;fields:string[];}
export interface GraphNode {classId:number;data:Record<string,GraphValue>|GraphValue[];}
export class KryoGraph22 {
 constructor(readonly classes:readonly GraphClass[],readonly nodes:readonly GraphNode[]){}
 node(id:number):GraphNode {const n=this.nodes[id];if(!n)throw RangeError('Invalid Kryo node '+id);return n;}
 className(id:number):string {const c=this.classes[id];if(!c)throw RangeError('Invalid Kryo class '+id);return c.name;}
 /** `Graph::field`: registra nomes de campos definidos pelo esquema Rust. */
 field(nodeId:number,name:string):GraphValue|undefined {
  const node=this.node(nodeId),cls=this.classes[node.classId];if(!cls)throw Error('Node with unknown class');
  if(!cls.fields.includes(name))return undefined;
  return Array.isArray(node.data)?node.data[cls.fields.indexOf(name)]:node.data[name];
 }
}
