const test=require('node:test'),assert=require('node:assert/strict');
import {demoWorld} from '../src/demo';
import {newHeadToHead,updateHeadToHead,recordHeadToHead,recordGateIncome,positionIn,midSeasonRound,relegatedPlaces} from '../src/records';
test('Rust H2H first-match stats; reverse home increments same record',()=>{
 const w=demoWorld(),m=w.matches.findIndex(x=>x.home===0||x.away===0);
 const game=w.matches[m]!;game.home_goals=3;game.away_goals=1;
 const first=recordHeadToHead(w,m);assert.equal(first.games,1);assert.equal(first.wins1,1);
 game.home_goals=0;game.away_goals=2;recordHeadToHead(w,m);
 assert.equal(w.game.head_to_head?.length,1);assert.equal(first.games,2);
 assert.equal(first.wins2,1);assert.equal(first.goals1,3);assert.equal(first.goals2,3);
});
test('Rust H2H new away best-win fields keep first/second goal orientation',()=>{
 const t=newHeadToHead(10,20,0,4,1,2026);
 assert.equal(t.best_win2_for,0);assert.equal(t.best_win2_against,4);
 assert.equal(t.wins2,1);assert.equal(t.best_win2_season,2026);
});
test('Rust H2H update sorts by goal margin then scored and matches reverse home',()=>{
 const t=newHeadToHead(1,2,1,0,1,2026);
 updateHeadToHead(t,2,2,1,1,2027);assert.equal(t.wins2,1);assert.equal(t.games,2);
 updateHeadToHead(t,1,5,0,1,2028);assert.equal(t.best_win1_for,5);
 assert.throws(()=>updateHeadToHead(t,3,0,0,1,2028),/participant/);
});
test('Rust gate income: home human collects only eligible competition kind',()=>{
 const w=demoWorld(),m=w.matches[0]!,home=w.clubs[m.home!]!;
 home.human=true;m.income=12000;
 const old=home.cash;recordGateIncome(w,0);
 assert.equal(home.cash,old+12000n);assert.equal(home.finances.income_type5,12000);
 w.competitions[0]!.kind=7;recordGateIncome(w,0);
 assert.equal(home.cash,old+12000n);
});
test('positions and mid-season market based on Rust League formula',()=>{
 const w=demoWorld();assert.equal(positionIn(w,0,0),1);assert.equal(positionIn(w,0,9),10);
 assert.equal(positionIn(w,0,999),-1);
 w.stages[0]!.knockout=0;assert.equal(positionIn(w,0,0),-1);
 w.stages[0]!.round=9;assert.equal(midSeasonRound(w,0),0);
 w.stages[0]!.round=10;assert.equal(midSeasonRound(w,0),5);
});
test('relegation lookup by country or state division',()=>{
 const w=demoWorld();w.countries=[{divisions:[0]}];w.state_leagues=[{divisions:[0]}];w.competitions[0]!.relegated=2;
 w.stages[0]!.country_ref=0;assert.equal(relegatedPlaces(w,0),2);
 w.stages[0]!.state_league=0;assert.equal(relegatedPlaces(w,0),2);
 w.stages[0]!.state_league=undefined;w.stages[0]!.division=2;assert.equal(relegatedPlaces(w,0),0);
});