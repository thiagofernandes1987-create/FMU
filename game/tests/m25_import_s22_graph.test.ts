/** M25 — import_s22 graph-only; nunca confundir com parser `.s22` completo. */
declare function require(name:string):any;
const test=require('node:test'),assert=require('node:assert/strict');
import {KryoGraph22,GraphValue} from '../src/m22/persistence/kryo_graph';
import {S22_ROOT_CLASSES,S22_ARENAS,S22NotASaveError,
 stageS22Import,s22RootNode,validateS22NodeReferences} from '../src/m25/persistence/import_s22_graph';
const graph=()=>new KryoGraph22([
 {name:'best.f',fields:['clubs','day']},{name:'best.ay',fields:['coaches']},
 {name:'best.ah',fields:['name']},{name:'best.F',fields:['strength']},
 {name:'best.al',fields:['club']},{name:'java.lang.String',fields:[]}],
 [{classId:0,data:{clubs:[{node:2}],day:1}},{classId:1,data:{coaches:[{node:4}]}},
  {classId:2,data:{name:'Clube A'}},{classId:3,data:{strength:82}},
  {classId:4,data:{club:{node:2}}},{classId:5,data:{}}]);
const roots:GraphValue[]=[{node:0},{node:1}];
test('M25 persistência: só aceita as duas raízes canônicas do Rust',()=>{
 assert.deepEqual(S22_ROOT_CLASSES,['best.f','best.ay']);assert.equal(s22RootNode(graph(),roots[0],0),0);
 assert.equal(s22RootNode(graph(),roots[1],1),1);
});
test('M25 persistência: primeira raiz de classe inválida é rejeitada',()=>{
 assert.throws(()=>stageS22Import(graph(),[{node:2},{node:1}]),/expected best.f/);
});
test('M25 persistência: job_market não pode ser omitido',()=>{
 assert.throws(()=>stageS22Import(graph(),[{node:0}]),/missing/);
});
test('M25 persistência: raiz não referencial é rejeitada',()=>{
 assert.throws(()=>stageS22Import(graph(),[1,{node:1}]),/not a class/);
});
test('M25 persistência: ID fora do grafo não é aceito',()=>{
 assert.throws(()=>stageS22Import(graph(),[{node:400},{node:1}]),/unavailable/);
});
test('M25 persistência: arena de clubes/técnicos/jogadores tem ordem de descoberta',()=>{
 const plan=stageS22Import(graph(),roots);
 assert.deepEqual(plan.arenas.Club,[2]);assert.deepEqual(plan.arenas.Coach,[4]);
 assert.deepEqual(plan.arenas.Player,[3]);assert.deepEqual(plan.arenas.Match,[]);
 assert.equal(Object.keys(plan.arenas).length,9);
});
test('M25 persistência: plano não afirma World carregado',()=>{
 const plan=stageS22Import(graph(),roots);assert.equal(plan.worldLoaded,false);
 assert.deepEqual(plan.roots,[0,1]);assert.equal(plan.nodeCount,6);
});
test('M25 persistência: contagens de classes preservadas inclusive desconhecidas',()=>{
 const plan=stageS22Import(graph(),roots);assert.equal(plan.classSummary['java.lang.String'],1);
 assert.equal(plan.classSummary['best.F'],1);assert.equal(plan.classSummary['best.f'],1);
});
test('M25 persistência: referências de campo verificadas sem resolver circularidade',()=>{
 const g=graph();assert.deepEqual(validateS22NodeReferences(g),{references:3,invalid:[]});
});
test('M25 persistência: referência quebrada é reportada',()=>{
 const g=graph();(g.nodes[3]!.data as Record<string,GraphValue>).strength={node:999};
 const check=validateS22NodeReferences(g);assert.equal(check.references,4);assert.deepEqual(check.invalid,[999]);
});
test('M25 persistência: proteção contra profundidade excessiva de arrays',()=>{
 const g=graph();let payload:GraphValue={node:2};for(let i=0;i<40;i++)payload=[payload];
 (g.nodes[3]!.data as Record<string,GraphValue>).strength=payload;
 assert.throws(()=>validateS22NodeReferences(g,15),/depth/);
});
test('M25 persistência: dado original não é modificado pelo planejamento',()=>{
 const g=graph(),before=JSON.stringify(g.nodes);stageS22Import(g,roots);
 assert.equal(JSON.stringify(g.nodes),before);
});

test('M25 persistência: plano retornado e coleções são imutáveis',()=>{
 const plan=stageS22Import(graph(),roots);
 assert(Object.isFrozen(plan));assert(Object.isFrozen(plan.arenas));
 assert(Object.isFrozen(plan.arenas.Player));assert(Object.isFrozen(plan.classSummary));
 assert(Object.isFrozen(plan.roots));
});
