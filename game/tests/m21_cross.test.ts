declare function require(name:string):any;
const test=require('node:test'),assert=require('node:assert/strict');
import {COUNTRIES,confederation,countryById,countryByGameCode} from '../src/ported/model/countries';
import {stageLabel,competitionLabel} from '../src/ported/model/labels';
import {emptyWorldFinances,WorldState,clubIncome,clubPayment,clubExpense,clubByGameId,coachByGameId,worldToday,clubWages} from '../src/ported/model/world';
import {newTransientRuntime,playerStats,resetPlayerStats,addMatchGoal} from '../src/ported/model/runtime';
import {noSystems} from '../src/ported/engine/hooks';
import {defaultTicketPrices,playGate} from '../src/ported/engine/stadium';
import {newClubRecord,recordClubGame,recordStageGame,stageNumbers,tableBand} from '../src/ported/simulation/clubs';
import {directorChance,directorTargets,DirectorContext} from '../src/ported/systems/director';
test('M21 model/countries: 224 entradas, Brasil id29 e códigos do jogo não FIFA',()=>{
 assert.equal(COUNTRIES.length,224);assert.equal(countryById(29)?.code,'BRA');
 assert.equal(countryById(3)?.code,'ALE');assert.equal(countryByGameCode('ALE')?.id,3);
 assert.equal(confederation(29),1);assert.equal(countryById(224),undefined);
 assert.equal(countryById(135)?.confederation,-1);
});
test('M21 model/labels: remove prefixos na ordem e devolve divisão em partes',()=>{
 const s=stageLabel({name:'Campeonato de Portugal',leagueName:'',divisionName:'',division:2,kindCode:2});
 assert.deepEqual(s,{name:' Portugal',division:{type:'Number',number:2}});
 const t=stageLabel({name:'',leagueName:'',divisionName:'Série B',division:2,kindCode:1,country:29});
 assert.deepEqual(t,{name:'',division:{type:'Named',name:'Série B'},leagueOf:29});
});
test('M21 model/labels: reconhece super mundial e copa nacional',()=>{
 const c={name:'',class:'NationalCup' as const,kind:2,country:29,division:1,countryRef:29};
 assert.deepEqual(competitionLabel(c,{renamed:false,tournamentNamed:false}),{type:'Cup',country:29});
 assert.deepEqual(competitionLabel({...c,class:'IntercontinentalCup'},{renamed:true,tournamentNamed:false}),{type:'Intercontinental'});
});
function wf():WorldState{return {game:{season:2026,day:0,days:[{date:1500}],clubs:[0],countries:[0]},
 players:[{salary:1000},{salary:1200}],clubs:[{id:42,cash:10000,human:true,squad:[0],youthSquad:[1],finances:emptyWorldFinances()}],
 coaches:[{id:25}],countries:[{nationalTeam:0}]};}
test('M21 model/world: date, lookup, salários e finanças por rubrica',()=>{
 const w=wf();assert.equal(worldToday(w),1500);assert.equal(clubByGameId(w,42),0);
 assert.equal(coachByGameId(w,25),0);assert.equal(clubWages(w,0),2200);
 clubIncome(w,0,1000,9);clubPayment(w,0,500,7);clubExpense(w,0,1000);
 assert.equal(w.clubs[0]!.cash,9500);assert.equal(w.clubs[0]!.finances.incomeType9,1000);
 assert.equal(w.clubs[0]!.finances.expenseType7,500);assert.equal(w.clubs[0]!.finances.expenseSalaries,1000);
});
test('M21 model/world: clube IA não altera rubricas humanas',()=>{
 const w=wf();w.clubs[0]!.human=false;clubIncome(w,0,400,9);
 clubPayment(w,0,100,7);assert.equal(w.clubs[0]!.cash,10300);
 assert.equal(w.clubs[0]!.finances.incomeType9,0);
});
test('M21 model/runtime: lazy stats e reset por partida',()=>{
 const rt=newTransientRuntime(),p=playerStats(rt,1);addMatchGoal(p);
 assert.deepEqual([p.goals,p.shots],[1,1]);assert.equal(playerStats(rt,1),p);
 resetPlayerStats(rt,1);assert.equal(playerStats(rt,1).shots,0);
 assert.equal(rt.minutePools.pools.length,5);
});
test('M21 engine/hooks: NoSystems retorna padrões sem side effects',()=>{
 assert.equal(noSystems.tacticsEnabled(),false);assert.equal(noSystems.matchBonus({},0,1),0);
 assert.equal(noSystems.preparedTactic({},2),undefined);
});
test('M21 engine/stadium: preços distintos para ligas, mundial e amistoso',()=>{
 assert.deepEqual(defaultTicketPrices(1,1,2,1),[10,15,25,80]);
 assert.deepEqual(defaultTicketPrices(0,1,1,1),[10,25,35,50]);
 assert.deepEqual(defaultTicketPrices(10,1,3,1),[7,13,20,70]);
});
test('M21 engine/stadium: ruído zero, público limita capacidade, receita fecha',()=>{
 const x=playGate({kind:1,subkind:1,knockout:false,homeReputation:1,awayReputation:1,
  division:1,confederation:1,capacity:[1000,2000,500,100],automaticPrices:true,
  ticketPrices:[1,1,1,1],fanSupport:80},()=>0);
 assert.ok(x.attendance.every((n,i)=>n>=0&&n<=[1000,2000,500,100][i]!));
 assert.equal(x.income,x.attendance.reduce((acc,v,i)=>acc+v*x.prices[i]!,0));
});
test('M21 simulation/clubs: resultado regulatório em competição e fase',()=>{
 const c=newClubRecord(),m={home:'a',away:'b',homeGoals:2,awayGoals:1,competition:'league'};
 const comp={id:'league',kind:1,subkind:2,division:1,class:'NationalLeague' as const};
 recordClubGame(c,'a',m,comp,2026);recordStageGame(c,'a',m,'stage1');
 assert.deepEqual(stageNumbers(c,'stage1'),[3,1,1,0,0,2,1,1]);
 assert.deepEqual(c.allTime[1],[3,2,1]);assert.equal(c.competitionRecords[0]?.wins,1);
 assert.deepEqual(tableBand(1,20,4,1),[1,1,0]);assert.deepEqual(tableBand(17,20,4,1),[17,5,0]);
});
test('M21 systems/director: reputação positiva garante chance superior',()=>{
 const x={id:'p',owner:'b',position:4,age:24,slot:21,starter:false,onLoan:false,star:false,worldClass:false};
 const seller={id:'b',reputation:2,cash:2000,human:false,nationalTeam:false,squad:['p']};
 const buyer={id:'a',reputation:3,cash:20000,human:true,nationalTeam:false,squad:[]};
 assert.equal(directorChance(x,seller,buyer),85);
});
test('M21 systems/director: escolha atacante fraco com preço acessível',()=>{
 const ctx:DirectorContext={players:{
  mine:{id:'mine',owner:'a',position:4,age:24,slot:21,starter:true,onLoan:false,star:false,worldClass:false},
  target:{id:'target',owner:'b',position:4,age:25,slot:21,starter:false,onLoan:false,star:false,worldClass:false}},
  clubs:{a:{id:'a',reputation:4,cash:50000,human:true,nationalTeam:false,squad:['mine']},
   b:{id:'b',reputation:2,cash:10000,human:false,nationalTeam:false,squad:['target']}},
  modValue:()=>40,estimate:id=>id==='target'?80:40,price:()=>25000};
 assert.deepEqual(directorTargets(ctx,'a',1).map(x=>x.player),['target']);
});
