declare function require(name:string):any;
const test=require('node:test'),assert=require('node:assert/strict');
import {freeFixtureDays,planFixtureChanges,newFixture,finalHostCountry,nationalGround,
 stadiumsBySize,finalOnNeutralGround,FixtureWorld,FixtureRuntime} from '../src/simulation/fixtures';
const world=():FixtureWorld=>({season:2026,days:[{kind:1,done:false,matches:[],stages:[],competitions:[]},
 {kind:1,done:false,matches:[],stages:[],competitions:[]},{kind:1,done:false,matches:[],stages:[],competitions:[]},
 {kind:1,done:false,matches:[],stages:[],competitions:[]}],matches:[],
 clubs:{a:{id:'a',country:29,stadium:'s1'},b:{id:'b',country:29,stadium:'s2'},c:{id:'c',country:42,stadium:'s3'}},
 stadiums:{s1:{id:'s1',country:29,capacity:[10000,100],condition:70},
 s2:{id:'s2',country:29,capacity:[30000,100],condition:90},
 s3:{id:'s3',country:42,capacity:[20000,100],condition:80}},
 stages:{league:{id:'league',kind:1,lastRound:0},qualifier:{id:'qualifier',kind:9,lastRound:0},
 final:{id:'final',kind:4,lastRound:10},first:{id:'first',kind:4,lastRound:0,knockoutId:'final'}},
 competitions:{a:{id:'a',kind:1,subkind:0,class:'Other'},
 uefa:{id:'uefa',kind:6,subkind:0,class:'ChampionsLeague',mainStageId:'first'}},
 countryRefs:new Set([29,42,154])});
const runtime=():FixtureRuntime=>({rng:{freshInt:()=>0,nextIntBounded:()=>80,shuffle(_x){/* deterministic no-op */}},minutePools:[],nationalGrounds:{}});
test('M20 simulation/fixtures: free_days ignora dias concluídos e os dois primeiros elegíveis',()=>{
 const w=world();assert.deepEqual(freeFixtureDays(w,1,true),[2,3]);
 w.days[1]!.done=true;assert.deepEqual(freeFixtureDays(w,1,true),[3]);
});
test('M20 simulation/fixtures: plano de mudanças 2×3 e substituições 2×4',()=>{
 const r=runtime(),plan=planFixtureChanges(r);
 assert.deepEqual(plan.tactical,[[19,20,23],[21,22,24]]);
 assert.deepEqual(plan.substitutions,[[16,17,43,44],[18,19,45,46]]);
 assert.equal(r.minutePools.length,5);
});
test('M20 simulation/fixtures: escolhe maior estádio do país, 2 primeiros',()=>{
 const w=world(),r=runtime();assert.deepEqual(stadiumsBySize(w,r),['s2','s3','s1']);
 assert.equal(nationalGround(w,r,29,false),'s2');assert.equal(nationalGround(w,r,29,true),'s2');
});
test('M20 simulation/fixtures: regra de primeiro dois falha quando país tem só um estádio e sorteia 1',()=>{
 const w=world(),r=runtime();r.rng.freshInt=()=>1;
 assert.equal(nationalGround(w,r,42,true),undefined);
});
test('M20 simulation/fixtures: país de final continental gira por 10 anos',()=>{
 const c=world().competitions.uefa!;
 assert.equal(finalHostCountry(c,2026),97);
 assert.equal(finalHostCountry(c,2027),72);
});
test('M20 simulation/fixtures: palco neutro somente se rodada coincide com final',()=>{
 const w=world();assert.equal(finalOnNeutralGround(w,w.competitions.uefa!,10),true);
 assert.equal(finalOnNeutralGround(w,w.competitions.uefa!,9),false);
});
test('M20 simulation/fixtures: newMatch liga índices de dia e conserva condição do estádio de casa',()=>{
 const w=world(),r=runtime();const m=newFixture(w,r,'league',1,'a','b',1,'a');
 assert.equal(m.stadium,'s1');assert.equal(m.stadiumCondition,70);
 assert.deepEqual(w.days[1]!.matches,['0']);assert.deepEqual(w.days[1]!.stages,['league']);
 assert.deepEqual(w.days[1]!.competitions,['a']);
});
test('M20 simulation/fixtures: classificação elimina estádio de competição de clube mundial',()=>{
 const w=world(),r=runtime();w.competitions.a!.kind=5;
 const m=newFixture(w,r,'league',1,'a','b',0,'a');assert.equal(m.stadium,undefined);
});
test('M20 simulation/fixtures: fase de eliminatória escolhe estádio maior do país',()=>{
 const w=world(),r=runtime();const m=newFixture(w,r,'qualifier',1,'a','c',2,'a');
 assert.equal(m.stadium,'s2');assert.equal(m.stadiumCondition,70);
});
test('M20 simulation/fixtures: referências inválidas não alteram calendário',()=>{
 const w=world(),r=runtime();assert.throws(()=>newFixture(w,r,'league',1,'a','absent',0,'a'),/Invalid/);
 assert.equal(w.matches.length,0);assert.equal(w.days[0]!.matches.length,0);
});
