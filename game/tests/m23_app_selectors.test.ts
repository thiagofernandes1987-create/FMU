declare function require(name:string):any;
/** Source-specific screen-data test vectors. Renderer egui is not implemented. */
const test=require('node:test'),assert=require('node:assert/strict');
import {loanRows,BORROWED_MAX,LENT_MAX} from '../src/m23/app/loans';
import {clubRankingNumbers,rankedClubs,clubCompetitionKindVisible} from '../src/m23/app/club_ranking';
import {careerScorers,topLeaders,seasonAssists} from '../src/m23/app/leaders';
import {headToHead,headToHeadOpponents,seasonRivalMatches} from '../src/m23/app/head_to_head';
import {championEditions,championSeasonYear} from '../src/m23/app/champions';
import {seasonDeals} from '../src/m23/app/market';
import {newspaperSectionColor,newspaperArticles,readArticle} from '../src/m23/app/newspaper';
import {homeDefaultDescending,sortedHomeSquad} from '../src/m23/app/home';
import {coachCountry,listedCoaches,coachReputationKey} from '../src/m23/app/coaches';
import {roundSpeedIndex,roundTimeLabel} from '../src/m23/app/round';
import {defaultTeamOfRound,pickLastTeamPeriod} from '../src/m23/app/team_of_round';
import {emptySearch,resetSearch,searchFilter} from '../src/m23/app/search';
import {selectYouthTab,newYouthState,YOUTH_TABS} from '../src/m23/app/youth';
import {newManagementView,selectManagementTab} from '../src/m23/app/management';
import {assetTicketState,assetTab,ASSET_MAX_TICKET} from '../src/m23/app/assets';
import {canSatelliteInject,canSatelliteWithdraw,SATELLITE_INJECTIONS,SATELLITE_WITHDRAWALS} from '../src/m23/app/satellites';
import {nextHumanSquadOffer} from '../src/m23/app/squad_offer';
import {LINEUP_FORMATION_KEYS,lineupClick} from '../src/m23/app/lineup';
import {openingView} from '../src/m23/app/opening';
import {screenMessageText1,screenMessageText2,screenMessageSubject} from '../src/m23/app/messages';
import {championSeasonYear as year} from '../src/m23/app/champions';
import {clubPlacement} from '../src/m23/app/club_history';
import {validateNewCoach,chooseFirstClub,chooseRandomClub} from '../src/m23/app/new_game';
import {nextTabIndex} from '../src/m23/app/controls';
import {trophyYear} from '../src/m23/app/trophies';
import {awardWhole,awardOrdinalKey} from '../src/m23/app/awards';
import {resetSearch as reset} from '../src/m23/app/search';
import {selectCombo,toggleOption} from '../src/m23/app/preferences';
test('M23 loans: two lists respect current club and original owner',()=>{
 const r=loanRows('a',[{playerId:'p',ownerId:'b',until:100},{playerId:'q',ownerId:'a',until:100},{until:9}],{p:'a',q:'b'});
 assert.deepEqual(r.borrowed,[{playerId:'p',clubId:'b',until:100}]);
 assert.deepEqual(r.lent,[{playerId:'q',clubId:'b',until:100}]);assert.equal(BORROWED_MAX,4);assert.equal(LENT_MAX,10);
});
test('M23 ranking: sum kinds 1..14 and stable tie-breaker by goals against',()=>{
 const row=(id:string,points:number,conceded:number)=>({id,name:id,country:29,reputation:3,rankingPoints:[0,points],allTimeRecord:Array.from({length:15},(_,i)=>i===1?[points,0,conceded]:[0,0,0])});
 const a=row('a',4,2),b=row('b',4,6),c=row('c',3,0);
 assert.deepEqual(clubRankingNumbers(a,1),[4,0,2]);
 assert.deepEqual(rankedClubs([a,b,c],1).map(x=>x.club.id),['b','a','c']);
 assert.equal(clubCompetitionKindVisible(3,29,0,false,true),false);
 assert.equal(clubCompetitionKindVisible(12,29,2,true,true),false);
});
test('M23 scorers: secondary fewer games, active and retired, preserved source',()=>{
 assert.deepEqual(topLeaders([{name:'a',count:10,games:7},{name:'b',count:10,games:5}],2).map(x=>x.name),['b','a']);
 assert.deepEqual(careerScorers([{name:'a',goals:0,games:1},{name:'b',goals:15,games:10}], [{name:'idol',goals:19,games:30}]).map(x=>x.name),['idol','b']);
 assert.deepEqual(seasonAssists([{name:'x',country:29,assists:2,games:1},{name:'y',country:5,assists:3,games:1}],29).map(x=>x.name),['x']);
});
test('M23 confrontos: pair symmetrical, opponent alphabetic and season filter',()=>{
 const rec=[{club1:'a',club2:'c',wins1:2,wins2:1,draws:1},{club1:'b',club2:'a',wins1:1,wins2:2,draws:0}];
 assert.equal(headToHead(rec,'c','a')?.club1,'a');
 assert.deepEqual(headToHeadOpponents(rec,'a',{a:'A',b:'B',c:'C'}),['b','c']);
 assert.equal(seasonRivalMatches([{id:'1',home:'a',away:'b',date:1,season:2026,kind:1},{id:'2',home:'a',away:'b',date:2,season:2025,kind:1}], 'a','b',2026).length,1);
});
test('M23 campeões: newest-first one per season, season year offset',()=>{
 const r=championEditions([{season:1,champion:'a'},{season:1,champion:'b'},{season:2,champion:'c'}]);
 assert.deepEqual(r.map(x=>x.champion),['c','b']);assert.equal(championSeasonYear(2026,2),2027);
});
test('M23 transfer market screen: only positive transactions for current economic year',()=>{
 const data=[{playerId:'a',fromId:'x',toId:'y',fee:500,year:2026,month:1,day:5},{playerId:'b',fee:0,year:2026,month:1,day:5},{playerId:'c',fee:2000,year:2026,month:2,day:7},{playerId:'d',fee:9000,year:2025,month:2,day:7}];
 assert.deepEqual(seasonDeals(data,2026).map(x=>x.playerId),['c','a']);
});
test('M23 newspaper: section colors, filters, reads mark exact article',()=>{
 assert.equal(newspaperSectionColor('Base'),'#4cc38a');assert.equal(newspaperSectionColor('Outros'),'#94a3b8');
 const items=[{id:1,section:'Base',read:false,title:'Jovem'},{id:2,section:'Mercado',read:false,title:'Venda'}];
 assert.deepEqual(newspaperArticles(items,4).map(x=>x.id),[1]);
 assert.equal(readArticle(items,1),true);assert.equal(items[0]?.read,true);
});
test('M23 home: default sort ascending for name and age only',()=>{
 assert.equal(homeDefaultDescending('squad-column-name'),false);assert.equal(homeDefaultDescending('squad-column-value'),true);
 assert.deepEqual(sortedHomeSquad([{n:2},{n:1}],'n',x=>x.n,false).map(x=>x.n),[1,2]);
});
test('M23 coaches: unemployed country and stable reputation rank',()=>{
 const data=[{id:'1',country:5,clubCountry:29,reputation:3,name:'a'},{id:'2',country:29,reputation:5,name:'b'}];
 assert.equal(coachCountry(data[0]!),29);assert.deepEqual(listedCoaches(data,29,1).map(x=>x.id),['2','1']);assert.equal(coachReputationKey(6),'');
});
test('M23 round: respects human speed and original clock cases',()=>{
 assert.equal(roundSpeedIndex(true,99,2),5);assert.equal(roundSpeedIndex(false,0,3),3);
 assert.equal(roundTimeLabel({on:false,over:false,minute:0,half:0}).key,'live-round-finished');
 assert.equal(roundTimeLabel({on:true,over:false,minute:0,half:2}).key,'live-round-half-time');
 assert.equal(roundTimeLabel({on:true,over:false,minute:45,half:1}).key,'live-round-added-time');
});
test('M23 team-of-round: first club league selected, last period chosen',()=>{
 const countries=[{divisions:[{competitionId:'c',clubs:['a','b'],rounds:10,years:2}]}];
 assert.deepEqual(defaultTeamOfRound(countries,'a',false),{year:false,country:0,division:0,period:9});
 assert.equal(pickLastTeamPeriod({year:true,country:0,division:0},countries).period,1);
});
test('M23 search: reset does not delete saved results or selected player',()=>{
 const initial={...emptySearch(),name:'João',results:['p'],selected:'p'};assert.equal(resetSearch(initial).name,'');
 assert.deepEqual(resetSearch(initial).results,['p']);
 assert.deepEqual(searchFilter({...initial,age:[20,45],attributes:[[10,20],...Array.from({length:6},()=>[1,100] as const)]},true).age,[20,100]);
});
test('M23 youth: academy initial tab and invalid index rejection',()=>{
 assert.equal(newYouthState('club').tab,0);assert.equal(selectYouthTab(newYouthState('club'),2).tab,2);
 assert.equal(YOUTH_TABS.length,3);assert.throws(()=>selectYouthTab(newYouthState('club'),3),/tab/);
});
test('M23 management: 7 tabs, dependent candidates invalidated on selection',()=>{
 const original={...newManagementView(),candidates:['p'],target:5};
 assert.equal(selectManagementTab(original,6).candidate,undefined);
 assert.equal(original.candidates?.length,1);
});
test('M23 assets and satellites: prices/denominations mirror Rust',()=>{
 assert.deepEqual(ASSET_MAX_TICKET,[200,300,500,1000]);
 assert.equal(assetTab(0,999),3);
 assert.equal(assetTicketState({automaticPrices:false,ticketPrices:[250,15,25,5000]},()=>[1,2,3,4]).prices[0],200);
 assert.equal(canSatelliteInject(5000000),true);assert.equal(canSatelliteWithdraw(60000000),false);
 assert.equal(SATELLITE_INJECTIONS.length,5);assert.equal(SATELLITE_WITHDRAWALS.length,3);
});
test('M23 squad offer: non-human offers removed FIFO before presenting',()=>{
 const arr=[{playerId:'not-human',buyerId:'b',amount:1},{playerId:'human',buyerId:'b',amount:2}];
 assert.equal(nextHumanSquadOffer(arr,p=>p==='human')?.playerId,'human');assert.equal(arr.length,1);
});
test('M23 lineup: 14 formations; 2-click swap and empty click ignore',()=>{
 assert.equal(LINEUP_FORMATION_KEYS.length,14);
 let s=lineupClick({grid:['a','b',undefined]},0);s=lineupClick(s,1);
 assert.deepEqual(s.grid,['b','a',undefined]);
 assert.equal(lineupClick(s,2).selected,undefined);
});
test('M23 opening screen: latest save from already sorted list',()=>{
 const x={path:'/tmp/a.bfn',timestamp:100,label:'A'};
 assert.deepEqual(openingView([x]).latest,x);
});
test('M23 message screen: stage/cup and money priority, newspaper subject',()=>{
 const t={text:(key:string,args?:Record<string,string>)=>key+(args?JSON.stringify(args):''),money:(n:bigint)=>n.toString()};
 const m={sender:77,messageId:1,text1:'raw',text2:'raw',stageName:'Semifinal',money:1000n};
 assert.equal(screenMessageText1(m),'Semifinal');assert.equal(screenMessageText2(m,t),'1000');
 assert.ok(screenMessageSubject(m,t).includes('newspaper'));
});
test('M23 club history: champion, runner up, groups and playoffs encoded',()=>{
 const base={season:1,competitionKind:1,competitionSubkind:0,division:1,roundReached:0,position:1};
 assert.equal(clubPlacement(base,2).marks.champion,true);
 assert.equal(clubPlacement({...base,position:2},2).marks.runnerUp,true);
 assert.equal(clubPlacement({...base,roundReached:1090},2).key,'placement-won-playoff');
 assert.equal(clubPlacement({...base,roundReached:-1,position:0},2).key,'placement-first-phase');
});
test('M23 new game: coach validation name length and selection',()=>{
 assert.equal(validateNewCoach(' ',true),'add-human-coach-error-name-empty');
 assert.equal(validateNewCoach('A',true),'add-human-coach-error-name-short');
 assert.equal(validateNewCoach('AB',false),'add-human-coach-error-no-team');
 assert.equal(validateNewCoach('AB',true),undefined);
 assert.deepEqual(chooseFirstClub([[],['x']]),{division:1,clubId:'x'});
 assert.equal(chooseRandomClub([['a'],['b','c']],()=>0),'a');
});
test('M23 controls, awards, trophies, preferences preserve source behavior',()=>{
 assert.equal(nextTabIndex(1,2,[{enabled:true},{enabled:true},{enabled:false}]),1);
 assert.equal(trophyYear(2026,2),2027);assert.equal(awardWhole(3.2),'3');
 assert.equal(awardOrdinalKey(5).args.n,'5');assert.equal(toggleOption(false),true);
 assert.equal(selectCombo(1,2),1);assert.throws(()=>selectCombo(2,2));
});
