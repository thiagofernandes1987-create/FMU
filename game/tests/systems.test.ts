declare function require(name:string):any;
const test=require('node:test'),assert=require('node:assert/strict');
import {squadStrength,coachCampaigns,rankCoaches,CoachRankingContext} from '../src/systems/award_coaches';
import {registerSeasonAwards,awardsByPerson,awardsOfKind,SeasonAwardsInput,AwardEntry} from '../src/systems/award_history';
import {seasonEndAwards,AWARDS_EFFECT_ORDER,applyAwardEffects,SeasonEndHooks} from '../src/systems/award_lifecycle';
const ctx=():CoachRankingContext=>({current:true,
 clubs:{a:{id:'a',strengths:Array(17).fill(90),nationalTeam:false},b:{id:'b',strengths:Array(11).fill(60),nationalTeam:false},
  c:{id:'c',strengths:Array(11).fill(80),nationalTeam:false}},
 coaches:[{id:'CA',clubId:'a',human:true},{id:'CB',clubId:'b',human:false},{id:'CC',clubId:'c',human:false}],
 league:[{id:'l1',label:'Serie A',division:1,table:['b','a','c']}],weights:{a:2,b:1,c:1},
 titlePoints:id=>id==='b'?5:0,titles:id=>id==='b'?[{id:'champ',kind:'League',points:5}]:[]});
test('coach squadStrength: 16 melhores, não média do elenco completo',()=>{
 const a={id:'x',strengths:[...Array(16).fill(100),0],nationalTeam:false};assert.equal(squadStrength(a),100);
 assert.equal(squadStrength({...a,strengths:[]}),0);
});
test('coach campaigns: posição esperada pela qualidade e colocação real da tabela',()=>{
 const c=coachCampaigns(ctx());assert.equal(c.a?.position,2);assert.equal(c.a?.expected,1);
 assert.equal(c.b?.expected,3);assert.equal(c.b?.position,1);assert.equal(c.c?.position,3);
});
test('coach ranking: combinação títulos e campanha',()=>{
 const result=rankCoaches(ctx());assert.equal(result.length,3);
 assert.ok(result[0]!.points>=result[1]!.points);assert.ok(result.find(x=>x.coach==='CB')!.points>5);
});
test('coach ranking: ausência de temporada atual retorna vazio',()=>{
 const x=ctx();x.current=false;assert.deepEqual(rankCoaches(x),[]);
});
test('coach ranking: seleção nacional não é elegível',()=>{
 const x=ctx();x.clubs.a!.nationalTeam=true;
 assert.ok(!rankCoaches(x).some(v=>v.coach==='CA'));
});
test('coach ranking: meia pontuação das campanhas em divisões inferiores',()=>{
 const first=ctx(),second=ctx();second.league[0]!.division=2;
 const p1=rankCoaches(first).find(x=>x.coach==='CA')!.points,p2=rankCoaches(second).find(x=>x.coach==='CA')!.points;
 assert.ok(p2<p1);
});
const c=(id:string,goals=10)=>({key:id,name:id,club:'A',country:29,position:4,age:22,rating:7.5,goals,assists:3,weightedGoals:goals*1.2,slot:12});
const season=(year=2026):SeasonAwardsInput=>({year,ballonDor:[c('p1'),c('p2')],goldenShoe:[c('p2',30)],
 goldenGlove:[c('g1',0)],goldenBoy:[c('y1')],teamOfYear:[c('p1'),c('g1')],
 coach:{name:'Manager X',club:'A',country:29,summary:{titles:[]}}});
test('awards history: cria 4 categorias individuais + time com 2 + técnico',()=>{
 const out:AwardEntry[]=[];registerSeasonAwards(out,season(),false);
 assert.equal(out.length,7);assert.equal(awardsOfKind(out,'TeamOfTheYear').length,2);
 assert.equal(awardsOfKind(out,'CoachOfTheYear')[0]!.key,'tec|Manager X');
});
test('awards history: chuteira utiliza gols ponderados do candidato',()=>{
 const out:AwardEntry[]=[];registerSeasonAwards(out,season(),true);
 assert.equal(awardsOfKind(out,'GoldenShoe')[0]!.extra?.value,36);
});
test('awards history: sem replace conserva cada prêmio já gravado',()=>{
 const out:AwardEntry[]=[];registerSeasonAwards(out,season(),false);const before=JSON.stringify(out);
 const changed=season();changed.ballonDor=[c('new')];registerSeasonAwards(out,changed,false);
 assert.equal(JSON.stringify(out),before);
});
test('awards history: replace substitui categoria do mesmo ano',()=>{
 const out:AwardEntry[]=[];registerSeasonAwards(out,season(),false);
 const changed=season();changed.ballonDor=[c('new')];registerSeasonAwards(out,changed,true);
 assert.equal(awardsOfKind(out,'BallonDor')[0]!.key,'new');assert.equal(out.length,7);
});
test('awards history: anos distintos são ordenados por ano e tipo',()=>{
 const out:AwardEntry[]=[];registerSeasonAwards(out,season(2027),true);registerSeasonAwards(out,season(2026),true);
 assert.equal(out[0]!.year,2026);assert.equal(out[out.length-1]!.year,2027);
});
test('awards history: years por jogador mantém aparições em categorias e anos',()=>{
 const out:AwardEntry[]=[];registerSeasonAwards(out,season(2026),true);registerSeasonAwards(out,season(2027),true);
 const by=awardsByPerson(out);assert.deepEqual(by.p1?.BallonDor,[2026,2027]);
 assert.deepEqual(by.p1?.TeamOfTheYear,[2026,2027]);
});
test('awards lifecycle: efeito no 1º premio, estrelas no podium, teto reputação 5',()=>{
 const p={p1:{id:'p1',star:false,worldClass:false},p2:{id:'p2',star:false,worldClass:false},
  p3:{id:'p3',star:false,worldClass:false},g1:{id:'g1',star:false,worldClass:false}};
 const coach={reputation:5};applyAwardEffects(['p1','p2','p3'],['g1'],p,coach);
 assert.equal(p.p1.worldClass,true);assert.equal(p.p2.star,true);assert.equal(p.g1.star,true);assert.equal(coach.reputation,5);
});
function lifecycle(){const calls:string[]=[];const hooks={} as SeasonEndHooks;
 for(const n of AWARDS_EFFECT_ORDER)(hooks as any)[n]=()=>{calls.push(n);};
 hooks.hasBallonDor=()=>true;
 return {calls,hooks};}
test('awards lifecycle: ordem dos 13 hooks e sem repetição no mesmo ano',()=>{
 const {calls,hooks}=lifecycle(),state={season:2026};
 assert.equal(seasonEndAwards(state,hooks),true);assert.deepEqual(calls,AWARDS_EFFECT_ORDER);
 assert.equal(seasonEndAwards(state,hooks),false);assert.equal(calls.length,13);
});
test('awards lifecycle: sem Bola de Ouro não chama serviços e marca temporada',()=>{
 const {calls,hooks}=lifecycle(),state={season:2026};hooks.hasBallonDor=()=>false;
 assert.equal(seasonEndAwards(state,hooks),false);assert.deepEqual(calls,[]);
});
test('awards lifecycle: erro do serviço interrompe execução e mantém ano marcado (Rust)',()=>{
 const {hooks}=lifecycle(),state={season:2026};
 hooks.updateHallOfFame=()=>{throw Error('Hall error');};
 assert.throws(()=>seasonEndAwards(state,hooks),/Hall error/);
 assert.equal(seasonEndAwards(state,hooks),false);
});
import {topScorers,registerClubSeasons,clubHistory,coachCareer,updateIdols,idolsByClub,bestIdolIndexes,
 ClubAwardState,AwardPlayer} from '../src/systems/award_clubs';
const awardPlayers=():AwardPlayer[]=>[{id:'p1',key:'p1',name:'Goleador',country:29,position:4,
 stats:[{season:2026,clubId:5,games:20,goals:12},{season:2027,clubId:5,games:5,goals:1}]},
 {id:'p2',key:'p2',name:'Reserva',country:29,position:3,stats:[{season:2026,clubId:5,games:23,goals:6}]}];
test('clubs: artilheiro mantém primeiro atleta em caso de empate',()=>{
 const p=awardPlayers();p[1]!.stats[0]!.goals=12;
 assert.deepEqual(topScorers(p,2026)[5],['Goleador',12]);
});
test('clubs: temporada corrente registra campanha, título, técnico e artilheiro',()=>{
 const state:ClubAwardState={seasons:[],idols:[]};
 registerClubSeasons(state,2026,true,false,[{id:'a',gameId:5,name:'A',country:29,titles:['Cup'],coach:'Co',
  campaign:{league:'A',division:1,position:2,clubs:20}}],awardPlayers());
 assert.equal(state.seasons[0]!.topScorer?.[0],'Goleador');
 assert.equal(state.seasons[0]!.coach,'Co');assert.equal(state.seasons[0]!.position,2);
});
test('clubs: sem replace preserva dados existentes',()=>{
 const state:ClubAwardState={seasons:[],idols:[]},a=[{id:'a',gameId:5,name:'A',country:29,titles:[]}];
 registerClubSeasons(state,2026,true,false,a,awardPlayers());
 registerClubSeasons(state,2026,true,false,[{...a[0]!,name:'B'}],awardPlayers());
 assert.equal(state.seasons[0]!.name,'A');
});
test('clubs: temporada histórica sem títulos nem artilheiro não cria registro vazio',()=>{
 const state:ClubAwardState={seasons:[],idols:[]};registerClubSeasons(state,2025,false,true,
 [{id:'x',gameId:9,name:'X',country:29,titles:[]}],awardPlayers());assert.equal(state.seasons.length,0);
});
test('clubs: história e carreira ordenam temporadas mais novas primeiro',()=>{
 const state:ClubAwardState={seasons:[],idols:[]},clubs=[{id:'a',gameId:5,name:'A',country:29,titles:['Cup'],coach:'Co'}];
 registerClubSeasons(state,2025,true,true,clubs,awardPlayers());registerClubSeasons(state,2026,true,true,clubs,awardPlayers());
 assert.deepEqual(clubHistory(state,5).map(x=>x.year),[2026,2025]);
 assert.deepEqual(coachCareer(state,'Co').map(x=>x.year),[2026,2025]);
});
test('clubs: updateIdols soma stats por clube e mantém máximos históricos',()=>{
 const state:ClubAwardState={seasons:[],idols:[]};updateIdols(state,awardPlayers());
 assert.equal(idolsByClub(state)[5]!.length,2);assert.equal(idolsByClub(state)[5]!.find(x=>x.key==='p1')!.games,25);
 updateIdols(state,awardPlayers());assert.equal(idolsByClub(state)[5]!.find(x=>x.key==='p1')!.games,25);
});
test('clubs: melhores artilheiros e mais escalados selecionados em dois grupos de 10',()=>{
 const idols=Array.from({length:25},(_,i)=>({club:1,key:String(i),name:String(i),country:29,position:3,games:i,goals:25-i}));
 const best=bestIdolIndexes(idols,idols.map((_,i)=>i));
 assert.equal(best.length,20);assert.deepEqual(best.slice(0,3),[0,1,2]);assert.ok(best.includes(24));
});
