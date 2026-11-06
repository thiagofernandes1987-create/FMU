declare function require(name:string):any;
const test=require('node:test'),assert=require('node:assert/strict');
import {isNationalTeam,designatedPlayer,captain,freeKickTaker,LeadershipClub} from '../src/engine/clubs';
import {sendEngineMessage,sendEnginePlayerMessage,sendEngineComposed,sendContinentalTitle,MessageInbox} from '../src/engine/messages';
import {competitionStats,seasonStats,recordSeasonEvent,recordAssist,EVENT_KIND,PlayerStats} from '../src/engine/events';
import {injurePlayer,InjurablePlayer} from '../src/engine/injury';
import {fixtureTable,scheduleFixedFixtures} from '../src/simulation/fixture_schedule';
import * as seasonData from '../src/simulation/generated/tables';
import * as fixtures from '../src/simulation/generated/fixture_tables';
import * as engineTables from '../src/engine/generated/tables';
import * as hostCities from '../src/model/generated/host_cities';
import {NameLists} from '../src/model/names';
const club=(nationalTeam=false):LeadershipClub=>({id:'a',squad:['p'],nationalTeam,captain:'p',penaltyTaker:'p',freeKickTaker:'p'});
test('M20 engine/clubs: designado fora do clube é apagado por consulta',()=>{
 const c=club(),players={p:{id:'p',club:'b'}};
 assert.equal(isNationalTeam(c),false);assert.equal(captain(c,players),undefined);assert.equal(c.captain,undefined);
});
test('M20 engine/clubs: seleção retém designado convocado mesmo atuando fora',()=>{
 const c=club(true),players={p:{id:'p',club:'b'}};
 assert.equal(isNationalTeam(c),true);assert.equal(freeKickTaker(c,players),'p');
});
test('M20 engine/clubs: seleção descarta ex-convocado',()=>{
 const c=club(true);c.squad=[];
 assert.equal(designatedPlayer(c,{p:{id:'p',club:'b'}},'captain'),undefined);
});
test('M20 engine/messages: inbox incremental preserva data e textos',()=>{
 const inbox:MessageInbox={messages:[]};
 assert.deepEqual(sendEngineMessage(inbox,1000,4,22,'abc','def'),{sender:4,messageId:22,text1:'abc',text2:'def',day:1000});
 assert.equal(inbox.messages.length,1);
});
test('M20 engine/messages: mensagem disciplinar usa 10% de salário e arredondamento Java',()=>{
 const inbox:MessageInbox={messages:[]};
 const m=sendEnginePlayerMessage(inbox,1,6,7,'','', 'John',155,true,1);
 assert.equal(m.amount,16);assert.equal(m.flagRz,true);assert.equal(m.valueSc,1);
});
test('M20 engine/messages: mensagem composta preserva competição e dinheiro bigint',()=>{
 const inbox:MessageInbox={messages:[]},m=sendEngineComposed(inbox,10,25,76,{competition:'c',stage:'s',money:123456789012345n});
 assert.equal(m.money,123456789012345n);assert.equal(m.stage,'s');
});
test('M20 engine/messages: título continental restringe confederação 0..5',()=>{
 const inbox:MessageInbox={messages:[]};
 assert.equal(sendContinentalTitle(inbox,1,3).confederation,3);
 assert.equal(sendContinentalTitle(inbox,2,6).confederation,undefined);
});
const playerStats=():PlayerStats=>({id:'p',youth:false,seasonStats:[],competitionStats:[]});
test('M20 engine/events: season stats são lazy por (season, clubId)',()=>{
 const p=playerStats();assert.equal(seasonStats(p,2026,'a'),seasonStats(p,2026,'a'));
 assert.equal(seasonStats(p,2027,'a').season,2027);assert.equal(p.seasonStats.length,2);
});
test('M20 engine/events: amarelo seguido de segundo amarelo também gera vermelho',()=>{
 const p=playerStats();recordSeasonEvent(p,2026,'a',EVENT_KIND.YELLOW,0);
 recordSeasonEvent(p,2026,'a',EVENT_KIND.SECOND_YELLOW,0);
 assert.equal(p.seasonStats[0]?.yellowCards,2);assert.equal(p.seasonStats[0]?.redCards,1);
});
test('M20 engine/events: estatísticas de gols/lesão/assistência por competição',()=>{
 const p=playerStats();recordSeasonEvent(p,2026,'a',EVENT_KIND.GOAL,0);
 recordSeasonEvent(p,2026,'a',EVENT_KIND.INJURY,0);
 recordAssist(p,2026,'a','league');
 assert.equal(p.seasonStats[0]?.goals,1);assert.equal(p.seasonStats[0]?.injuries,1);
 assert.equal(p.seasonStats[0]?.assists,1);assert.equal(competitionStats(p,'league').assists,1);
});
test('M20 engine/events: base não ganha assistência e clube vazio não altera',()=>{
 const p=playerStats();p.youth=true;recordAssist(p,2026,'a','league');recordAssist(p,2026,undefined,'league');
 assert.equal(p.seasonStats[0]?.assists,0);assert.equal(p.competitionStats.length,0);
});
test('M20 engine/events: nota altera somatório e número de partidas avaliadas',()=>{
 const p=playerStats();recordSeasonEvent(p,2026,'a',EVENT_KIND.RATING,7.5);
 assert.equal(p.seasonStats[0]?.ratingSum,7.5);assert.equal(p.seasonStats[0]?.ratedGames,1);
});
const injured=(age=36,fitness=40):InjurablePlayer=>({id:'p',name:'John',age,fitness,strength:50,injuredUntil:0,stats:playerStats()});
test('M20 engine/injury: sorteios idade, condicionamento e queda de força de veterano',()=>{
 const p=injured();const draws:number[]=[];
 const r=injurePlayer(p,'a',2026,10000,{freshInt:max=>{draws.push(max);return max===100?50:0;}});
 assert.equal(r.days,6);assert.equal(r.strength,45);assert.equal(r.injuredUntil,10000+6*86400000);
 assert.deepEqual(draws,[14,20,100]);assert.equal(p.stats.seasonStats[0]?.injuries,1);
});
test('M20 engine/injury: azar 1 adiciona 70 dias, técnico humano recebe mensagem',()=>{
 const p=injured(25,60);p.humanCoachInbox={messages:[]};const d=[1,2,1,0];let i=0;
 const r=injurePlayer(p,'a',2026,1000,{freshInt:()=>d[i++]!});
 assert.equal(r.days,1+1+70);assert.equal(p.humanCoachInbox.messages.length,1);
 assert.equal(p.humanCoachInbox.messages[0]?.sender,3);assert.equal(i,4);
});
test('M20 engine/injury: jovem fitness baixa ignora penalidade de condicionamento',()=>{
 const p=injured(19,0),d=[0,0,50];let i=0;
 assert.equal(injurePlayer(p,'a',2026,1000,{freshInt:()=>d[i++]!}).days,0);
 assert.equal(p.injuredUntil,0);assert.equal(p.stats.seasonStats[0]?.injuries,1);
});
test('M20 engine/injury: RNG inválido falha antes de alterar estatística',()=>{
 const p=injured();assert.throws(()=>injurePlayer(p,'a',2026,0,{freshInt:()=>500}),/RNG/);
 assert.equal(p.stats.seasonStats.length,0);
});
test('M20 sim/fixtures: tabelas canônicas da Copa e Copa do Mundo',()=>{
 assert.equal(fixtures.THREE_ONE_ROUND.length,3);assert.equal(fixtures.FOUR_WORLD_CUP.length,3);
 assert.equal(fixtures.TWENTY_FIVE.length,25);
 assert.equal(scheduleFixedFixtures(['a','b','c']).length,3);
 assert.equal(scheduleFixedFixtures(['a','b','c'],true).length,6);
 assert.equal(scheduleFixedFixtures(['a','b','c','d']).length,6);
});
test('M20 sim/fixtures: 25 clubes, todos os 300 confrontos distintos',()=>{
 const clubs=Array.from({length:25},(_,i)=>String(i));const m=scheduleFixedFixtures(clubs);
 assert.equal(m.length,300);assert.equal(new Set(m.map(x=>[x.home,x.away].sort().join('-'))).size,300);
});
test('M20 sim/fixtures: recusa tamanho sem tabela e ID duplicado',()=>{
 assert.throws(()=>fixtureTable(8),/No canonical/);
 assert.throws(()=>scheduleFixedFixtures(['a','b','b']),/Duplicate/);
});
test('M20 data: competição conserva prêmios e 13 constantes Rust',()=>{
 assert.equal(seasonData.RUST_CONSTANT_NAMES.length,13);
 assert.equal(seasonData.CUP_ROUND_PRIZES.length,8);
 assert.equal(seasonData.DAY_KINDS.length>200,true);
 assert.equal(seasonData.BASE_CASH[1]![0],15_000_000);
});
test('M20 engine/tables: 13 formações, 26 slots e 6 arrays',()=>{
 assert.equal(engineTables.RUST_CONSTANT_NAMES.length,6);
 assert.equal(engineTables.FORMATIONS.length,13);assert.equal(engineTables.SLOT_ROLE.length,26);
 assert.equal(engineTables.BENCH_SLOTS.length,11);
});
test('M20 model/host_cities: países e capitais preservados incluindo UTF-8',()=>{
 assert.equal(hostCities.FINALISSIMA_SOUTH_AMERICA[0]?.[0],'Buenos Aires');
 assert.equal(hostCities.FINALISSIMA_EUROPE.length,14);
 assert.equal(hostCities.SUPER_MUNDIAL_NAME,'Super Mundial de Clubes');
});
test('M20 model/names: cache por país e alias 221→85, filtros de dígitos e ponto',()=>{
 let calls=0;const lists=new NameLists(()=>{calls++;return 'Joao\nAna.Silva\nPedro1\nMaria\n';});
 assert.deepEqual(lists.list(221,'BRA'),['Joao','Maria']);
 assert.deepEqual(lists.list(85,'BRA'),['Joao','Maria']);assert.equal(calls,1);
});
test('M20 model/names: nomes e sobrenomes em caches separados, lista vazia recarregada',()=>{
 let calls=0;const lists=new NameLists(()=>{calls++;return calls===1?'':calls===2?'Pedro':'Silva';});
 assert.deepEqual(lists.list(222,'ENG'),[]);assert.deepEqual(lists.list(72,'ENG'),['Pedro']);
 assert.deepEqual(lists.list(72,'ENG',true),['Silva']);assert.equal(calls,3);
});
import {enginePercent} from '../src/engine/percent';
test('M20 engine/tables: percentual usa f32 + arredondamento Java',()=>{
 assert.equal(enginePercent(1,3),33);assert.equal(enginePercent(2,3),67);
 assert.equal(enginePercent(1,8),13);assert.equal(enginePercent(0,8),0);
 assert.throws(()=>enginePercent(1,0),/Invalid fraction/);
});
