/** M25 — integração browser/carreira sem mutação de resultados, nem save `.bfn`. */
declare function require(name:string):any;
const test=require('node:test'),assert=require('node:assert/strict');
import {createDemoCareer,advanceDemoRound,nextDemoSeason,serializeDemoCareer,restoreDemoCareer,DemoCareer} from '../src/m24/web/career_demo';
import {DemoMatchReplay,replayWorld,replayGoalEvents} from '../src/m25/web/demo_replay';
function career():DemoCareer {return advanceDemoRound(createDemoCareer());}
function myGame(s:DemoCareer){return s.fixtures.find(f=>f.played&&(f.home===s.myClubId||f.away===s.myClubId))!;}
test('M25 replay: partida pendente é recusada sem alterar carreira',()=>{
 const s=createDemoCareer(),before=serializeDemoCareer(s);
 assert.throws(()=>new DemoMatchReplay(s,s.fixtures[0]!.id),/encerradas/);
 assert.equal(serializeDemoCareer(s),before);
});
test('M25 replay: replay começa em 0×0 e mantém IDs originais',()=>{
 const s=career(),g=myGame(s),r=new DemoMatchReplay(s,g.id);
 assert.deepEqual([r.frame().homeGoals,r.frame().awayGoals],[0,0]);
 assert.equal(r.frame().matchId,g.id);
});
test('M25 replay: resultado final é idêntico ao jogo salvo',()=>{
 const s=career(),g=myGame(s),r=new DemoMatchReplay(s,g.id);
 const end=r.finish();assert.equal(end.finished,true);
 assert.deepEqual([end.homeGoals,end.awayGoals],[g.homeGoals,g.awayGoals]);
 assert.equal(end.history.length,g.homeGoals!+g.awayGoals!);
});
test('M25 replay: terminar replay não modifica a carreira original ou transferências',()=>{
 const s=career(),before=serializeDemoCareer(s);
 const r=new DemoMatchReplay(s,myGame(s).id);r.advance(15);r.finish();
 assert.equal(serializeDemoCareer(s),before);
});
test('M25 replay: temporalidade sintética determinística por fixture',()=>{
 const s=career(),g=myGame(s);
 assert.deepEqual(replayGoalEvents(g),replayGoalEvents(g));
 assert.deepEqual(new DemoMatchReplay(s,g.id).finish(),new DemoMatchReplay(s,g.id).finish());
});
test('M25 replay: avanço em passos produz mesmo resultado que conclusão direta',()=>{
 const s=career(),id=myGame(s).id,a=new DemoMatchReplay(s,id),b=new DemoMatchReplay(s,id);
 for(let i=0;i<20;i++)a.advance(5);
 assert.deepEqual(a.frame(),b.finish());
});
test('M25 replay: +0 minuto não muda o estado; >100 é recusado',()=>{
 const s=career(),r=new DemoMatchReplay(s,myGame(s).id),before=r.frame();
 assert.deepEqual(r.advance(0),before);
 assert.throws(()=>r.advance(101),/minutos/);assert.deepEqual(r.frame(),before);
});
test('M25 replay: suporta placar 0×0 sem inventar gol',()=>{
 const s=career(),g=myGame(s);g.homeGoals=0;g.awayGoals=0;
 const r=new DemoMatchReplay(s,g.id),end=r.finish();
 assert.deepEqual([end.homeGoals,end.awayGoals,end.history.length],[0,0,0]);
});
test('M25 replay: permite alterar o clube controlado sem usar objeto original',()=>{
 const s=career(),g=myGame(s),r=new DemoMatchReplay(s,g.id);
 assert.notEqual(r.world.players,s.clubs[0]!.players);
 assert.equal(r.world.clubs[g.home]?.human,g.home===s.myClubId);
});
test('M25 replay: rejeita ID desconhecido e resultado ainda indefinido',()=>{
 const s=career();assert.throws(()=>replayWorld(s,'missing'),/encerradas/);
 const g=myGame(s);g.homeGoals=undefined;assert.throws(()=>replayGoalEvents(g),/finished fixture/);
});
test('M25 replay: reprodução funciona após JSON save/load M24',()=>{
 const s=career(),restored=restoreDemoCareer(serializeDemoCareer(s));
 const id=myGame(s).id;
 assert.deepEqual(new DemoMatchReplay(restored,id).finish(),new DemoMatchReplay(s,id).finish());
});
test('M25 replay: duas temporadas inteiras não impedem replay dos jogos do ano atual',()=>{
 let s=createDemoCareer();
 for(let y=0;y<2;y++){
  for(let r=0;r<18;r++)s=advanceDemoRound(s);
  const id=myGame(s).id,result=new DemoMatchReplay(s,id).finish(),g=myGame(s);
  assert.deepEqual([result.homeGoals,result.awayGoals],[g.homeGoals,g.awayGoals]);
  if(y===0){s=nextDemoSeason(s);}
 }
});
