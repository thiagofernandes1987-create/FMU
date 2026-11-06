declare const require:(s:string)=>any;const test=require('node:test');const assert=require('node:assert/strict');
import {leaguePosition,midSeasonRound,leagueRelegationPlaces} from '../src/m22/simulation/league';
import {knockoutTransition,knockoutPrize} from '../src/m22/simulation/knockout';
import {transferWillingness,humanPurchaseOffer} from '../src/m22/simulation/human_purchase';
import {penaltyTaker22,onLineupGrid22} from '../src/m22/simulation/human_lineup';
import {coachMatchPoints22} from '../src/m22/simulation/coaches';
import {unemployedCoaches22} from '../src/m22/simulation/coach_market';
import {countryStrengthCeiling22} from '../src/m22/simulation/evolution';
import {searchPlayer22} from '../src/m22/simulation/player_search';
import {youthPotential22,javaWordCount22,javaNameLength22} from '../src/m22/simulation/player_gen';
import {generatedPlayerYear22} from '../src/m22/simulation/youth';
import {nationHasEnoughPlayers22,sortNationalCandidates22} from '../src/m22/simulation/national_teams';
import {defaultStageOptions22,selectedLeagueClubs22} from '../src/m22/simulation/stages';
import {nationalTeamsKind22,competitionDivision22,topScorer22} from '../src/m22/simulation/titles';
import {secondTierCodes22,flattenTies22,groupPlaces22} from '../src/m22/simulation/second_tiers';
import {confederationTeams22} from '../src/m22/simulation/world_cup_qualifiers';
import {todayMatches22,aiLineupPlan22} from '../src/m22/simulation/matchday';
test('M22 simulation/league: posição, knockout e mid-season bug documentado',()=>{
 const x={clubs:['a','b','c','d'],knockout:false,division:2,round:4,groupCount:0};assert.equal(leaguePosition(x,'b'),2);assert.equal(leaguePosition({...x,knockout:true},'a'),-1);assert.equal(midSeasonRound(x),2);assert.equal(leagueRelegationPlaces(x,[4,2]),2);
});
test('M22 simulation/knockout: ida/volta/fim e prize por índice relativo',()=>{
 const x={round:0,lastRound:2,leg:1,twoLeggedRounds:[true,true,false],phaseCode:0};assert.deepEqual(knockoutTransition(x),{type:'second-leg',nextLeg:2});assert.deepEqual(knockoutTransition({...x,leg:2}),{type:'next-round',nextRound:1});assert.deepEqual(knockoutTransition({...x,round:2}),{type:'finished'});assert.equal(knockoutPrize([10,20,30],2,2),30);
});
test('M22 simulation/human_purchase: disposição e contraoferta Rust',()=>{
 assert.deepEqual(transferWillingness({buyerConfed:0,buyerRep:1,buyerDivision:3,sellerConfed:2,sellerRep:5,salary:1000}),{code:0,salary:0});
 assert.deepEqual(transferWillingness({buyerConfed:2,buyerRep:1,buyerDivision:4,sellerConfed:0,sellerRep:5,salary:1000}),{code:1,salary:0});
 assert.deepEqual(humanPurchaseOffer({position:1,count:1,value:1000,strength:60,age:25,amount:2500,buyerCash:5000,willingness:{code:0,salary:0}}),{type:'Accepted'});
});
test('M22 simulation/human_lineup: escolhe penalty trait 9 e filtra grid',()=>{
 const p=[{id:'gk',strength:90,status:1,position:0,trait1:0},{id:'f',strength:70,status:1,position:4,trait1:9},{id:'l',strength:80,status:1,position:2,trait1:0}];assert.equal(penaltyTaker22(p),'f');assert.equal(onLineupGrid22([undefined,'f','l'],'f',2),true);assert.equal(onLineupGrid22([undefined,'f','l'],'l',1),false);
});
test('M22 simulation/coaches: pontos da carreira em casa e fora',()=>{
 assert.equal(coachMatchPoints22(1,1,2,1,false),4);assert.equal(coachMatchPoints22(1,1,2,1,true),5);assert.equal(coachMatchPoints22(1,1,1,1,true),2);assert.equal(coachMatchPoints22(7,1,2,1,true),8);
});
test('M22 simulation/coach_market: filtra faixa, nacionalidade e desemprego',()=>{
 const c=[{id:'x',country:29,previousCountry:20,reputation:4,human:false},{id:'y',country:20,previousCountry:29,reputation:3,human:false},{id:'z',country:29,previousCountry:29,reputation:5,human:true}];
 assert.deepEqual(unemployedCoaches22(c,29,4,1).map(x=>x.id),['x','y']);assert.deepEqual(unemployedCoaches22(c,29,4,0).map(x=>x.id),['x']);
});
test('M22 simulation/evolution: limites da força por confederação/país',()=>{
 assert.equal(countryStrengthCeiling22(1,29),90);assert.equal(countryStrengthCeiling22(0,72),95);assert.equal(countryStrengthCeiling22(5,143),60);assert.equal(countryStrengthCeiling22(9,0),100);
});
test('M22 simulation/player_search: prefixo, força e bandas com sobreposição',()=>{
 const players=[{id:'1',name:'João',position:4,strength:80,age:21,marketValue:10000000},{id:'2',name:'Alberto',position:1,strength:90,age:27,marketValue:500000}];
 assert.deepEqual(searchPlayer22(players,{name:'JOA',band:6}).map(x=>x.id),['1']);assert.deepEqual(searchPlayer22(players,{band:5}).map(x=>x.id),['1']);
});
test('M22 simulation/player_gen: Java Unicode word count e potencial de jovens',()=>{
 assert.equal(javaNameLength22('😀'),2);assert.equal(javaWordCount22(' João Silva'),3);assert.equal(youthPotential22(17,3,2),1);assert.equal(youthPotential22(17,3,99),10);assert.equal(youthPotential22(20,5,75),7);
});
test('M22 simulation/youth: jogador gerado envelhece e se reinicia aos 36',()=>{
 const x={name:'F',age:35,country:29,ratings:[1],competitionStats:[2],seasonStats:[3],careerGames:10,careerGoals:5};const y=generatedPlayerYear22(x,()=>22,()=> 'Novo');assert.equal(y.name,'Novo');assert.equal(y.age,22);assert.deepEqual(y.seasonStats,[]);assert.equal(x.name,'F');
});
test('M22 simulation/national_teams: minimo 2 GK + 16 jogadores de linha',()=>{
 const p=[...Array.from({length:2},(_,i)=>({id:'g'+i,country:29,position:0,style:0,strength:75,star:false})),...Array.from({length:16},(_,i)=>({id:'p'+i,country:29,position:4,style:0,strength:50+i,star:i===0}))];
 assert.equal(nationHasEnoughPlayers22(p,29),true);assert.equal(nationHasEnoughPlayers22(p.slice(1),29),false);assert.equal(sortNationalCandidates22(p)[0]?.position,0);
});
test('M22 simulation/stages: default Rust e preflight de formato não portado',()=>{
 const o=defaultStageOptions22();assert.equal(o.twoRounds,true);assert.equal(o.twoLeggedKnockout.length,7);assert.deepEqual(selectedLeagueClubs22({...o,teams:2},['a','b','c'],1),['b','c']);assert.throws(()=>selectedLeagueClubs22({...o,knockoutTeams:1020},[],0),/Unsupported/);
});
test('M22 simulation/titles: seleção internacional, divisão e artilharia',()=>{
 assert.equal(nationalTeamsKind22(14),true);assert.equal(nationalTeamsKind22(1),false);assert.equal(competitionDivision22('Other',1),-1);assert.deepEqual(topScorer22([{id:'a',goals:10,games:20},{id:'b',goals:10,games:18}])?.id,'b');
});
test('M22 simulation/second_tiers: códigos Europa/Conference e terceiros',()=>{
 assert.deepEqual(secondTierCodes22('Europa'),[6006,6005]);assert.deepEqual(secondTierCodes22('Conference'),[12006,12005]);assert.deepEqual(flattenTies22([['a','b'],['c','d']]),['a','b','c','d']);assert.deepEqual(groupPlaces22([['a','b','c'],['d','e','f']],2),['c','f']);
});
test('M22 simulation/world_cup_qualifiers: ordena por nível e desempata valor',()=>{
 const p=[{id:'a',confederation:1,level:40,valueHr:10,hasTeam:true},{id:'b',confederation:1,level:50,valueHr:10,hasTeam:true},{id:'c',confederation:2,level:70,valueHr:12,hasTeam:true}];assert.deepEqual(confederationTeams22(p,1),['b','a']);
});
test('M22 simulation/matchday: seleciona partidas do dia e formação AI somente quando necessária',()=>{
 const x=[{id:'1',home:'a',away:'b',date:2026,played:false},{id:'2',home:'b',away:'c',date:2027,played:false}];assert.deepEqual(todayMatches22(x,2026),[x[0]]);assert.deepEqual(aiLineupPlan22([x[0]!],new Set(['a']),new Set()).map(a=>a.club),['b']);
});
