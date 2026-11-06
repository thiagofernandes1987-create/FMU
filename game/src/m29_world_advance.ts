/**
 * M29 — avanço transacional de um dia de carreira Brasfoot Next.
 * Fontes Rust: simulation/src/game.rs::advance/play_match_day/after_day/next_day,
 * model/src/player.rs::recover_between_matches e model/world.rs::club_expense.
 *
 * CONTRATO: nenhum placar, desempenho, classificação ou nova temporada é inventado.
 * Os trechos cuja engine/paridade Rust ainda não foi portada exigem hooks explícitos.
 * worldTransaction clona o CBOR, preservando BigInt, mapas, referências e campos futuros.
 * O World original não é alterado quando qualquer hook, auditoria ou codec falha.
 */
import {WorldDocument,RustWorld,preflightWorldRuntime} from './m27/persistence/bfn_world';
import {worldTransaction} from './m27/persistence/world_access';
import {findNextPlayableDay,firstWaitingHumanLineup,worldMatchKind} from './m28/world_calendar';
import {worldClubWages,worldClubExpense,worldClubPayment} from './m28/world_finances';
import {auditWorldSemantics} from './m28/world_audit';
import {CborRecord,CborValue} from './m26/persistence/cbor';

function int(value:CborValue,path:string):number{
 if(typeof value==='number'&&Number.isSafeInteger(value))return value;
 if(typeof value==='bigint'&&value>=BigInt(Number.MIN_SAFE_INTEGER)&&value<=BigInt(Number.MAX_SAFE_INTEGER))return Number(value);
 throw new RangeError(`Expected safe integer at ${path}`);
}
function index(v:CborValue,len:number,label:string):number{
 const i=int(v,label);if(i<0||i>=len)throw new RangeError(`Invalid ${label}`);return i;
}
function dayAt(w:RustWorld,i:number):CborRecord{
 const d=w.game.days as CborRecord[];
 if(!Array.isArray(d)||!d[i])throw new RangeError('Day outside calendar');
 return d[i]!;
}
function refs(v:CborValue,len:number,label:string):number[]{
 if(!Array.isArray(v))throw Error(`Expected ${label} array`);
 const out=v.map((n,i)=>index(n,len,`${label}[${i}]`));
 if(new Set(out).size!==out.length)throw Error(`Duplicate ${label} reference`);
 return out;
}
export interface WorldAdvanceHooks {
 /** Real match engine: MUST produce played=true, valid score and result events in World. */
 playMatch?:(world:RustWorld,matchId:number)=>void;
 /** AI lineup selection: engine/lineup.rs, mandatory when an AI club has not confirmed. */
 pickAiLineup?:(world:RustWorld,matchId:number,clubId:number,side:1|2)=>void;
 /** Rust `after_match`, reports goals/cards/ratings/finances, not silently skipped. */
 afterMatch?:(world:RustWorld,matchId:number)=>void;
 /** Rust `team_of_the_round` / `league_round` / `knockout_round` as one stage transaction. */
 processStage?:(world:RustWorld,stageId:number)=>void;
 /** National league team-of-round must run before standings are finalized. */
 teamOfRound?:(world:RustWorld,leagueId:number)=>void;
 /** Rust custom `day_task` codes not implemented by the transaction runner. */
 processTask?:(world:RustWorld,code:string,originDay:number,after:boolean)=>void;
 /** Rust `coach_changes` for League or State match kinds. */
 coachChanges?:(world:RustWorld,kind:number)=>void;
 /** `loans_coming_back` of simulation/market.rs. */
 returnLoans?:(world:RustWorld)=>void;
 /** `sell_listed_players` when the legacy RNG draws >50. */
 sellListed?:(world:RustWorld)=>void;
 /** `finish_stadium_works` of simulation/game.rs. */
 finishStadiumWorks?:(world:RustWorld)=>void;
 /** Rust `end_season` + ModSystems.season_end_screen, required at terminal day. */
 endSeason?:(world:RustWorld)=>void;
 /** RNG `fresh_int(100)` of the caller's runtime; `no sale` is not a guessed result. */
 draw100:()=>number;
 /** Runtime Clock.fields(timestamp).month, 0-based. */
 monthOf:(epoch:bigint)=>number;
 /** Rust `evolve_players` is not silently substituted by an empty step. */
 evolvePlayers?:(world:RustWorld)=>void;
 /** Rebuilds optional coach sorting; needed only when >1 coaches. */
 sortCoaches?:(world:RustWorld,a:number,b:number)=>number;
}
export interface WorldAdvanceInfo {document:WorldDocument;day:number;nextDay:number|null;matches:number[];seasonOver:boolean;tasks:string[];draw:number;}
export interface WorldAdvancePaused {paused:true;clubId:number;matchId:number;document:WorldDocument;}
export type WorldAdvanceResult=WorldAdvanceInfo|WorldAdvancePaused;

/** A routine that has not been ported MUST stop rather than produce a guessed result. */
function needs<T extends (...args:any[])=>any>(v:T|undefined,name:string):T {
 if(!v)throw new Error(`M29 missing required real-engine hook: ${name}`);
 return v;
}
/** Exact `Player.recover_between_matches` thresholds from model/src/player.rs. */
export function recoverWorldPlayer(w:RustWorld,playerId:number,humanClub:boolean):void{
 const p=w.players[index(playerId,w.players.length,'PlayerId')]!;
 const age=int(p.age,'player.age'),fitness=int(p.fitness,'player.fitness');
 const played=p.started_recently===true;
 const amount=played?(humanClub?(age<=20?13:age<=25?24:age<=31?37:age<=36?40:30):
   (age<=20?20:age<=25?30:age<=31?50:age<=36?52:42)):
   (age<20?30:age<26?30:age<33?35:age<45?35:30);
 p.fitness=Math.min(100,fitness+amount);
}
/** `after_matches`: recovery of all active and youth players, without modifying match events. */
export function recoverWorldRoster(w:RustWorld,kind:number):void{
 const players=refs(w.game.players,w.players.length,'game.players');
 for(const pId of players){const p=w.players[pId]!;const c=p.club;
  const human=c===null||c===undefined?false:w.clubs[index(c,w.clubs.length,'player.club')]!.human===true;
  recoverWorldPlayer(w,pId,human);
 }
 for(const pId of refs(w.game.youth_players,w.players.length,'game.youth_players'))w.players[pId]!.fitness=100;
 if(kind===7||kind===9){
  for(const cid of refs(w.game.countries,w.countries.length,'game.countries')){
   const team=w.countries[cid]!.national_team;
   if(team===null||team===undefined)continue;
   for(const pid of refs(w.clubs[index(team,w.clubs.length,'national_team')]!.squad,w.players.length,'national squad')){
    if(w.players[pid]!.club==null)recoverWorldPlayer(w,pid,false);
   }
  }
 }
}
/**
 * Match-day tasks `ds` (wages) and `dJ` (bank interest) are concrete Rust ports.
 * `cw`, `aj`, `cD`, national-team offers and other active tasks need real hooks.
 * The two no-op schedule markers are ignored, exactly as Rust game.rs.
 */
export function runWorldDayTask(w:RustWorld,code:string,originDay:number,after:boolean,h:WorldAdvanceHooks):void{
 const origin=dayAt(w,originDay);
 const clubIds=refs(w.game.human_clubs,w.clubs.length,'game.human_clubs');
 if(code==='ds'){
  const month=h.monthOf(BigInt(int(origin.date,'day.date')));
  if(!Number.isInteger(month)||month<0||month>11)throw RangeError('Invalid Clock month');
  for(const cid of clubIds){
   const active=(w.game.days as CborRecord[]).some(day=>h.monthOf(BigInt(int(day.date,'day.date')))===month&&
    refs(day.matches,w.matches.length,'day.matches').some(mid=>w.matches[mid]!.home===cid||w.matches[mid]!.away===cid));
   if(active)worldClubExpense(w,cid,worldClubWages(w,cid));
  }
 } else if(code==='dJ'){
  for(const cid of clubIds){const finances=w.clubs[cid]!.finances;
   if(!finances||typeof finances!=='object'||Array.isArray(finances)||finances instanceof Map||finances instanceof Uint8Array||'tag' in finances)throw Error('Invalid finances');
   const interest=int(finances.bank_interest,'bank_interest');if(interest>0)worldClubPayment(w,cid,interest,4);
  }
 } else if(code==='aj')needs(h.evolvePlayers,'evolve_players')(w);
 else if(code==='criaMataMataAscenso'||code==='criaplayOffRebaixamento'||code==='')return;
 else needs(h.processTask,`day_task(${code})`)(w,code,originDay,after);
}
function drainTasks(w:RustWorld,after:boolean,through:number,h:WorldAdvanceHooks,log:string[]):void{
 for(let i=0;i<=through;i++){
  const d=dayAt(w,i),key=after?'tasks_after':'tasks_before';
  if(!Array.isArray(d[key]))throw Error(`Invalid day.${key}`);
  const entries=[...(d[key] as string[])];d[key]=[];
  for(const code of entries){if(typeof code!=='string')throw Error('Invalid day task');
   runWorldDayTask(w,code,i,after,h);log.push(`${after?'post':'pre'}:${i}:${code}`);
  }
 }
}
/**
 * M29 transactional `Sim::advance` adapter. Original Rust game.rs is the state-machine contract:
 * wait for human lineup, engine, postmatch, recovery, stage, pre-day tasks, next day,
 * coach changes, loans, market, works, post-day tasks, season ending.
 * Returns a new validated WorldDocument; `doc` is never mutated. No UI effects.
 * If full engine hooks are not available, this function FAILS CLOSED.
 */
export function advanceWorldOneDay(doc:WorldDocument,h:WorldAdvanceHooks):WorldAdvanceResult{
 const w=doc.world;
 const readiness=preflightWorldRuntime(w);
 if(!readiness.minimumReady)throw Error('M29 runtime preflight blocked: '+readiness.blockers.map(b=>b.path).join(', '));
 if(w.game.season_over===true)throw Error('M29 new_season requires calendar generator/engine hooks not ported');
 const current=index(w.game.day,(w.game.days as CborValue[]).length,'game.day');
 const d=dayAt(w,current);
 if(d.done===true)throw Error('Current day already done; advance cursor explicitly before retry');
 if(int(d.kind,'day.kind')<=0||!Array.isArray(d.matches)||d.matches.length===0)throw Error('Current day is not playable');
 const pending=firstWaitingHumanLineup(w,current);
 if(pending)return {paused:true,...pending,document:doc};
 const matchIds=refs(d.matches,w.matches.length,'day.matches');
 // Preflight mandatory integrations before any work so unsupported states fail fast.
 if(matchIds.some(id=>w.matches[id]!.played!==true))needs(h.playMatch,'play_match_day');
 needs(h.afterMatch,'after_match');
 const stages=refs(d.stages,w.stages.length,'day.stages');if(stages.length)needs(h.processStage,'league_round/knockout_round');
 const nationalRoundLeagues:number[]=[];
 for(const sId of stages){const stage=w.stages[sId]!;
  if(stage.class!=='League'||stage.kind!==1||stage.country_ref===null||stage.country_ref===undefined)continue;
  const cid=index(stage.country_ref,w.countries.length,'stage.country_ref');
  for(const raw of refs(w.countries[cid]!.divisions,w.competitions.length,'country.divisions')){
   if(w.competitions[raw]!.league===sId)nationalRoundLeagues.push(raw);
  }
 }
 if(nationalRoundLeagues.length)needs(h.teamOfRound,'team_of_the_round');
 const kind=worldMatchKind(w,matchIds[0]!);
 if(kind===1||kind===3)needs(h.coachChanges,'coach_changes');
 if((w.game.loans as CborValue[]).length>0)needs(h.returnLoans,'loans_coming_back');
 if((w.game.stadium_works as CborValue[]).length>0)needs(h.finishStadiumWorks,'finish_stadium_works');
 if((w.game.coaches as CborValue[]).length>1)needs(h.sortCoaches,'sorting::coaches');
 const checkCodes=(field:'tasks_before'|'tasks_after',through:number)=>{
  for(const day of (w.game.days as CborRecord[]).slice(0,through+1)){if(!Array.isArray(day[field]))throw Error('Invalid '+field);
   for(const code of day[field] as CborValue[]){if(typeof code!=='string')throw Error('Invalid task name');
    if(!['','ds','dJ','criaMataMataAscenso','criaplayOffRebaixamento'].includes(code)){
     if(code==='aj')needs(h.evolvePlayers,'evolve_players');else needs(h.processTask,`day_task(${code})`);
    }
   }
  }
 };
 // Only tasks reachable during THIS advance are mandatory; future task handlers
 // must not block otherwise playable dates.
 const peekNext=findNextPlayableDay(w,current+1);
 checkCodes('tasks_before',current);checkCodes('tasks_after',peekNext??current);
 const tasks:string[]=[];let nextDay:number|null=null,draw=-1,seasonOver=false;
 const committed=worldTransaction(doc,mutable=>{
  const day=dayAt(mutable,current);
  for(const matchId of matchIds){
   const match=mutable.matches[matchId]!;
   if(match.played!==true){
    for(const [side,clubRef] of [[1,match.home],[2,match.away]] as const){
     if(clubRef===null||clubRef===undefined)continue;
     const cid=index(clubRef,mutable.clubs.length,'match.club'),club=mutable.clubs[cid]!;
     if(club.human!==true&&club.lineup_set!==true){
      needs(h.pickAiLineup,'pick_ai_lineup')(mutable,matchId,cid,side);
      if(mutable.clubs[cid]!.lineup_set!==true)throw Error('AI lineup was not confirmed');
     }
    }
    needs(h.playMatch,'play_match_day')(mutable,matchId);
   }
   if(match.played!==true)throw Error('Match engine did not mark played: '+matchId);
   for(const score of [match.home_goals,match.away_goals]){
    const n=int(score,'match.score');if(n<0||n>32767)throw RangeError('Invalid match engine score');
   }
   needs(h.afterMatch,'after_match')(mutable,matchId);
  }
  recoverWorldRoster(mutable,int(day.kind,'day.kind'));
  for(const leagueId of nationalRoundLeagues)needs(h.teamOfRound,'team_of_the_round')(mutable,leagueId);
  if((mutable.game.coaches as CborValue[]).length>1){
   const ids=refs(mutable.game.coaches,mutable.coaches.length,'game.coaches');
   ids.sort((a,b)=>needs(h.sortCoaches,'sorting::coaches')(mutable,a,b));mutable.game.coaches=ids;
  }
  // Rust after_day() marks all days through the current one done.
  for(let i=0;i<=current;i++)dayAt(mutable,i).done=true;
  for(const stageId of stages)needs(h.processStage,'processStage')(mutable,stageId);
  drainTasks(mutable,false,current,h,tasks);
  if(kind===1||kind===3)needs(h.coachChanges,'coachChanges')(mutable,kind);
  const next=findNextPlayableDay(mutable,current);
  nextDay=next===undefined?null:next;
  if(next!==undefined)mutable.game.day=next;
  if((mutable.game.loans as CborValue[]).length>0)needs(h.returnLoans,'returnLoans')(mutable);
  draw=h.draw100();if(!Number.isInteger(draw)||draw<0||draw>=100)throw RangeError('Invalid runtime.rng.fresh_int(100)');
  if(draw>50){
   const humanIds=refs(mutable.game.human_clubs,mutable.clubs.length,'game.human_clubs');
   const listed=humanIds.some(cid=>((mutable.clubs[cid]!.squad as CborValue[])??[]).some(pid=>{
    const i=index(pid,mutable.players.length,'listed player');return mutable.players[i]!.listed_for_sale===true;
   }));
   if(listed)needs(h.sellListed,'sell_listed_players')(mutable);
  }
  if((mutable.game.stadium_works as CborValue[]).length>0)needs(h.finishStadiumWorks,'finish_stadium_works')(mutable);
  // game.rs executes AFTER tasks after finding next day; do not run future tasks
  // when season is over (no next playable day).
  drainTasks(mutable,true,next??current,h,tasks);
  if(next===undefined){
   needs(h.endSeason,'end_season/season_end_screen')(mutable);
   mutable.game.season_over=true;seasonOver=true;
  }
  const audit=auditWorldSemantics(mutable);
  if(!audit.valid)throw Error('M29 semantic audit failed: '+audit.findings.filter(f=>f.severity==='ERROR').map(f=>f.code).slice(0,4).join(','));
 });
 return {document:committed,day:current,nextDay,matches:matchIds,seasonOver,tasks,draw};
}
