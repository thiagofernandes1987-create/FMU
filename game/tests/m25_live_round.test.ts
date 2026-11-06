/** M25: portas da rodada Rust e integração isolada de decisões e relógio.
 * Origem simulation/src/human/round.rs, sem declarar paridade de World/MatchEngine. */
declare function require(name:string):any;
const test=require('node:test'),assert=require('node:assert/strict');
import {LiveWorld,LiveGame,LivePlayer,LiveEvent,LiveRound,RoundHooks,LiveClub,
 LIVE_EVENT,shootoutWinner,playShootout,resolveLivePenalty,
 humanPlays,countryHasHumanLeague,countryPlaysToday,leagueGroups,cupGroups,roundShows,
 fixCaptain,fixPenaltyTaker,shootoutRule} from '../src/m25/simulation/live_round';
const p=(id:string,club:string,opts:Partial<LivePlayer>={}):LivePlayer=>({id,position:4,strength:76,age:25,fitness:90,slot:11,
 trait1:0,trait2:0,star:false,worldClass:false,clubId:club,goals:0,missedPenalties:0,penaltySaves:0,...opts});
function fixture(kind=9):LiveWorld {
 const players:Record<string,LivePlayer>={};
 for(const club of ['a','b']){for(let i=0;i<11;i++){
  const id=club+i;players[id]=p(id,club,{position:i===0?0:4,slot:i===0?1:2+i,strength:65+i});
 }}
 const game:LiveGame={id:'m1',competitionId:'cup',home:'a',away:'b',homePlayed:Array.from({length:11},(_,i)=>'a'+i),
  awayPlayed:Array.from({length:11},(_,i)=>'b'+i),events:[],homeGoals:0,awayGoals:0,
  knockout:false,needsShootout:false,addedByHalf:[0,0,0],shots:[0,0],shotsOnTarget:[0,0],valuesGa:[0,0]};
 return {players,clubs:{a:{id:'a',human:true,countryId:'c'},b:{id:'b',human:false,countryId:'c'}},
 competitions:{cup:{id:'cup',kind,countryId:'c'}},countries:{c:{id:'c',code:29,divisions:['cup'],leagueClubIds:['a','b'],cup:'cup',followed:true}},
 matches:{m1:game},todayMatches:['m1'],todayCompetitions:['cup'],leagueCountries:['c'],
 favouriteCountryCode:29,showAIShootouts:true,showHalfTimeSubstitutions:true};
}
function hooks(draws:number[]=[],calls:string[]=[]):RoundHooks{
 return {checkpoint:s=>calls.push(s),freshInt:bound=>{calls.push('rng:'+bound);const x=draws.shift()??0;return x%bound;},
  substitutions:(m,half)=>calls.push('sub:'+m+':'+half),halfTimeChanges:m=>calls.push('half:'+m),
  playMinute:(m,min,half)=>calls.push('play:'+m+':'+half+':'+min),
  addEngineGoal:(m,side)=>calls.push('goal:'+m+':'+side),
  onFinished:()=>calls.push('finished')};
}
test('M25: IDs humanos e país com clube humano',()=>{const w=fixture(1);
 assert.equal(humanPlays(w,'m1'),true);assert.equal(countryHasHumanLeague(w,'c'),true);
 assert.equal(countryPlaysToday(w,'c'),true);assert.deepEqual(leagueGroups(w),[['cup']]);
});
test('M25: fallback país favorito em liga sem humano segue flag do país',()=>{
 const w=fixture(1);w.clubs.a!.human=false;w.countries.c!.followed=false;
 assert.deepEqual(leagueGroups(w),[['cup']]);
});
test('M25: copa com clube humano é exibida, sem humano dá erro explícito Rust',()=>{
 const w=fixture(2);assert.deepEqual(cupGroups(w),[['cup']]);w.clubs.a!.human=false;
 assert.throws(()=>cupGroups(w),/unported/);
});
test('M25: competição kind 0 sem humano é omitida',()=>{
 const w=fixture(0);w.clubs.a!.human=false;assert.equal(roundShows(w,'cup'),false);
 const r=new LiveRound(w,hooks());assert.equal(r.state.on,false);
});
test('M25: internacionais não implementados na origem não recebem resultado falso',()=>{
 const w=fixture(10);assert.throws(()=>new LiveRound(w,hooks()),/unported/);
});
test('M25: título de campeonato e linha de jogo são mostrados',()=>{
 const r=new LiveRound(fixture(),hooks());assert.equal(r.state.rows.length,2);
 assert.equal(r.state.rows[0]?.competitionId,'cup');assert.equal(r.state.rows[0]?.matchId,undefined);
 assert.equal(r.state.rows[1]?.matchId,'m1');assert.equal(r.state.rows[1]?.human,true);
});
test('M25: cobrador titular atual preservado',()=>{const w=fixture();w.clubs.a!.penaltyTaker='a2';fixPenaltyTaker(w,'a',w.matches.m1!.homePlayed);
 assert.equal(w.clubs.a!.penaltyTaker,'a2');});
test('M25: cobrador seleção por trait 9 e maior força',()=>{
 const w=fixture();w.players.a2!.trait1=9;w.players.a4!.trait1=9;
 fixPenaltyTaker(w,'a',w.matches.m1!.homePlayed);assert.equal(w.clubs.a!.penaltyTaker,'a4');
});
test('M25: capitão mais forte, idade como desempate, do mesmo clube',()=>{
 const w=fixture();w.players.a10!.strength=90;w.players.a8!.strength=90;w.players.a8!.age=33;
 fixCaptain(w,'a',w.matches.m1!.homePlayed);assert.equal(w.clubs.a!.captain,'a8');
});
test('M25: capitão estrangeiro não altera clube',()=>{
 const w=fixture();w.players.a10!.strength=99;w.players.a10!.clubId='b';
 fixCaptain(w,'a',w.matches.m1!.homePlayed);assert.equal(w.clubs.a!.captain,undefined);
});
test('M25: comparador legacy da disputa é deliberadamente assimétrico',()=>{
 const w=fixture();w.players.a1!.position=4;w.players.a2!.position=2;w.players.a1!.strength=45;w.players.a2!.strength=90;
 assert.equal(shootoutRule(w,'a1','a2'),-1);
});
test('M25: vencedor por impossibilidade matemática antes das 5 cobranças',()=>{
 assert.equal(shootoutWinner(1,true,[4,0],[0,4,3]),1);
 assert.equal(shootoutWinner(2,true,[0,4],[0,3,4]),2);
});
test('M25: não declara vencedor antes das cobranças',()=>{
 assert.equal(shootoutWinner(1,false,[0,0],[0,1,0]),undefined);
 assert.equal(shootoutWinner(2,false,[1,1],[0,1,1]),undefined);
});
test('M25: morte súbita só resolve depois da cobrança visitante',()=>{
 assert.equal(shootoutWinner(1,true,[6,5],[0,6,5]),undefined);
 assert.equal(shootoutWinner(2,false,[6,5],[0,6,6]),1);
 assert.equal(shootoutWinner(2,true,[5,6],[0,6,6]),2);
});
test('M25: shootout 100% dos chutes casa, 0% visitante termina 3×0',()=>{
 const w=fixture(),calls:string[]=[],h=hooks([0,99,0,99,0,99],calls);
 assert.equal(playShootout(w,h,'m1'),1);assert.equal(w.matches.m1!.winnerId,'a');
 assert.deepEqual(w.matches.m1!.penaltyShootout,[3,0]);
 assert(calls.filter(x=>x==='rng:100').length===6);
});
test('M25: ordem humana inválida rejeitada, sem modificar placar',()=>{
 const w=fixture(),h=hooks();h.shootoutOrder=()=>['inexistente'];
 assert.throws(()=>playShootout(w,h,'m1'),/shootout order/);
 assert.equal(w.matches.m1!.winnerId,undefined);
});
test('M25: evento normal de gol registrado uma única vez',()=>{
 const w=fixture(),calls:string[]=[];w.matches.m1!.events=[{kind:1,half:1,minute:1,detail:0,clubId:'a',playerId:'a10',done:false}];
 const r=new LiveRound(w,hooks([],calls));r.tick();assert.deepEqual(r.state.rows[1]?.goals,[1,0]);
 r.tick();assert.deepEqual(r.state.rows[1]?.goals,[1,0]);assert.equal(w.matches.m1!.events[0]?.done,true);
});
test('M25: assistido não conta gol e não é exibido duas vezes',()=>{
 const w=fixture();w.matches.m1!.events=[{kind:LIVE_EVENT.ASSIST,half:1,minute:1,detail:0,clubId:'a',done:false}];
 const r=new LiveRound(w,hooks());r.tick();assert.deepEqual(r.state.rows[1]?.goals,[0,0]);
 assert.equal(w.matches.m1!.events[0]?.done,true);
});
test('M25: penalidade convertida segue 6, 5, 100, 7 RNG, stats e engine',()=>{
 const w=fixture(),calls:string[]=[],g=w.matches.m1!;
 const e:LiveEvent={kind:1,half:1,minute:1,detail:3,clubId:'a',playerId:'a10',done:false};g.events.push(e);
 const r=new LiveRound(w,hooks([0,0,0,0],calls));r.tick();
 assert.deepEqual(calls.filter(x=>x.startsWith('rng:')),['rng:6','rng:5','rng:100','rng:7']);
 assert.equal(g.homeGoals,1);assert.equal(w.players.a10!.goals,1);assert.equal(g.shots[0],1);
 assert.equal(g.shotsOnTarget[0],1);assert.equal(e.flagDg,true);
 assert.deepEqual(r.state.rows[1]?.goals,[1,0]);
});
test('M25: penalidade perdida não conta gols e registra chute',()=>{
 const w=fixture(),calls:string[]=[],g=w.matches.m1!;
 const e:LiveEvent={kind:1,half:1,minute:1,detail:3,clubId:'a',playerId:'a10',done:false};g.events.push(e);
 const r=new LiveRound(w,hooks([0,0,99,2],calls));r.tick();
 assert.equal(g.homeGoals,0);assert.equal(e.kind,7);assert.equal(w.players.a10!.missedPenalties,1);
 assert.equal(g.valuesGa[0],1);assert.deepEqual(r.state.rows[1]?.goals,[0,0]);
});
test('M25: goleiro com trait1=1 reduz chances de penalidade',()=>{
 const w=fixture(),g=w.matches.m1!;w.players.b0!.trait1=1;
 const e:LiveEvent={kind:1,half:1,minute:1,detail:3,clubId:'a',playerId:'a10',done:false};
 assert.equal(resolveLivePenalty(w,hooks([0,0,60,1]),g,e,1),false); // odds=60, draw+1=61
});
test('M25: defesa de pênalti credita goleiro ao sorteio 0',()=>{
 const w=fixture(),g=w.matches.m1!;
 const e:LiveEvent={kind:1,half:1,minute:1,detail:3,clubId:'a',playerId:'a10',done:false};
 resolveLivePenalty(w,hooks([0,0,99,0]),g,e,1);
 assert.equal(e.otherPlayerId,'b0');assert.equal(w.players.b0!.penaltySaves,1);
});
test('M25: sorteio RNG inválido não é aceito',()=>{
 const w=fixture(),g=w.matches.m1!;
 const e:LiveEvent={kind:1,half:1,minute:1,detail:3,clubId:'a',playerId:'a10',done:false};
 assert.throws(()=>resolveLivePenalty(w,{...hooks(),freshInt:()=>100},g,e,1),/freshInt/);
});
test('M25: lesão do clube humano abre substituição, IA não',()=>{
 const w=fixture(),calls:string[]=[];w.matches.m1!.events=[
  {kind:5,half:1,minute:1,detail:0,clubId:'a',done:false},
  {kind:5,half:1,minute:1,detail:0,clubId:'b',done:false}];
 const r=new LiveRound(w,hooks([],calls));r.tick();assert.equal(calls.filter(x=>x==='sub:m1:false').length,1);
 assert.equal(w.clubs.b!.kit,1);
});
test('M25: troca do primeiro para o segundo tempo na contagem 49',()=>{
 const w=fixture(),calls:string[]=[],r=new LiveRound(w,hooks([],calls));
 for(let i=0;i<49;i++)r.tick();
 assert.equal(r.state.half,2);assert.equal(r.state.minute,0);
 assert(calls.includes('sub:m1:true'));assert(calls.includes('half:m1'));
});
test('M25: fechamento da rodada em 51 minutos do segundo tempo',()=>{
 const w=fixture(),calls:string[]=[],r=new LiveRound(w,hooks([],calls));
 for(let i=0;i<100;i++)r.tick();
 assert.equal(r.state.on,false);assert.equal(r.state.finished,true);
 assert.equal(calls.filter(x=>x==='finished').length,1);r.tick();
 assert.equal(calls.filter(x=>x==='finished').length,1);
});
test('M25: snapshot de exibição é cópia sem referência compartilhada',()=>{
 const w=fixture(),r=new LiveRound(w,hooks());const state=r.snapshot();state.rows[1]!.goals[0]=9;
 assert.equal(r.state.rows[1]!.goals[0],0);
});
test('M25: competição de liga repetida no dia permite grupo separado',()=>{
 const w=fixture(1);w.countries.c!.followed=true;
 const r=new LiveRound(w,hooks());assert.equal(r.state.groups.length,1);
});
test('M25: nenhum jogo nem competição conclui sem eventos',()=>{
 const w=fixture();w.todayMatches=[];w.todayCompetitions=[];let done=0;
 const r=new LiveRound(w,{...hooks(),onFinished:()=>done++});assert.equal(r.state.on,false);assert.equal(done,1);
});
test('M25: world de entrada não é clonada silenciosamente, cliente recebe efeitos verificáveis',()=>{
 const w=fixture(),r=new LiveRound(w,hooks());assert.equal(r.world,w);
 assert.equal(r.state.rows[1]?.matchId,'m1');
});

test('M25: presença de clube humano no país independe de jogar hoje',()=>{
 const w=fixture(1);w.todayMatches=[];
 assert.equal(countryHasHumanLeague(w,'c'),true);
 assert.equal(countryPlaysToday(w,'c'),false);
});
