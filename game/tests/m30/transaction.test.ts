/** M30 integration contracts over an injected (NOT original Rust) match engine. */
const test=require('node:test'),assert=require('node:assert/strict');
import {prepareBatch,verifyProposal,AdvanceFn} from '../../src/m30/transaction';
import {DeterministicRandomSource} from '../../src/m30/java_rng';
type W={season:number;round:number;cash:bigint;matches:number[];settings:Map<string,number>};
const game=():W=>({season:2026,round:0,cash:5000000000000000000n,matches:[],settings:new Map([['duration',90]])});
const advance:AdvanceFn<W>=(world,ctx)=>{
 const result=ctx.rng.freshInt(5);
 world.round++;world.matches.push(result);world.cash-=10000000n;
 ctx.queueEffect('match.ended',{round:world.round,score:result});
 return 'completed';
};
test('M30 three steps: World, RNG, and outbox staged without mutating originals',()=>{
 const world=game(),rng=new DeterministicRandomSource(42),before=rng.snapshot();
 const p=prepareBatch(world,rng,3,advance,'matchday:42');
 assert.equal(p.completed,3);assert.equal(p.status,'ready');
 assert.equal(world.round,0);assert.deepEqual(world.matches,[]);
 assert.deepEqual(rng.snapshot(),before);
 assert.equal(p.world.round,3);assert.equal(p.world.cash,5000000000000000000n-30000000n);
 assert.equal(p.effects.length,3);assert.equal(p.effects[1]?.key,'matchday:42/1/0');
 assert.ok(p.world.settings instanceof Map);assert.equal(p.world.settings.get('duration'),90);
 assert.notDeepEqual(p.rng,before);
});
test('M30 failed second step fully rolls back input World and RNG; no effects dispatched',()=>{
 const world=game(),rng=new DeterministicRandomSource(123),before=rng.snapshot();
 let calls=0;
 assert.throws(()=>prepareBatch(world,rng,5,(w,c)=>{
  calls++;w.round++;c.rng.freshInt(100);c.queueEffect('irreversible',{round:w.round});
  if(calls===2)throw Error('Rust engine unavailable');return 'completed';
 },'failure'),/engine unavailable/);
 assert.equal(calls,2);assert.equal(world.round,0);assert.deepEqual(rng.snapshot(),before);
});
test('M30 human-lineup pause restores in-flight RNG while preserving already completed steps',()=>{
 const p=prepareBatch(game(),new DeterministicRandomSource(100),3,(w,c)=>{
  if(c.dayIndex===1){c.rng.freshInt(10);w.round=900;return 'paused';}
  return advance(w,c);
 },'paused');
 assert.equal(p.status,'paused');assert.equal(p.completed,1);assert.equal(p.world.round,1);
 assert.throws(()=>verifyProposal(p),/Paused/);
 const expected=new DeterministicRandomSource(100);expected.freshInt(5);
 assert.deepEqual(p.rng,expected.snapshot());
});
test('M30 no silent assumption when engine returns unknown status',()=>{
 const w=game(),rng=new DeterministicRandomSource(1);
 assert.throws(()=>prepareBatch(w,rng,1,()=>('unknown' as any),'invalid'),/unsupported status/);
 assert.equal(w.round,0);
});
test('M30 effect key duplicate and oversized effect payload are rejected',()=>{
 assert.throws(()=>prepareBatch(game(),new DeterministicRandomSource(0),1,(w,c)=>{
  c.queueEffect('event',{v:1},'one');c.queueEffect('event',{v:2},'one');return 'completed';
 },'collision'),/collision/);
 assert.throws(()=>prepareBatch(game(),new DeterministicRandomSource(0),1,(_,c)=>{
  c.queueEffect('event',{long:'x'.repeat(1024*1024+1)});return 'completed';
 },'overflow'),/<=1MB/);
});
test('M30 36-round sandbox injection: two deterministic seasons without Rust parity claim',()=>{
 const world=game(),rng=new DeterministicRandomSource(42);
 const p=prepareBatch(world,rng,36,(w,ctx)=>{
  const score=ctx.rng.freshInt(6);w.matches.push(score);w.round++;
  if(w.round===18){w.season++;w.round=0;}
  ctx.queueEffect('demo.matchday',{season:w.season,score});return 'completed';
 },'demo:36');
 assert.equal(p.completed,36);assert.equal(p.world.season,2028);assert.equal(p.world.round,0);
 assert.equal(p.world.matches.length,36);assert.equal(world.season,2026);
});
test('M30 committed step retains key deletion and nested BigInt, unlike shallow Object.assign',()=>{
 const start={day:0,game:{transfers:[1,2]},removed:true,amount:123n};
 const p=prepareBatch(start,new DeterministicRandomSource(1),1,w=>{
  delete (w as Partial<typeof start>).removed;
  w.game.transfers=[];w.amount+=1n;return 'completed';
 },'delete');
 assert.equal('removed' in p.world,false);
 assert.deepEqual(p.world.game.transfers,[]);assert.equal(p.world.amount,124n);
 assert.equal(start.removed,true);assert.deepEqual(start.game.transfers,[1,2]);
});
