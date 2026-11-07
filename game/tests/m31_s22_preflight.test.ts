/** M31 typed binary → arena preflight tests based on the Rust import/mod.rs contract. */
declare function require(name:string):any;
const test=require('node:test'),assert=require('node:assert/strict');
import {KryoSchema22} from '../src/m22/persistence/kryo_schema';
import {readKryoGraph} from '../src/m31/persistence/kryo_reader';
import {preflightS22Bytes,stageTypedS22Graph} from '../src/m31/persistence/s22_preflight';
const str=(name:string)=>[...name].map((c,i)=>c.charCodeAt(0)|(i===name.length-1?128:0));
const name=(id:number,n:string)=>[1,id,...str(n)];
const schema:KryoSchema22={format:'Kryo',classes:{
 'best.f':{serializer:'field',fields:[{name:'player',declaring:'best.f',type:'object',valueClass:'best.F'}]},
 'best.F':{serializer:'field',fields:[{name:'age',declaring:'best.F',type:'int'}]},
 'best.ay':{serializer:'field',fields:[]}
}};
const sample=()=>Uint8Array.from([...name(0,'best.f'),1,1,40,...name(0,'best.ay'),1]);
test('M31: raw .s22 staging reconstructs game root, market root, Player arena',()=>{
 const p=preflightS22Bytes(sample(),schema);
 assert.equal(p.worldLoaded,false);assert.equal(p.nodeCount,3);assert.deepEqual(p.roots,[0,2]);
 assert.deepEqual(p.arenas.Player,[1]);assert.deepEqual(p.arenas.Club,[]);
 assert.equal(p.classCounts['best.f'],1);assert.equal(p.classCounts['best.F'],1);assert.equal(p.classCounts['best.ay'],1);
 assert.deepEqual(p.graph.nodes[1]!.data,{kind:'object',values:[{type:'int',value:20}]});
});
test('M31: legacy .s22 stage rejects missing second root',()=>{
 const p=sample();assert.throws(()=>preflightS22Bytes(p.subarray(0,p.length-name(0,'best.ay').length-1),schema),/exactly 2 roots/);
});
test('M31: legacy .s22 stage rejects reversed root ordering',()=>{
 const first=Uint8Array.from([...name(0,'best.ay'),1,...name(0,'best.f'),1,1,40]);
 assert.throws(()=>preflightS22Bytes(first,schema),/root 0 must be best.f/);
});
test('M31: class schema is mandatory, never default guessed',()=>{
 assert.throws(()=>preflightS22Bytes(sample(),{format:'Kryo',classes:{}}),/class not in schema/);
});
test('M31: references remain unchanged after staging and cannot be edited through frozen arena map',()=>{
 const graph=readKryoGraph(sample(),schema),before=JSON.stringify(graph);
 const plan=stageTypedS22Graph(graph);assert.equal(JSON.stringify(graph),before);
 assert.equal(Object.isFrozen(plan.arenas),true);assert.equal(Object.isFrozen(plan.arenas.Player),true);
});
test('M31: empty stream is not a valid game save even though decoder accepts it',()=>{
 assert.throws(()=>preflightS22Bytes(new Uint8Array(),schema),/exactly 2 roots/);
});
