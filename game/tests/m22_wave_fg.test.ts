declare const require:(name:string)=>any;
const test=require('node:test');const assert=require('node:assert/strict');
import {slotKind22,modAttributeMix22,modPlayerValue22} from '../src/m22/engine/value';
import {eligibleForLineup22,sortLineupStrength22,lineupFormationDraw22,LineupAthlete22} from '../src/m22/engine/lineup';
import {tacticalBeats22,tacticalCycle22,tacticalFitLimit22,tacticalSlotAverage22} from '../src/m22/engine/tactics';
import {GOAL_KIND22,ENGINE_SHOT_WEIGHTS22,SCORER_WEIGHTS22,pickWeighted22} from '../src/m22/engine/engine';
import {PLAYER_EVENT22,emptySeasonStats22,recordSeasonEvent22} from '../src/m22/engine/events';
import {tournamentCycles22,clubsByLevel22,javaCompareClubName22,TournamentCycles22} from '../src/m22/simulation/new_game';
import {assignDayKind22,nthDayOfKind22,addCalendarTask22,SeasonDay22} from '../src/m22/simulation/new_season';
import {fourPotsOrder22,NATIONAL_CUPS22} from '../src/m22/simulation/national_cups';
import {makeContinentalTie22,separateContinentalCountries22} from '../src/m22/simulation/continental';
import {humanWaiting22,advanceGameAction22,markDaysDone22} from '../src/m22/simulation/game';
import {squadCounts22,clubWants22} from '../src/m22/simulation/market';
import {GENERATED_IMPORT_FIELDS,convertGeneratedSimple22} from '../src/m22/persistence/import_generated';

test('M22 engine/value: slot kinds match Rust 1..25 and numeric seven-skill weights',()=>{
 assert.deepEqual([1,3,8,2,9,10,17,11,13,14,16,18,25,24].map(slotKind22),[0,1,1,2,2,3,3,4,4,5,5,7,7,6]);
 assert.equal(modAttributeMix22([100,50,50,50,50,50,50],1),60+8+8+5); // Java round
 assert.equal(modPlayerValue22(65,[10,10,10,10,10,10,10],18,false,true),33);
 assert.throws(()=>modAttributeMix22([1,2],1),/seven skills/);
});
test('M22 engine/lineup: lesão, suspensão não amistosa e contrato humano',()=>{
 const p:LineupAthlete22={id:'x',strength:60,fitness:99,contractUntil:100,injuredUntil:0,suspended:false,humanClub:true};
 assert.equal(eligibleForLineup22(p,99,true),true);
 assert.equal(eligibleForLineup22(p,101,false),false);
 assert.equal(eligibleForLineup22({...p,suspended:true},99,true),false);
 assert.equal(eligibleForLineup22({...p,suspended:true},99,false),true);
 assert.equal(eligibleForLineup22({...p,injuredUntil:100},99,false),false);
 assert.equal(eligibleForLineup22(p,101,false,true),true);
});
test('M22 engine/lineup: ordenação estável por força e condição, formação por draw',()=>{
 const ps=[{id:'a',strength:60,fitness:80},{id:'b',strength:70,fitness:90},{id:'c',strength:60,fitness:95}]
 .map(p=>({...p,contractUntil:1,injuredUntil:0,suspended:false,humanClub:false}));
 assert.deepEqual(sortLineupStrength22(ps).map(p=>p.id),['b','c','a']);
 assert.deepEqual([2,3,7,8,38,39,49,50,60,61,65,66,72,73,90,91,92,93,101,102].map(lineupFormationDraw22),
 [1,2,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,4]);
});
test('M22 engine/tactics: ciclo pedra-papel-tesoura e média selecionada',()=>{
 assert.equal(tacticalBeats22(1,0),true);assert.equal(tacticalBeats22(0,2),true);assert.equal(tacticalBeats22(2,1),true);
 assert.equal(tacticalCycle22(1,0),1.4);assert.equal(tacticalCycle22(0,1),.6);
 assert.equal(tacticalFitLimit22(.2),.6);assert.equal(tacticalFitLimit22(2),1.3);
 assert.equal(tacticalSlotAverage22([{slot:10,value:70},{slot:12,value:90},{slot:18,value:60}],[10,12]),8);
});
test('M22 engine/engine: pesos de gols da fonte, escolha determinística e RNG extremo',()=>{
 assert.equal(GOAL_KIND22.OLYMPIC,5);assert.equal(ENGINE_SHOT_WEIGHTS22.after6[0],.5);
 assert.equal(SCORER_WEIGHTS22.length,26);assert.equal(SCORER_WEIGHTS22[18],22);
 assert.equal(pickWeighted22([2,2],[1,1],()=>0),0);assert.equal(pickWeighted22([2,2],[1,1],()=>.5),1);
 assert.throws(()=>pickWeighted22([1],[1],()=>1),/RNG/);
});
test('M22 engine/events: segundo amarelo conta vermelho, sem assistências da base',()=>{
 const s=emptySeasonStats22();recordSeasonEvent22(s,PLAYER_EVENT22.GAME,true,false);
 recordSeasonEvent22(s,PLAYER_EVENT22.SECOND_YELLOW,true,false);
 recordSeasonEvent22(s,PLAYER_EVENT22.ASSIST,true,true);
 recordSeasonEvent22(s,PLAYER_EVENT22.ASSIST,true,false);
 recordSeasonEvent22(s,PLAYER_EVENT22.RATING,false,false,8.1);
 assert.deepEqual([s.games,s.yellow,s.red,s.assists,s.ratedGames,s.ratingSum],[1,1,1,1,1,8.1]);
});
const cycles:TournamentCycles22={world_cup_season:1,euro_season:1,copa_america_season:1,finalissima_season:1,africa_cup_season:0,asian_cup_season:0,oceania_cup_season:0,gold_cup_season:0,nations_league_m_season:0,nations_league_n_season:0};
test('M22 simulation/new_game: calendário a cada quatro anos, desempate por tiebreak e UTF16',()=>{
 assert.deepEqual(tournamentCycles22(2026,cycles),cycles);
 assert.equal(tournamentCycles22(2027,cycles).world_cup_season,4);
 assert.equal(tournamentCycles22(2031,cycles).finalissima_season,3);
 const cs=[{id:'b',name:'B',level:10,reputation:2,tiebreakNumber:4},{id:'a',name:'A',level:10,reputation:5,tiebreakNumber:2}];
 assert.deepEqual(clubsByLevel22(cs).map(x=>x.id),['b','a']);assert.deepEqual(clubsByLevel22(cs,true).map(x=>x.id),['a','b']);
 assert.ok(javaCompareClubName22('Á','B')>0);
});
const day=(weekday:number,kind=0):SeasonDay22=>({weekday,kind,tasksBefore:[],tasksAfter:[]});
test('M22 simulation/new_season: atribui primeira rodada elegível após o último kind',()=>{
 const days=[day(1),day(2,2),day(1),day(1),day(4)],out=assignDayKind22(days,0,1,4);
 assert.equal(out[2]!.kind,4);assert.equal(days[2]!.kind,0);
 assert.equal(nthDayOfKind22(out,4,0),2);assert.equal(nthDayOfKind22(out,4,1),undefined);
 addCalendarTask22(out,2,'FIM',true);assert.deepEqual(out[2]!.tasksAfter,['FIM']);
});
test('M22 simulation/national_cups: 4 potes, ordem 0 2 1 3 por grupo, anfitriões',()=>{
 assert.deepEqual(fourPotsOrder22(2,()=>{}),[0,4,2,6,1,5,3,7]);assert.equal(NATIONAL_CUPS22.africa!.teams,24);
 assert.equal(NATIONAL_CUPS22.gold!.picks,16);assert.throws(()=>fourPotsOrder22(0,()=>{}),/Invalid/);
});
test('M22 simulation/continental: seleção evita país duplicado quando possível',()=>{
 const pick=makeContinentalTie22([[{id:'a',country:1}],[{id:'b',country:1},{id:'c',country:2}]]);
 assert.deepEqual(pick.map(x=>x.id),['a','c']);
});
test('M22 simulation/continental: colisão entre ties troca clube de país',()=>{
 const before=[[{id:'a',country:1},{id:'b',country:1}],[{id:'c',country:3},{id:'d',country:4}]];
 const after=separateContinentalCountries22(before);
 assert.notEqual(after[0]![0]!.country,after[0]![1]!.country);assert.equal(before[0]![0]!.id,'a');
});
test('M22 simulation/game: espera primeiro humano sem escalação, depois joga ou vira temporada',()=>{
 const matches=[{id:'m1',homeId:'a',awayId:'b',played:false}],clubs={a:{id:'a',human:true,lineupSet:false},b:{id:'b',human:false,lineupSet:false}};
 const pending=humanWaiting22(matches,clubs);assert.deepEqual(pending,{clubId:'a',matchId:'m1'});
 assert.equal(advanceGameAction22(false,pending),'WAIT_HUMAN');assert.equal(advanceGameAction22(false),'PLAY_MATCH_DAY');assert.equal(advanceGameAction22(true,pending),'NEW_SEASON');
 const x=markDaysDone22([{matches,done:false},{matches:[],done:false}],0);assert.equal(x[0]!.done,true);assert.equal(x[1]!.done,false);
});
test('M22 simulation/market: conta 6 categorias e exclui cedidos na avaliação',()=>{
 const players={a:{id:'a',position:3,style:0,strength:75,onLoan:false},b:{id:'b',position:3,style:1,strength:70,onLoan:true}};
 const club={squad:['a','b'],leagueClub:true,division:1,reputation:3};
 assert.deepEqual(squadCounts22(club,players,true),[0,0,0,2,0,1]);assert.deepEqual(squadCounts22(club,players,false),[0,0,0,1,0,1]);
 assert.equal(clubWants22(club,players.a,players,70,80,true),true);
 assert.equal(clubWants22(club,players.a,players,80,99,true),false);
});
test('M22 persistence/import/generated: extrai 35 conversores Rust, aplica mapa de season',()=>{
 assert.equal(Object.keys(GENERATED_IMPORT_FIELDS).length,35);
 assert.ok(GENERATED_IMPORT_FIELDS.game!.length>60);
 const fields=GENERATED_IMPORT_FIELDS.game!;
 const f=fields.find(x=>x.field==='season')!;assert.deepEqual(f,{field:'season',reader:'int',source:'ae'});
 const r=convertGeneratedSimple22('game',{ae:2026},(kind,v)=>kind==='int'?v??0:undefined);
 assert.equal(r.season,2026);assert.throws(()=>convertGeneratedSimple22('x',{},()=>null),/Unknown/);
});
import {preparePreMatch22} from '../src/m22/interop';
test('M22 integration: jogo humano pendente e escolha ponderada usam funções engine+simulation',()=>{
 const c={A:{id:'A',human:true,lineupSet:false}};
 const ps=[{id:'a',strength:70,fitness:90,contractUntil:1000,injuredUntil:0,suspended:false,humanClub:true},
           {id:'b',strength:60,fitness:100,contractUntil:1000,injuredUntil:2000,suspended:false,humanClub:true}];
 const r=preparePreMatch22(c,[{id:'m1',homeId:'A',played:false}],ps,900,false,()=>0);
 assert.equal(r.next,'WAIT_HUMAN');assert.deepEqual(r.eligibleAthleteIds,['a']);assert.equal(r.drawnCandidate,'a');
});
import {sideBehind22,aiChangeDecision22} from '../src/m22/engine/simulate';
test('M22 engine/simulate: resultado e substituições não fazem ações fora do segundo tempo',()=>{
 assert.equal(sideBehind22(0,2,1),true);assert.equal(sideBehind22(0,2,2),false);
 assert.equal(aiChangeDecision22({half:1,minute:0,side:1,human:false,subsLeft:3,homeGoals:0,awayGoals:2,plannedMinutes:[],substitutionMinutes:[]},()=>99),'NONE');
 assert.equal(aiChangeDecision22({half:2,minute:0,side:1,human:false,subsLeft:3,homeGoals:0,awayGoals:2,plannedMinutes:[],substitutionMinutes:[]},()=>51),'HALFTIME_CHANCE');
 assert.equal(aiChangeDecision22({half:2,minute:45,side:1,human:false,subsLeft:3,homeGoals:0,awayGoals:2,plannedMinutes:[20],substitutionMinutes:[45]},()=>0),'PLANNED');
});
