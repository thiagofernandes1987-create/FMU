const test=require('node:test'),assert=require('node:assert/strict');
import {demoWorld,demoHooks,table,fixtures} from '../src/demo';
import {RandomSource} from '../src/rng';
import {World} from '../src/world';
import {advanceWorld,findNextDay,waitingHuman,UnportedRustBehavior,Hooks} from '../src/advance';
function setup(){return {world:demoWorld(),rng:new RandomSource(2026n),hooks:demoHooks()};}
test('one matchday commits five results and marks only previous day, next calendar day',()=>{
 const {world,rng,hooks}=setup(),before=structuredClone(world);const result=advanceWorld(world,rng,hooks);
 assert.equal(result.status,'advanced');assert.equal(result.world.game.day,1);
 assert.equal(result.world.game.days[0]!.done,true);assert.equal(result.world.game.days[1]!.done,false);
 assert.equal(result.world.matches.filter(m=>m.played).length,5);assert.equal(result.world.stages[0]!.round,1);
 assert.equal(world.game.day,0);assert.deepEqual(world,before);
});
test('two complete seasons commit 90 matches/season, no loss of roster identities',()=>{
 let {world,rng,hooks}=setup();const milestones=[];
 for(let s=0;s<2;s++){
  if(world.game.season_over){const o=advanceWorld(world,rng,hooks);world=o.world;rng=o.rng;assert.equal(o.status,'new_season');}
  for(let d=0;d<18;d++){
   const result=advanceWorld(world,rng,hooks);world=result.world;rng=result.rng;
   assert.equal(result.status,'advanced');assert.equal(world.matches.filter(m=>m.played).length,(d+1)*5);
  }
  assert.equal(world.game.season_over,true);assert.equal(world.stages[0]!.round,18);
  assert.deepEqual(world.game.days.map(d=>d.done),Array(18).fill(true));
  milestones.push({season:world.game.season,champion:table(world)[0]!.club});
 }
 assert.deepEqual(milestones.map(x=>x.season),[1,2]);assert.equal(world.players.length,180);
 assert.equal(world.game.head_to_head?.length,45);
 assert.ok(world.game.head_to_head?.every(x=>x.games===4));
 assert.deepEqual(world.clubs[0]!.squad,Array.from({length:18},(_,i)=>i));
});
test('two-season deterministic reproduction includes World AND RNG stream',()=>{
 function run(){let {world,rng,hooks}=setup();for(let i=0;i<37;i++){const o=advanceWorld(world,rng,hooks);world=o.world;rng=o.rng;}
  return {results:world.matches.map(m=>[m.home_goals,m.away_goals,m.played]),rng:rng.snapshot()};}
 assert.deepEqual(run(),run());
});
test('human without approved lineup waits and does not draw any RNG',()=>{
 const {world,rng,hooks}=setup();world.clubs[0]!.human=true;world.game.human_clubs=[0];
 const checkpoint=rng.snapshot(),before=structuredClone(world);const o=advanceWorld(world,rng,hooks);
 assert.equal(o.status,'awaiting_lineup');assert.strictEqual(o.world,world);assert.strictEqual(o.rng,rng);
 assert.deepEqual(rng.snapshot(),checkpoint);assert.deepEqual(world,before);
 world.clubs[0]!.lineup_set=true;const next=advanceWorld(world,rng,hooks);
 assert.equal(next.status,'advanced');
});
test('rollback on second engine failure preserves World + seed+Math.random',()=>{
 const {world,rng,hooks}=setup();rng.mathRandom();const before=structuredClone(world),state=rng.snapshot();
 let calls=0;hooks.playMatch=(w,id,local)=>{local.mathRandom();local.freshInt(23);if(++calls===2)throw Error('Engine failed fixture');return {homeGoals:1,awayGoals:0};};
 assert.throws(()=>advanceWorld(world,rng,hooks),/Engine failed fixture/);
 assert.deepEqual(world,before);assert.deepEqual(rng.snapshot(),state);
 // Retry with the same original refs: reproducibility, including runtime randomness.
 const valid=advanceWorld(world,rng,demoHooks());const retry=advanceWorld(world,rng,demoHooks());
 assert.deepEqual(valid.world,retry.world);assert.deepEqual(valid.rng.snapshot(),retry.rng.snapshot());
});
test('rollback when stage hook fails after playing all matches',()=>{
 const {world,rng,hooks}=setup(),snapshot=rng.snapshot(),saved=structuredClone(world);
 hooks.afterStage=()=>{throw Error('Standings unavailable');};
 assert.throws(()=>advanceWorld(world,rng,hooks),/Standings unavailable/);
 assert.deepEqual(world,saved);assert.deepEqual(rng.snapshot(),snapshot);
});
test('unknown pending tasks explicitly fail closed and rollback',()=>{
 const {world,rng,hooks}=setup();world.game.days[0]!.tasks_before=['cS'];
 const snapshot=rng.snapshot();assert.throws(()=>advanceWorld(world,rng,hooks),UnportedRustBehavior);
 assert.deepEqual(world.game.days[0]!.tasks_before,['cS']);assert.deepEqual(rng.snapshot(),snapshot);
 hooks.onTask=(w,task)=>{(w.game as any).handled=task;};
 const o=advanceWorld(world,rng,hooks);assert.equal((o.world.game as any).handled,'cS');
});
test('wage + interest tasks at day zero are charged once, both in bigint cash',()=>{
 const {world,rng,hooks}=setup();world.clubs[0]!.human=true;world.clubs[0]!.lineup_set=true;world.game.human_clubs=[0];
 world.game.days[0]!.tasks_before=['ds'];world.game.days[0]!.tasks_after=['dJ'];world.clubs[0]!.finances.bank_interest=233;
 const salary=world.clubs[0]!.squad.reduce((n,id)=>n+BigInt(world.players[id]!.salary),0n),old=world.clubs[0]!.cash;
 const o=advanceWorld(world,rng,hooks);assert.equal(o.world.clubs[0]!.cash,old-salary-233n);
 assert.equal(o.world.clubs[0]!.finances.expense_salaries,salary);
 assert.equal(o.world.clubs[0]!.finances.expense_type4,233);
 assert.equal(o.world.game.days[0]!.tasks_before.length,0);assert.equal(o.world.game.days[0]!.tasks_after.length,0);
 assert.equal(o.events.filter(e=>e.type==='wages').length,1);
});
test('if loan or stadium work requires non-ported hook, refuse without losing data',()=>{
 const {world,rng,hooks}=setup();(world.game as any).loans=[{player:0,owner:0}];
 assert.throws(()=>advanceWorld(world,rng,hooks),/loans_coming_back/);
 assert.equal(((world.game as any).loans).length,1);
});
test('without end-season hook last matchday rolls back; no false season completion',()=>{
 let {world,rng,hooks}=setup();for(let i=0;i<17;i++){const o=advanceWorld(world,rng,hooks);world=o.world;rng=o.rng;}
 hooks.endSeason=undefined;const state=rng.snapshot();const n=world.matches.filter(m=>m.played).length;
 assert.throws(()=>advanceWorld(world,rng,hooks),/end_season/);
 assert.equal(world.game.season_over,false);assert.equal(world.matches.filter(m=>m.played).length,n);
 assert.deepEqual(rng.snapshot(),state);
});
test('without newSeason hook, season-over boundary never advances',()=>{
 let {world,rng,hooks}=setup();for(let i=0;i<18;i++){const o=advanceWorld(world,rng,hooks);world=o.world;rng=o.rng;}
 hooks.newSeason=undefined;const state=rng.snapshot();assert.throws(()=>advanceWorld(world,rng,hooks),/new_season/);
 assert.equal(world.game.season,1);assert.deepEqual(rng.snapshot(),state);
});
test('competitive fixtures require afterMatch and stage processing',()=>{
 const {world,rng,hooks}=setup();hooks.afterMatch=undefined;
 assert.throws(()=>advanceWorld(world,rng,hooks),/after_match/);
 const more=demoHooks();more.afterStage=undefined;
 assert.throws(()=>advanceWorld(world,rng,more),/league_round/);
});
test('invalid result, duplicate teams in same day, broken roster ownership rejected',()=>{
 const {world,rng,hooks}=setup();hooks.playMatch=()=>({homeGoals:-1,awayGoals:0});
 assert.throws(()=>advanceWorld(world,rng,hooks),/invalid result/);
 const duplicate=demoWorld();duplicate.game.days[0]!.matches=[0,0];
 assert.throws(()=>advanceWorld(duplicate,new RandomSource(1),demoHooks()),/two games/);
 const ownership=demoWorld();ownership.players[0]!.club=2;
 assert.throws(()=>advanceWorld(ownership,new RandomSource(1),demoHooks()),/World references inconsistent/);
});
test('findNextDay skips completed or empty kind, using no ambiguous index-0 sentinel',()=>{
 const w=demoWorld();w.game.days[0]!.done=true;w.game.days[1]!.kind=0;
 assert.equal(findNextDay(w),2);
 for(const d of w.game.days)d.done=true;
 assert.equal(findNextDay(w),undefined);
});

test('loan, stadium and coach branches require dedicated hooks (not generic no-op)',()=>{
 const a=setup();(a.world.game as any).loans=[{player:0,owner:0}];a.hooks.onTask=()=>{};
 assert.throws(()=>advanceWorld(a.world,a.rng,a.hooks),/loans_coming_back/);
 a.hooks.onLoans=w=>{(w.game as any).loans=[];};
 (a.world.game as any).stadium_works=[{stadium:0}];
 assert.throws(()=>advanceWorld(a.world,a.rng,a.hooks),/finish_stadium_works/);
 a.hooks.onStadiumWorks=w=>{(w.game as any).stadium_works=[];};
 a.world.clubs[0]!.coach=0;
 assert.throws(()=>advanceWorld(a.world,a.rng,a.hooks),/coach_changes/);
 a.hooks.onCoachChanges=()=>{};
 assert.equal(advanceWorld(a.world,a.rng,a.hooks).status,'advanced');
});
test('national team day requires explicit recovery hook when countries active',()=>{
 const a=setup();a.world.game.days[0]!.kind=7;(a.world.game as any).countries=[0];
 assert.throws(()=>advanceWorld(a.world,a.rng,a.hooks),/national_team_player_recovery/);
 a.hooks.onNationalTeamRecovery=()=>{};
 assert.equal(advanceWorld(a.world,a.rng,a.hooks).status,'advanced');
});
