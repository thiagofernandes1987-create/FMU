/** M26 — exemplos Rust de simulation/systems/persistence, adaptados para a Demo ou CBOR. */
declare function require(name:string):any;
const test=require('node:test'),assert=require('node:assert/strict');
import {createDemoCareer,advanceDemoRound,nextDemoSeason,serializeDemoCareer,DemoCareer} from '../src/m24/web/career_demo';
import {comparePlayerRatings,countDaysToDemoSeasonEnd,inspectDemoCompetition} from '../src/m26/diagnostics/simulation_examples';
import {inspectDemoRound,compareDemoCareers,runDemoCareerSmoke} from '../src/m26/diagnostics/systems_examples';
import {inspectBfnFeatures,inspectBfnCompetitionIds,summarizeTeamTemplates,inspectBfnBytes} from '../src/m26/diagnostics/persistence_examples';
import {writeBfnPayload,readBfnPayload} from '../src/m26/persistence/bfn_codec';
const career=():DemoCareer=>createDemoCareer('Gerente FMU','c0',5678);
const meta={app_version:'M26',club:'TEST',coach:'TEST',date:'2026-01-01',season:2026,saved_at:0,imported_from:null};
test('M26 simulation compare_ratings: aponta notas divergentes na ordem',()=>{
 const left=[{id:'1',name:'A',lastRating:8,strength:70,slot:3},{id:'2',name:'B',lastRating:7,strength:60}];
 const right=[{...left[0]!,lastRating:6},{...left[1]!,lastRating:7}];
 assert.deepEqual(comparePlayerRatings(left,right).map(x=>[x.index,x.rust,x.reference]),[[0,8,6]]);
});
test('M26 simulation compare_ratings: nomes diferentes com mesmo ID são comparáveis',()=>{
 const a=[{id:'a',name:'X',lastRating:5,strength:20}],b=[{id:'a',name:'Y',lastRating:4,strength:20}];
 assert.equal(comparePlayerRatings(a,b)[0]!.name,'X');
});
test('M26 simulation compare_ratings: IDs diferentes não podem gerar falso diagnóstico',()=>{
 assert.throws(()=>comparePlayerRatings([{id:'a',name:'A',lastRating:4,strength:30}],[{id:'b',name:'A',lastRating:5,strength:30}]),/order/);
});
test('M26 simulation compare_ratings: limite 0 não retorna desvios',()=>{
 const a=[{id:'a',name:'A',lastRating:4,strength:30}];
 assert.deepEqual(comparePlayerRatings(a,[{...a[0]!,lastRating:5}],0),[]);
 assert.throws(()=>comparePlayerRatings(a,a,-1),/limit/);
});
test('M26 simulation days_to_season_end: 18 rodadas e 90 jogos sem alterar origem',()=>{
 const c=career(),original=serializeDemoCareer(c),r=countDaysToDemoSeasonEnd(c);
 assert.deepEqual([r.remainingRounds,r.matchesRemaining,r.alreadyPlayed,r.isFinished],[0,0,90,true]);
 assert.equal(serializeDemoCareer(c),original);
});
test('M26 simulation days_to_season_end: limite 3 avança só 3 rodadas',()=>{
 const r=countDaysToDemoSeasonEnd(career(),3);
 assert.equal(r.remainingRounds,15);assert.equal(r.alreadyPlayed,15);assert.equal(r.matchesRemaining,75);
});
test('M26 simulation inspect_competitions: identifica clube, líder e placares após rodada',()=>{
 const c=advanceDemoRound(career());const report=inspectDemoCompetition(c);
 assert.equal(report.playedMatches,5);assert.equal(report.remainingMatches,85);
 assert.equal(report.clubIds.length,10);assert.equal(report.stage,'double-round-robin');assert.ok(report.leader);
});
test('M26 systems day_matches: rodada corrente e anterior',()=>{
 const c=advanceDemoRound(career());assert.equal(inspectDemoRound(c,'current').length,5);
 const played=inspectDemoRound(c,1);assert.equal(played.length,5);assert.ok(played.every(x=>x.played));
 assert.ok(played.every(x=>x.homeGoals!==null&&x.awayGoals!==null));
});
test('M26 systems day_matches: não retorna resultados fabricados para rodada pendente',()=>{
 const c=career(),pending=inspectDemoRound(c,1);
 assert.ok(pending.every(m=>m.homeGoals===null&&!m.played));
 assert.throws(()=>inspectDemoRound(c,0),/round/);
});
test('M26 systems compare_season: carreiras idênticas após clone sem diferenças',()=>{
 const a=career(),b=JSON.parse(JSON.stringify(a)) as DemoCareer;
 assert.deepEqual(compareDemoCareers(a,b),[]);
});
test('M26 systems compare_season: detecta primeira diferença de placar',()=>{
 const a=career(),b=advanceDemoRound(a),d=compareDemoCareers(a,b);
 assert.ok(d.some(x=>x.category==='score'));assert.ok(d.some(x=>x.category==='players'));
});
test('M26 systems compare_season: detecta diferença entre anos',()=>{
 let a=career();for(let i=0;i<18;i++)a=advanceDemoRound(a);
 const b=nextDemoSeason(a);
 assert.ok(compareDemoCareers(a,b).some(x=>x.category==='season'));
});
test('M26 systems new_game_smoke: reproduz 2 temporadas sintéticas de 90 partidas',()=>{
 const a=runDemoCareerSmoke(36,934),b=runDemoCareerSmoke(36,934);
 assert.equal(a.seasons,1);assert.equal(a.played,180);assert.equal(a.uniqueFixtures,90);
 assert.equal(serializeDemoCareer(a.career),serializeDemoCareer(b.career));
});
test('M26 systems new_game_smoke: entradas inválidas bloqueadas antes de processamento',()=>{
 assert.throws(()=>runDemoCareerSmoke(-1),/steps/);
 assert.throws(()=>runDemoCareerSmoke(5001),/steps/);
});
const world={game:{season:4,start_year:2022,day:15,plays_international_clubs:true,plays_regionals:false},
 clubs:[{name:'A'},{name:'B'}],players:[{name:'P1'}],competitions:[{name:'Serie A',legacy_id:7,kind:1},{name:'Copa',legacy_id:8,kind:3}]};
const save=()=>readBfnPayload(writeBfnPayload(meta,world));
test('M26 persistence save_features: flags e inventário CBOR do `.bfn` real',()=>{
 const r=inspectBfnFeatures(save());assert.equal(r.worldLoaded,false);
 assert.deepEqual([r.season,r.startYear,r.day,r.players,r.clubs],[4,2022,15,1,2]);
 assert.equal(r.flags.plays_international_clubs,true);assert.equal(r.flags.plays_regionals,false);
 assert.equal(r.competitions['1'],1);assert.equal(r.competitions['3'],1);
});
test('M26 persistence comp_ids: lê IDs e nomes do CBOR, sem importar World',()=>{
 const r=inspectBfnCompetitionIds(save());
 assert.deepEqual(r,[{index:0,name:'Serie A',legacyId:7,kind:1},{index:1,name:'Copa',legacyId:8,kind:3}]);
});
test('M26 persistence game_data: resume templates por país em ordem crescente',()=>{
 const r=summarizeTeamTemplates([{country:29,name:'X'},{country:72,name:'Y'},{country:29,name:'Z'}],[{country:29}]);
 assert.deepEqual(r,{teams:3,countries:2,byCountry:[{country:29,count:2},{country:72,count:1}],leagueConfigurations:1});
});
test('M26 persistence game_data: país não numérico recusa dados sem alterar input',()=>{
 const a=[{country:NaN,name:'X'}];assert.throws(()=>summarizeTeamTemplates(a,[]),/country/);
 assert.equal(a.length,1);
});
test('M26 persistence open_bfn: retorna versões, features e competições reais do codec',()=>{
 const r=inspectBfnBytes(writeBfnPayload(meta,world));
 assert.equal(r.header.worldLoaded,false);assert.equal(r.features.worldLoaded,false);
 assert.equal(r.header.version,3);assert.deepEqual(r.header.topFields,['clubs','competitions','game','players']);
 assert.equal(r.competitions[0]?.name,'Serie A');
});
test('M26 persistence open_bfn: metadados sem CBOR válido falham antes de resumo',()=>{
 assert.throws(()=>inspectBfnBytes(Uint8Array.from([1,2,3,4])),/Truncated/);
});
