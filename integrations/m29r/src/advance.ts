/**
 * Port of a guarded subset of crates/simulation/src/game.rs + matchday.rs.
 * Transaction boundary owns BOTH World and RandomSource. Engine/hook functions
 * operate only on the cloned World/RNG; they MUST NOT perform external side-effects.
 * Unknown Rust branches and post-match hooks fail closed; no fabricated scores.
 * An entire World day (including callbacks, payments, finalizer) commits atomically
 * to the returned value; exceptions leave both inputs byte-for-byte unchanged.
 */
import {RandomSource} from './rng';
import {World,validateWorld,worldIdentityIntegrity,recoverPlayer,clubWages,clubExpense,clubPayment} from './world';
export interface MatchResult {homeGoals:number;awayGoals:number;}
export interface Event {type:string;day:number;match?:number;club?:number;details?:string;}
export interface Hooks {
  /** Pure function of transactional World and RNG; NO network, DB, user-facing effects. */
  playMatch:(world:World,matchId:number,rng:RandomSource)=>MatchResult;
  pickAILineup?:(world:World,clubId:number,matchId:number,side:1|2,rng:RandomSource)=>void;
  /** Mandatory for any competitive fixture; performs standings/income/records. */
  afterMatch?:(world:World,matchId:number,rng:RandomSource)=>void;
  /** Mandatory if day has stages; performs Rust equivalent leagueRound/knockoutRound. */
  afterStage?:(world:World,stageId:number,rng:RandomSource)=>void;
  /** Mandatory for unknown tasks to avoid treating a required game task as a no-op. */
  onTask?:(world:World,task:string,dayIndex:number,after:boolean,rng:RandomSource)=>void;
  /** Called to apply end-of-season awards and policies, before commit. */
  endSeason?:(world:World,rng:RandomSource)=>void;
  onLoans?:(world:World,rng:RandomSource)=>void;
  onStadiumWorks?:(world:World,rng:RandomSource)=>void;
  onCoachChanges?:(world:World,kind:number,rng:RandomSource)=>void;
  onSellListed?:(world:World,rng:RandomSource)=>void;
  onNationalTeamRecovery?:(world:World,rng:RandomSource)=>void;
  /** Complete season transition from World; cannot silently reuse old fixtures. */
  newSeason?:(world:World,rng:RandomSource)=>void;
}
export interface StepOutcome {status:'advanced'|'awaiting_lineup'|'new_season';world:World;rng:RandomSource;events:Event[];}
export class UnportedRustBehavior extends Error {constructor(path:string){super(`Rust behavior not ported / hook required: ${path}`);this.name='UnportedRustBehavior';}}
const validScore=(n:number)=>Number.isSafeInteger(n)&&n>=0&&n<=200;
export function waitingHuman(world:World):{clubId:number;matchId:number}|null {
 const d=world.game.days[world.game.day];if(!d)return null;
 for(const id of d.matches){const m=world.matches[id]!;
  for(const c of [m.home,m.away])if(c!==null && world.clubs[c]!.human&&!world.clubs[c]!.lineup_set)return {clubId:c,matchId:id};
 }
 return null;
}
/** Equivalent `Sim::find_next_day` but undefined instead of ambiguous 0 sentinel. */
export function findNextDay(world:World):number|undefined {
 const from=Math.max(0,world.game.day);
 for(let i=from;i<world.game.days.length;i++){
  const d=world.game.days[i]!;
  if(!d.done&&d.kind>0&&d.matches.length>0)return i;
 }
 return undefined;
}
const utcMonth=(ms:number)=>new Date(ms).getUTCMonth();
function playsInMonth(world:World,clubId:number,month:number):boolean {
 return world.game.days.some(d=>utcMonth(d.date)===month&&d.matches.some(id=>world.matches[id]!.home===clubId||world.matches[id]!.away===clubId));
}
function tasks(world:World,dayIndex:number,after:boolean,rng:RandomSource,hooks:Hooks,events:Event[]):void {
 // Mirrors Rust's `day_tasks`: drains task lists from ALL preceding days.
 for(let i=0;i<=dayIndex;i++){
  const d=world.game.days[i]!;const name=after?'tasks_after':'tasks_before';const list=[...d[name]];
  d[name]=[];
  for(const task of list){
   if(task==='ds'){
    const month=utcMonth(d.date);
    for(const c of world.game.human_clubs){if(playsInMonth(world,c,month)){
     const wages=clubWages(world,c);clubExpense(world,c,wages);
     events.push({type:'wages',day:i,club:c,details:String(wages)});
    }}
   }else if(task==='dJ'){
    for(const c of world.game.human_clubs){const interest=world.clubs[c]!.finances.bank_interest;
     if(interest>0){clubPayment(world,c,interest,4);events.push({type:'interest',day:i,club:c,details:String(interest)});}
    }
   }else if(task==='criaMataMataAscenso'||task==='criaplayOffRebaixamento'){
    // Explicitly ignored by original Rust game.rs.
   }else if(hooks.onTask){hooks.onTask(world,task,i,after,rng);events.push({type:'hook_task:'+task,day:i});}
   else throw new UnportedRustBehavior(`game.day_task(${task})`);
  }
 }
}
export function advanceWorld(world:World,rng:RandomSource,hooks:Hooks,requireHumanConfirmation=true):StepOutcome {
 validateWorld(world);
 const identity=worldIdentityIntegrity(world);
 if(identity.errors.length)throw Error('World references inconsistent: '+identity.errors.slice(0,5).join('; '));
 // Snapshot must include RNG and all nested CBOR-compatible values in World.
 const w=structuredClone(world) as World,localRng=rng.clone();
 const events:Event[]=[];
 if(w.game.season_over){
  if(!hooks.newSeason)throw new UnportedRustBehavior('Sim::new_season');
  const old=w.game.season;hooks.newSeason(w,localRng);
  if(w.game.season<=old||w.game.season_over)throw Error('Invalid new season hook output');
  validateWorld(w);const report=worldIdentityIntegrity(w);
  if(report.errors.length)throw Error('New season broken references: '+report.errors[0]);
  events.push({type:'new_season',day:w.game.day});
  return {status:'new_season',world:w,rng:localRng,events};
 }
 const d=w.game.days[w.game.day];if(!d)throw Error('Missing current day');
 if(d.done||d.matches.length===0||d.kind<=0){
  const next=findNextDay(w);if(next===undefined)throw new UnportedRustBehavior('Sim::end_season on empty calendar');
  w.game.day=next; // Rust skips empty or completed days before displaying the next matchday.
 }
 const today=w.game.days[w.game.day]!;
 if(requireHumanConfirmation){const waiting=waitingHuman(w);
  if(waiting)return {status:'awaiting_lineup',world,rng,events:[{type:'awaiting_lineup',day:w.game.day,match:waiting.matchId,club:waiting.clubId}]};
 }
 const usedClubs=new Set<number>();
 for(const matchId of today.matches){const m=w.matches[matchId]!;
  if(m.played)throw Error('Day contains played match: '+matchId);
  for(const [c,side] of [[m.home,1],[m.away,2]] as const){
   if(c===null)throw Error('Match missing club: '+matchId);
   if(usedClubs.has(c))throw Error('Club plays two games on one day: '+c);
   usedClubs.add(c);
   const club=w.clubs[c]!;
   if(!club.human&&!club.lineup_set){if(!hooks.pickAILineup)throw new UnportedRustBehavior('pick_ai_lineup');
    hooks.pickAILineup(w,c,matchId,side,localRng);
    if(!club.lineup_set)throw Error('AI lineup hook did not set lineup_set');
   }
  }
 }
 // Per Rust: pick all AI lineups, then play all matches.
 for(const matchId of today.matches){const match=w.matches[matchId]!;
  const result=hooks.playMatch(w,matchId,localRng);
  if(!result||!validScore(result.homeGoals)||!validScore(result.awayGoals))throw Error('Engine returned invalid result for '+matchId);
  match.home_goals=result.homeGoals;match.away_goals=result.awayGoals;
  events.push({type:'match_result',day:w.game.day,match:matchId,details:`${result.homeGoals}:${result.awayGoals}`});
 }
 for(const matchId of today.matches){const match=w.matches[matchId]!;
  if(match.competition!==null&&!hooks.afterMatch)throw new UnportedRustBehavior('after_match(records,gate_income,players)');
  match.played=true;
  hooks.afterMatch?.(w,matchId,localRng);
  w.clubs[match.home!]!.lineup_set=false;w.clubs[match.away!]!.lineup_set=false;
 }
 for(const id of w.game.players){const player=w.players[id]!,human=player.club!==null&&w.clubs[player.club]!.human;
  recoverPlayer(player,human);
 }
 for(const id of w.game.youth_players)w.players[id]!.fitness=100;
 if((today.kind===7||today.kind===9)&&Array.isArray(w.game.countries)&&(w.game.countries as unknown[]).length){
  if(!hooks.onNationalTeamRecovery)throw new UnportedRustBehavior('national_team_player_recovery');
  hooks.onNationalTeamRecovery(w,localRng);
 }
 const dayIndex=w.game.day;
 for(let i=0;i<=dayIndex;i++)w.game.days[i]!.done=true;
 for(const stage of today.stages){if(!hooks.afterStage)throw new UnportedRustBehavior('league_round/knockout_round');
  hooks.afterStage(w,stage,localRng);
 }
 tasks(w,dayIndex,false,localRng,hooks,events);
 // The original next_day: coaching, loans, random market, stadium works,
 // calendar tasks. For every material branch, demand its explicit pure hook.
 const first=today.matches[0];const firstCompetition=first===undefined?null:w.matches[first]!.competition;
 const matchKind=firstCompetition===null?0:w.competitions[firstCompetition]!.kind;
 const coachesInvolved=Array.isArray(w.game.human_coaches)&&w.game.human_coaches.length>0
   ||w.clubs.some(c=>typeof c.coach==='number');
 if((matchKind===1||matchKind===3)&&coachesInvolved){
  if(!hooks.onCoachChanges)throw new UnportedRustBehavior('coach_changes/sackings');
  hooks.onCoachChanges(w,matchKind,localRng);
 }
 if(Array.isArray(w.game.loans)&&w.game.loans.length){
  if(!hooks.onLoans)throw new UnportedRustBehavior('loans_coming_back');
  hooks.onLoans(w,localRng);
 }
 const shouldSell=localRng.freshInt(100)>50;
 if(shouldSell&&w.game.human_clubs.some(id=>w.clubs[id]!.squad.some(p=>w.players[p]!.listed_for_sale===true))){
  if(!hooks.onSellListed)throw new UnportedRustBehavior('sell_listed_players');
  hooks.onSellListed(w,localRng);
 }
 if(Array.isArray(w.game.stadium_works)&&w.game.stadium_works.length){
  if(!hooks.onStadiumWorks)throw new UnportedRustBehavior('finish_stadium_works');
  hooks.onStadiumWorks(w,localRng);
 }
 tasks(w,dayIndex,true,localRng,hooks,events);
 const next=findNextDay(w);
 if(next===undefined){
  if(!hooks.endSeason)throw new UnportedRustBehavior('end_season');
  w.game.season_over=true;hooks.endSeason(w,localRng);
  events.push({type:'season_end',day:dayIndex});
 }else w.game.day=next;
 validateWorld(w);const after=worldIdentityIntegrity(w);
 if(after.errors.length)throw Error('Post-advance broken references: '+after.errors[0]);
 return {status:'advanced',world:w,rng:localRng,events};
}