/**
 * FMU M25 — port COMPORTAMENTAL de `crates/simulation/src/human/round.rs`.
 * Fonte: Brasfoot Next `bd2ccbd`, licença GPL-3.0-only.
 *
 * Responsabilidades: compor grupos de competições, linhas de uma rodada, avançar
 *   relógio 2 tempos, exibir eventos, reprocessar gols, pênaltis em jogo e
 *   disputas de pênaltis, com hooks para decisões humanas e engine original.
 * Dependências: `LiveWorld` com DTOs explícitos, `RoundHooks` para RNG, motor,
 *   decisões, notificações e fechamento do dia. NÃO instancia World/Rust.
 * Efeitos: altera o `LiveWorld` passado (event.done, placar, stats e winner) e
 *   estado `LiveRoundState`; `onFinished` chamado uma vez ao terminar os grupos.
 * Invariantes: relógio segundo tempo até 51, eventos sem duplicação, sorteios
 *   com mesma ORDEM do Rust, sem pontuação inventada, IDs permanentes strings.
 * Limites importantes: `rust unported!` para tipos 3/7/8/10 e fallback de copas
 *   são erros explícitos. `MatchEngine.play_minute` deve ser fornecido pelo
 *   consumidor; não é o motor de partidas portado. Testes M25 e matriz M25.
 */
export const LIVE_EVENT={GOAL:1,YELLOW:2,SECOND_YELLOW:3,RED:4,INJURY:5,SUBSTITUTION:6,MISSED_PENALTY:7,ASSIST:8} as const;
export type LivePlayerId=string;
export type LiveClubId=string;
export type LiveMatchId=string;
export type LiveCompetitionId=string;
export interface LivePlayer {
 id:LivePlayerId;position:number;strength:number;age:number;fitness:number;
 slot:number;trait1:number;trait2:number;star:boolean;worldClass:boolean;clubId?:LiveClubId;
 goals:number;missedPenalties:number;penaltySaves:number;
}
export interface LiveClub {
 id:LiveClubId;human:boolean;countryId:string;penaltyTaker?:string;
 captain?:string;kit?:number;
}
export interface LiveCompetition {id:LiveCompetitionId;kind:number;countryId?:string;}
export interface LiveCountry {
 id:string;code:number;divisions:string[];leagueClubIds:string[];cup?:string;followed:boolean;
}
export interface LiveEvent {
 kind:number;half:number;minute:number;clubId?:string;detail:number;
 playerId?:string;otherPlayerId?:string;done:boolean;flagDg?:boolean;
}
export interface LiveGame {
 id:LiveMatchId;competitionId?:string;home:string;away:string;
 homePlayed:string[];awayPlayed:string[];events:LiveEvent[];
 homeGoals:number;awayGoals:number;knockout:boolean;needsShootout:boolean;
 /** `game.values_fq[half]` — minuto de acréscimos a partir do qual o motor avança. */
 addedByHalf:[number,number,number];
 shots:[number,number];shotsOnTarget:[number,number];valuesGa:[number,number];
 winnerId?:string;penaltyShootout?:number[];stadiumId?:string;
}
export interface LiveWorld {
 players:Record<string,LivePlayer>;clubs:Record<string,LiveClub>;
 competitions:Record<string,LiveCompetition>;countries:Record<string,LiveCountry>;
 matches:Record<string,LiveGame>;todayMatches:string[];todayCompetitions:string[];
 leagueCountries:string[];favouriteCountryCode:number;
 showAIShootouts:boolean;showHalfTimeSubstitutions:boolean;
}
export interface RoundHooks {
 /** Runtime.checkpoint — chamado antes dos efeitos de cada tick. */
 checkpoint(name:string):void;
 /** RNG equivalente a `fresh_int(n)` — faixa [0,n). */
 freshInt(bound:number):number;
 /** Retorna a lista de jogadores/pessoas escolhida via interação humana. */
 choosePenaltyTaker?(matchId:string,clubId:string):string|undefined;
 substitutions?(matchId:string,halfTime:boolean):void;
 /** `Play.half_time_changes()` no segundo tempo. */
 halfTimeChanges?(matchId:string):void;
 /** `Play.play_minute()` é injetado: nenhum placar simulado silenciosamente. */
 playMinute?(matchId:string,minute:number,half:number):void;
 addEngineGoal?(matchId:string,side:0|1):void;
 shootoutOrder?(matchId:string,clubId:string,players:readonly string[]):string[];
 /** `Play.goes_to_penalties` é explicitamente representado por `needsShootout`. */
 onFinished():void;
}
export interface LiveRow {matchId?:string;competitionId?:string;human:boolean;goals:[number,number];}
export interface LiveRoundState {on:boolean;over:boolean;half:1|2;minute:number;
 groups:{ids:string[];pending:boolean}[];rows:LiveRow[];finished:boolean;}
function need<T>(v:T|undefined,kind:string,id:string):T {
 if(v===undefined)throw new Error(`Missing ${kind}: ${id}`);return v;
}
function asMatch(w:LiveWorld,id:string):LiveGame{return need(w.matches[id],'match',id);}
function asClub(w:LiveWorld,id:string):LiveClub{return need(w.clubs[id],'club',id);}
function asPlayer(w:LiveWorld,id:string):LivePlayer{return need(w.players[id],'player',id);}
function asCompetition(w:LiveWorld,id:string):LiveCompetition{return need(w.competitions[id],'competition',id);}
function asCountry(w:LiveWorld,id:string):LiveCountry{return need(w.countries[id],'country',id);}
/** Hook RNG validado para rejeitar geradores incompatíveis antes de efeitos de gol. */
function fresh(h:RoundHooks,bound:number):number {
 const n=h.freshInt(bound);
 if(!Number.isSafeInteger(n)||n<0||n>=bound)throw new RangeError(`Invalid freshInt(${bound})`);
 return n;
}
/** `human_plays(m)`: ao menos um clube sob controle humano. */
export function humanPlays(w:LiveWorld,id:string):boolean {
 const m=asMatch(w,id);return asClub(w,m.home).human||asClub(w,m.away).human;
}
/** `country_has_human_club`: busca todo o elenco das ligas do país,
 * inclusive clube humano que NÃO joga hoje; não aproxima por partidas do dia. */
export function countryHasHumanLeague(w:LiveWorld,countryId:string):boolean {
 const c=asCountry(w,countryId);
 return c.leagueClubIds.some(id=>asClub(w,id).human);
}
/** `country_plays_today`: liga desse país disputada na data atual. */
export function countryPlaysToday(w:LiveWorld,countryId:string):boolean {
 const c=asCountry(w,countryId);
 return w.todayMatches.some(id=>{const m=asMatch(w,id);return m.competitionId!==undefined&&c.divisions.includes(m.competitionId);});
}
/** `round_shows`: o Rust não porta opções internacionais; mantém erro explícito. */
export function roundShows(w:LiveWorld,competitionId:string):boolean {
 if(w.todayMatches.some(id=>asMatch(w,id).competitionId===competitionId&&humanPlays(w,id)))return true;
 if(asCompetition(w,competitionId).kind===0)return false;
 throw new Error('Rust unported: international round options');
}
/** `league_groups`: um grupo por país seguido com humanos; fallback favorito. */
export function leagueGroups(w:LiveWorld):string[][] {
 const groups:string[][]=[];let last:string[]=[];
 for(const id of w.leagueCountries){
  const c=asCountry(w,id);
  if((countryHasHumanLeague(w,id)||c.followed)&&countryPlaysToday(w,id)){
   last=w.todayCompetitions.filter(comp=>asCompetition(w,comp).countryId===id);
   if(last.length)groups.push([...last]);
  }
 }
 if(!last.length)for(const id of [...w.leagueCountries].reverse()){
  const c=asCountry(w,id);
  if(c.code===w.favouriteCountryCode&&countryPlaysToday(w,id)){
   const g=w.todayCompetitions.filter(comp=>asCompetition(w,comp).countryId===id);
   if(g.length)groups.push(g);
  }
 }
 return groups;
}
/** `cup_groups`: somente copas com time humano; fallback da fonte é `unported!`. */
export function cupGroups(w:LiveWorld):string[][] {
 const groups:string[][]=[];let last:string[]=[];
 for(const id of w.leagueCountries){
  const cup=asCountry(w,id).cup;
  if(!cup)continue;
  if(w.todayMatches.some(mid=>asMatch(w,mid).competitionId===cup&&humanPlays(w,mid))){
   last=w.todayCompetitions.filter(x=>x===cup);
   if(last.length)groups.push(last);
  }
 }
 if(!last.length)throw new Error('Rust unported: cup without human club');
 return groups;
}
/** `ah.Q/R`: cobrar prioridade à habilidade e trait de pênalti 9, sem goleiro. */
export function fixPenaltyTaker(w:LiveWorld,clubId:string,onPitch:readonly string[]):void {
 const c=asClub(w,clubId);
 if(c.penaltyTaker&&onPitch.includes(c.penaltyTaker))return;
 const sorted=[...onPitch].sort((a,b)=>asPlayer(w,b).strength-asPlayer(w,a).strength);
 const id=sorted.find(x=>asPlayer(w,x).trait1===9)??sorted.find(x=>asPlayer(w,x).position!==0);
 if(id)c.penaltyTaker=id;
}
/** `ah.O/P`: capitão mais forte, o mais velho como desempate, e do mesmo clube. */
export function fixCaptain(w:LiveWorld,clubId:string,onPitch:readonly string[]):void {
 const c=asClub(w,clubId);if(c.captain&&onPitch.includes(c.captain))return;
 const sorted=[...onPitch].sort((a,b)=>asPlayer(w,b).strength-asPlayer(w,a).strength||asPlayer(w,b).age-asPlayer(w,a).age);
 const id=sorted[0];if(id&&asPlayer(w,id).clubId===clubId)c.captain=id;
}
/** Ordem da IA em shootout: comparador original pode não ser transitivo; NÃO
 * trocar por comparador de força comum, pois isso mudaria a ordem dos sorteios. */
export function shootoutRule(w:LiveWorld,a:string,b:string):number {
 const pa=asPlayer(w,a),pb=asPlayer(w,b);
 if(pa.position>pb.position)return -1;
 if(pa.strength>pb.strength)return -1;
 if(pa.strength<pb.strength)return 1;
 if(pa.fitness>pb.fitness)return -1;
 if(pa.fitness<pb.fitness)return 1;
 return 0;
}
/** `bg.cP`: determina o vencedor quando já não é possível alcançar ou, após
 * as cinco cobranças, na morte súbita, apenas depois do chute visitante. */
export function shootoutWinner(side:1|2,scored:boolean,score:readonly [number,number],kicks:readonly [number,number,number]):1|2|undefined {
 if(side===1&&kicks[1]<=5){
  if(scored&&score[0]>5-kicks[2]+score[1])return 1;
  if(5-kicks[1]+score[0]<score[1])return 2;
 }else if(side===2&&kicks[2]<=5){
  if(scored&&5-kicks[1]+score[0]<score[1])return 2;
  if(score[0]>5-kicks[2]+score[1])return 1;
 }else if(side===2&&kicks[2]>5){
  if(score[0]>score[1])return 1;
  if(score[0]<score[1])return 2;
 }
 return undefined;
}
/** `bg` e `a.bg`: cinco cobranças por equipe + morte súbita, chance de 70%.
 * A engine não é substituída; apenas o desempate já sinalizado pelo World. */
export function playShootout(w:LiveWorld,h:RoundHooks,matchId:string):1|2 {
 const game=asMatch(w,matchId);
 const sides=[game.home,game.away] as const;
 const lists=[...game.homePlayed],away=[...game.awayPlayed];
 const rosters=[lists,away];
 for(let i=0;i<2;i++){
  const id=sides[i]!;
  if(asClub(w,id).human){
   const selected=h.shootoutOrder?.(matchId,id,[...rosters[i]!])??rosters[i]!;
   if(selected.length!==rosters[i]!.length||new Set(selected).size!==selected.length||selected.some(p=>!rosters[i]!.includes(p)))throw new Error('Invalid human shootout order');
   rosters[i]=[...selected];
  }else rosters[i]!.sort((a,b)=>shootoutRule(w,a,b));
  if(!rosters[i]!.length)throw new Error('Shootout requires on-field players');
 }
 const next=[0,0],score:[number,number]=[0,0],kicks:[number,number,number]=[0,0,0];
 let side:1|2=1;
 for(let step=0;step<300;step++){
  const i=side-1,list=rosters[i]!;
  if(next[i]!>=list.length)next[i]=0;
  const scored=fresh(h,100)<70;next[i]!++;
  if(scored)score[i]!++;
  kicks[side]!++;
  const winner=shootoutWinner(side,scored,score,kicks);
  if(winner){game.winnerId=sides[winner-1]!;game.penaltyShootout=[...score];return winner;}
  side=side===1?2:1;
 }
 throw new Error('Shootout exceeded 300 kicks');
}
/** Resolve `a.gb` reproduzindo consumo RNG de comentários 6,5, chance 100 e
 * comentário final 7. Atualiza event kind, chute, placar e estatísticas. */
export function resolveLivePenalty(w:LiveWorld,h:RoundHooks,g:LiveGame,event:LiveEvent,side:1|2):boolean {
 const keeperId=(side===1?g.awayPlayed:g.homePlayed).find(x=>asPlayer(w,x).slot===1);
 const taker=asPlayer(w,need(event.playerId,'penalty taker',g.id));
 // Comentários do motor sempre sorteados PRIMEIRO.
 fresh(h,6);fresh(h,5);
 let odds=70;
 if(taker.trait1===9||taker.trait2===9||taker.worldClass)odds+=10;
 if(taker.star)odds+=5;
 if(keeperId){const k=asPlayer(w,keeperId);
  if(k.trait1===1||k.trait2===1)odds-=10;
  if(k.worldClass)odds-=10;
  if(k.star)odds-=5;
 }
 const scored=fresh(h,100)+1<=odds,i=side-1;
 if(scored){
  fresh(h,7);
  if(side===1)g.homeGoals++;else g.awayGoals++;
  g.shots[i]!++;g.shotsOnTarget[i]!++;taker.goals++;
  h.addEngineGoal?.(g.id,i as 0|1);
 }else{
  g.shots[i]!++;taker.missedPenalties++;
  const how=fresh(h,7);
  if(how!==2&&how!==6)g.shotsOnTarget[i]!++;
  else g.valuesGa[i]!++;
  event.kind=LIVE_EVENT.MISSED_PENALTY;
  if(how===0||how===3||how===5){
   if(!keeperId)throw new Error('Rust penalty save without goalkeeper');
   event.otherPlayerId=keeperId;asPlayer(w,keeperId).penaltySaves++;
  }
 }
 event.flagDg=true;
 return scored;
}
/** `LiveRound`: avança eventos por minuto; usa World+hooks reais do consumidor.
 * Não cria eventos de partida: recebe os produzidos pelo motor/fixture. */
export class LiveRound {
 readonly state:LiveRoundState;
 constructor(readonly world:LiveWorld,readonly hooks:RoundHooks){
  for(const id of world.todayMatches)asMatch(world,id);
  const first=world.todayCompetitions[0];
  let groups:string[][]=[];
  if(first){const kind=asCompetition(world,first).kind;
   switch(kind){
    case 1:groups=leagueGroups(world);break;
    case 2:groups=cupGroups(world);break;
    case 9:case 11:groups=[world.todayCompetitions];break;
    case 3:case 7:case 8:case 10:throw new Error(`Rust unported round kind: ${kind}`);
    default:groups=world.todayCompetitions.filter(id=>roundShows(world,id)).map(id=>[id]);
   }
  }
  this.state={on:true,over:false,half:1,minute:0,groups:groups.map(ids=>({ids:[...ids],pending:true})),rows:[],finished:false};
  this.nextGroup();
 }
 /** `s.dJ`: consome próximo grupo, ou encerra dia uma única vez. */
 nextGroup():void {
  const next=this.state.groups.find(g=>g.pending);
  if(!next){this.state.on=false;this.state.finished=true;this.hooks.onFinished();return;}
  next.pending=false;this.showGroup(next.ids);
 }
 /** `dV.Y`: título e linhas de jogos, em ordem original da competição. */
 showGroup(ids:readonly string[]):void {
  this.state.minute=0;this.state.half=1;this.state.over=false;this.state.rows=[];
  for(const id of ids){let first=true;
   for(const mid of this.world.todayMatches){const game=asMatch(this.world,mid);
    if(game.competitionId!==id)continue;
    if(first){this.state.rows.push({competitionId:id,human:false,goals:[0,0]});first=false;}
    const human=humanPlays(this.world,mid);
    fixPenaltyTaker(this.world,game.home,game.homePlayed);
    fixCaptain(this.world,game.home,game.homePlayed);
    fixPenaltyTaker(this.world,game.away,game.awayPlayed);
    fixCaptain(this.world,game.away,game.awayPlayed);
    this.state.rows.push({matchId:mid,competitionId:id,human,goals:[0,0]});
   }
  }
 }
 /** `dV.qa`: 49 ticks no primeiro tempo, 51 no segundo. */
 tick():void {
  if(!this.state.on)return;
  this.hooks.checkpoint(`tick ${this.state.half} ${this.state.minute}`);
  this.state.minute++;
  if(this.state.half===1&&this.state.minute>48)this.halfTime();
  if(this.state.half===2&&this.state.minute>=51){this.over();return;}
  this.minuteEvents();
 }
 private halfTime():void {
  this.state.minute=0;this.state.half=2;
  if(this.world.showHalfTimeSubstitutions)for(const row of this.state.rows)
   if(row.human&&row.matchId)this.hooks.substitutions?.(row.matchId,true);
  for(const row of this.state.rows)if(row.human&&row.matchId)this.hooks.halfTimeChanges?.(row.matchId);
 }
 private minuteEvents():void {
  for(const row of this.state.rows)if(row.human&&row.matchId){
   const game=asMatch(this.world,row.matchId);
   if((game.addedByHalf[this.state.half]??0)<=this.state.minute)this.hooks.playMinute?.(row.matchId,this.state.minute,this.state.half);
  }
  for(const row of this.state.rows){
   if(!row.matchId)continue;
   const game=asMatch(this.world,row.matchId);
   for(const event of game.events)if(!event.done&&event.half===this.state.half&&event.minute<=this.state.minute)
    this.showEvent(row,game,event);
  }
 }
 private showEvent(row:LiveRow,g:LiveGame,event:LiveEvent):void {
  // ASSIST fica feito, mas não tem efeito adicional no placar.
  event.done=true;
  const side=event.clubId===g.home?1:event.clubId===g.away?2:0;
  if(side===0)return;
  const human=asClub(this.world,event.clubId!).human;
  if(event.kind===LIVE_EVENT.GOAL){
   if(event.detail===3&&row.human){
    if(human){const choose=this.hooks.choosePenaltyTaker?.(g.id,event.clubId!);
     if(choose!==undefined){if(!this.world.players[choose])throw new Error('Human selected missing penalty taker');event.playerId=choose;}}
    if(resolveLivePenalty(this.world,this.hooks,g,event,side))row.goals[side-1]!++;
   }else row.goals[side-1]!++;
  }else if(human&&(event.kind===LIVE_EVENT.RED||event.kind===LIVE_EVENT.SECOND_YELLOW||event.kind===LIVE_EVENT.INJURY)){
   if(!asClub(this.world,g.home).human)asClub(this.world,g.home).kit=0;
   if(!asClub(this.world,g.away).human)asClub(this.world,g.away).kit=1;
   this.hooks.substitutions?.(g.id,false);
  }
 }
 /** `dV.qc`: reconcilia placar por eventos se mandante divergiu; shootout. */
 over():void {
  if(this.state.over)return;this.state.over=true;
  for(const row of this.state.rows){
   if(!row.matchId)continue;
   const g=asMatch(this.world,row.matchId);
   if(g.homeGoals!==row.goals[0]){
    g.homeGoals=g.events.filter(e=>e.kind===LIVE_EVENT.GOAL&&e.clubId===g.home).length;
    g.awayGoals=g.events.filter(e=>e.kind===LIVE_EVENT.GOAL&&e.clubId===g.away).length;
   }
  }
  for(const row of this.state.rows){
   if(!row.matchId)continue;const g=asMatch(this.world,row.matchId);
   if(g.knockout&&g.needsShootout&&(row.human||this.world.showAIShootouts))playShootout(this.world,this.hooks,g.id);
  }
  this.nextGroup();
 }
 /** Snapshot de estado de UI; o World do jogo deve ser salvo separadamente. */
 snapshot():LiveRoundState {return JSON.parse(JSON.stringify(this.state)) as LiveRoundState;}
}
