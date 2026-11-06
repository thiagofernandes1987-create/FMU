/**
 * FMU M25 — ponte visual da rodada para a carreira fictícia do M24.
 * ORIGEM: controlador `m25/simulation/live_round.ts` derivado de
 * `simulation/src/human/round.rs` + DemoFixture M24.
 *
 * Responsabilidade: reexibir gols JÁ SIMULADOS de uma partida concluída;
 *   constrói eventos de tempos ILUSTRATIVOS. Não recalcula placar do jogo,
 *   não altera rating/fitness/caixa/fixtures/estatísticas da carreira.
 * Dependências: DemoCareer (leitura), LiveRound (clock e event accounting).
 * I/O: ID da partida finalizada -> quadro de replay + eventos e minuto.
 * EFEITOS: somente relógio e DTO efêmero do replay; save JSON M24 inalterado.
 * Limite: a cronologia é sintética e claramente rotulada na interface.
 */
import {DemoCareer,DemoFixture,DemoPlayer} from '../../m24/web/career_demo';
import {LiveRound,LiveWorld,LiveGame,LivePlayer,LiveEvent,LiveRoundState,RoundHooks,LIVE_EVENT} from '../simulation/live_round';
function hash(text:string):number {
 let value=2166136261;for(let i=0;i<text.length;i++)value=Math.imul(value^text.charCodeAt(i),16777619);
 return value>>>0;
}
function playerId(p:DemoPlayer):string{return p.id;}
/** Converte as 11 posições reais do squad demo em atletas de jogo sem mutar fonte. */
function playersFor(s:DemoCareer,clubId:string,store:Record<string,LivePlayer>):string[] {
 const club=s.clubs.find(x=>x.id===clubId);
 if(!club)throw Error('Replay club missing: '+clubId);
 return club.startingIds.map((id,index)=>{
  const p=club.players.find(x=>x.id===id);if(!p)throw Error('Replay starter missing: '+id);
  store[id]={id:playerId(p),clubId,position:p.position==='GOL'?0:p.position==='DEF'?2:p.position==='MEI'?3:4,
   strength:p.rating,age:p.age,fitness:p.fitness,slot:p.position==='GOL'?1:index+2,
   trait1:0,trait2:0,star:false,worldClass:false,goals:0,missedPenalties:0,penaltySaves:0};
  return id;
 });
}
/** Marcadores ilustrativos, sem números aleatórios nem acesso à engine de partidas. */
export function replayGoalEvents(f:DemoFixture):LiveEvent[] {
 if(!f.played||f.homeGoals===undefined||f.awayGoals===undefined)throw Error('Replay requires finished fixture');
 const events:LiveEvent[]=[];
 for(const [side,count] of [[f.home,f.homeGoals],[f.away,f.awayGoals]] as const){
  for(let n=0;n<count;n++){
   const draw=hash(f.id+'|'+side+'|'+n),half=n%2===0?1:2,minute=5+draw%39;
   events.push({kind:LIVE_EVENT.GOAL,half,minute,detail:0,clubId:side,done:false});
  }
 }
 return events.sort((a,b)=>a.half-b.half||a.minute-b.minute||String(a.clubId).localeCompare(String(b.clubId)));
}
/** Estado seguro com representação de apenas uma partida; nenhuma fonte foi atualizada. */
export function replayWorld(s:DemoCareer,matchId:string):LiveWorld {
 const g=s.fixtures.find(x=>x.id===matchId);
 if(!g||!g.played||g.homeGoals===undefined||g.awayGoals===undefined)throw Error('Apenas partidas encerradas podem ser revistas');
 const players:Record<string,LivePlayer>={},homePlayed=playersFor(s,g.home,players),awayPlayed=playersFor(s,g.away,players);
 const match:LiveGame={id:g.id,competitionId:'liga-demo',home:g.home,away:g.away,homePlayed,awayPlayed,
  events:replayGoalEvents(g),homeGoals:g.homeGoals,awayGoals:g.awayGoals,knockout:false,needsShootout:false,
  addedByHalf:[0,0,0],shots:[0,0],shotsOnTarget:[0,0],valuesGa:[0,0]};
 const allClubIds=[g.home,g.away];
 return {players,clubs:Object.fromEntries(allClubIds.map(id=>[id,{id,countryId:'demo',human:id===s.myClubId}])),
  competitions:{'liga-demo':{id:'liga-demo',kind:9,countryId:'demo'}},countries:{},
  matches:{[g.id]:match},todayMatches:[g.id],todayCompetitions:['liga-demo'],leagueCountries:[],
  favouriteCountryCode:29,showAIShootouts:false,showHalfTimeSubstitutions:false};
}
export interface ReplayFrame {matchId:string;half:1|2;minute:number;finished:boolean;
  homeGoals:number;awayGoals:number;history:{half:number;minute:number;clubId:string;type:'goal'}[];}
/** Controlador efêmero de replay; `advance()` e `finish()` não tocam no save. */
export class DemoMatchReplay {
 readonly world:LiveWorld;readonly round:LiveRound;
 constructor(readonly career:DemoCareer,readonly matchId:string){
  this.world=replayWorld(career,matchId);
  const hooks:RoundHooks={checkpoint:()=>{},freshInt:()=>0,onFinished:()=>{}};
  this.round=new LiveRound(this.world,hooks);
 }
 advance(steps:number):ReplayFrame {
  if(!Number.isSafeInteger(steps)||steps<0||steps>100)throw Error('Quantidade inválida de minutos para replay');
  for(let i=0;i<steps&&this.round.state.on;i++)this.round.tick();
  return this.frame();
 }
 finish():ReplayFrame {for(let i=0;i<100&&this.round.state.on;i++)this.round.tick();return this.frame();}
 frame():ReplayFrame {
  const m=this.world.matches[this.matchId]!;
  const row=this.round.state.rows.find(x=>x.matchId===this.matchId);
  const displayed=row?.goals??[0,0];
  return {matchId:this.matchId,half:this.round.state.half,minute:this.round.state.minute,
   finished:!this.round.state.on,homeGoals:displayed[0]!,awayGoals:displayed[1]!,
   history:m.events.filter(e=>e.done&&e.kind===LIVE_EVENT.GOAL).map(e=>({half:e.half,minute:e.minute,clubId:e.clubId!,type:'goal'}))};
 }
}
