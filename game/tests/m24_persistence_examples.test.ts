/** M24 regressões de exemplos de persistência; parser Rust bruto ainda não portado. */
declare function require(name:string):any;
const test=require('node:test'),assert=require('node:assert/strict');
import {KryoGraph22} from '../src/m22/persistence/kryo_graph';
import {graphOwnershipStats} from '../src/m24/persistence/graph_stats';
import {compareDecodedSchemas} from '../src/m24/persistence/schema_diff';
import {inspectBfnMetadata} from '../src/m24/persistence/bfn_inspect';
import {encodeBfnHeader} from '../src/m22/persistence/native';
const graph=()=>new KryoGraph22([
  {name:'Team',fields:['first','second']},{name:'Player',fields:['name']}
 ],[
  {classId:0,data:{first:{node:1},second:{node:1}}},
  {classId:1,data:{name:'A'}},
  {classId:1,data:{name:'B'}}
 ]);
test('M24 graph_stats: compartilhamento por duas referências da mesma classe',()=>{
 const r=graphOwnershipStats(graph());assert.equal(r.length,2);
 const p=r.find(x=>x.name==='Player')!;assert.equal(p.instances,2);assert.equal(p.shared,1);
 assert.equal(p.holders.reduce((s,h)=>s+h.references,0),2);
});
test('M24 graph_stats: filtro de classe e ordenação estável',()=>{
 assert.equal(graphOwnershipStats(graph(),'Team').length,1);
 assert.deepEqual(graphOwnershipStats(graph(),'NoSuchClass'),[]);
});
test('M24 graph_stats: ID de nó inválido causa erro (nunca acesso silencioso)',()=>{
 const g=new KryoGraph22([{name:'A',fields:['value']}],[{classId:0,data:{value:{node:100}}}]);
 assert.throws(()=>graphOwnershipStats(g),/Out-of-range/);
});
test('M24 graph_stats: limite de campos e argumentos inválidos',()=>{
 assert.equal(graphOwnershipStats(graph(),undefined,0)[0]!.holders.length,0);
 assert.throws(()=>graphOwnershipStats(graph(),undefined,-1),/limit/);
});
test('M24 schema_diff: detecta campos adicionados e retirados',()=>{
 const r=compareDecodedSchemas({x:1,y:2},{x:1,z:3});
 assert.deepEqual(r.fieldChanges,[{path:'',oldOnly:['y'],newOnly:['z']}]);
});
test('M24 schema_diff: arrays são normalizados para path[]',()=>{
 const r=compareDecodedSchemas({players:[{a:1},{b:2}]},{players:[{a:1},{c:3}]});
 assert.deepEqual(r.fieldChanges,[{path:'.players[]',oldOnly:['b'],newOnly:['c']}]);
});
test('M24 schema_diff: rastreia classes retiradas',()=>{
 const r=compareDecodedSchemas({teams:[{class:'LegacyClub'}]},{teams:[{class:'NewClub'}]});
 assert.deepEqual(r.removedClasses,[{path:'.teams[]',classes:['LegacyClub']}]);
});
test('M24 schema_diff: objetos vazios e nulos não criam falso positivo',()=>{
 assert.deepEqual(compareDecodedSchemas(null,{}),{fieldChanges:[],removedClasses:[]});
});
test('M24 BFN: lê cabeçalho real compatível com biblioteca M22',()=>{
 const bytes=encodeBfnHeader({format_version:3,author:'FMU'});
 const r=inspectBfnMetadata(bytes);
 assert.equal(r.formatVersion,3);assert.equal(r.worldLoaded,false);
 assert(r.fields.includes('author'));
});
test('M24 BFN: recusa dados aleatórios sem simular mundo carregado',()=>{
 assert.throws(()=>inspectBfnMetadata(new Uint8Array([1,2,3])),/Truncated/);
});
