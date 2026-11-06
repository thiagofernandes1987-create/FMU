/**
 * M28 — port read-only of simulation/src/game.rs methods:
 * `human_waiting`, `find_next_day`, `plays_in_month`, `today` and `match_kind`.
 * Input: complete RustWorld. Output: strict day plan and event list.
 * Effects: NONE; no match scores invented, no World cursor mutation.
 * `find_next_day` in Rust mutates game.day; our `findNextPlayableDay` returns
 * the candidate index only so callers can supply an engine and commit atomically.
 * Tests: tests/m28_calendar.test.ts.
 */
import {RustWorld,WorldDocument} from '../m27/persistence/bfn_world';
import {CborRecord,CborValue} from '../m26/persistence/cbor';
function int(v:CborValue,path:string):number {
 if(typeof v==='number'&&Number.isSafeInteger(v))return v;
 if(typeof v==='bigint'&&v>=BigInt(Number.MIN_SAFE_INTEGER)&&v<=BigInt(Number.MAX_SAFE_INTEGER))return Number(v);
 throw Error(`Invalid integer ${path}`);
}
function ref(v:CborValue,len:number,path:string):number{
 const n=int(v,path);if(n<0||n>=len)throw RangeError(`Invalid ArenaId ${path}`);return n;
}
function row(v:CborValue,path:string):CborRecord{
 if(!v||typeof v!=='object'||Array.isArray(v)||v instanceof Map||v instanceof Uint8Array||'tag' in v)throw Error(`Invalid struct ${path}`);return v;
}
function days(w:RustWorld):CborRecord[]{if(!Array.isArray(w.game.days))throw Error('Game.days missing');return w.game.days.map((x,i)=>row(x,`game.days[${i}]`));}
export interface DayMatch {matchId:number;home?:number;away?:number;played:boolean;homeGoals:number;awayGoals:number;competitionKind:number;}
export interface WorldDayPlan {index:number;date:bigint;kind:number;done:boolean;humanWaiting?:{clubId:number;matchId:number};matches:DayMatch[];unplayed:number[];tasksBefore:string[];tasksAfter:string[];eligibleForAfterDay:boolean;}
/** Rust `find_next_day`: skip all done days, kind=0 and days without matches. */
export function findNextPlayableDay(w:RustWorld,from?:number):number|undefined {
 const d=days(w),current=from??int(w.game.day,'game.day');
 if(!Number.isSafeInteger(current)||current<0)throw RangeError('Invalid calendar cursor');
 for(let i=current;i<d.length;i++){const day=d[i]!;const matches=day.matches;
  if(day.done!==true&&int(day.kind,`days[${i}].kind`)>0&&Array.isArray(matches)&&matches.length>0)return i;
 }
 return undefined;
}
/** Rust `human_waiting`: first human club of today's matches without a lineup. */
export function firstWaitingHumanLineup(w:RustWorld,dayIndex:number):{clubId:number;matchId:number}|undefined {
 const d=days(w)[dayIndex];if(!d)throw RangeError('Invalid day index');
 for(const matchRef of d.matches as CborValue[]){
  const id=ref(matchRef,w.matches.length,'day match');const m=w.matches[id]!;
  for(const clubRef of [m.home,m.away]){
   if(clubRef===null||clubRef===undefined)continue;
   const c=ref(clubRef,w.clubs.length,'match club'),club=w.clubs[c]!;
   if(club.human===true&&club.lineup_set!==true)return {clubId:c,matchId:id};
  }
 }
 return undefined;
}
/** Reads match competition kind without assuming every game has a competition. */
export function worldMatchKind(w:RustWorld,matchId:number):number {
 if(!Number.isSafeInteger(matchId)||matchId<0||matchId>=w.matches.length)throw RangeError('Invalid MatchId');
 const competition=w.matches[matchId]!.competition;
 if(competition===null||competition===undefined)return 0;
 const i=ref(competition,w.competitions.length,'match.competition');return int(w.competitions[i]!.kind,'competition.kind');
}
/** `plays_in_month` compares the game clock month, not current calendar month. */
export function playsWorldMatchInMonth(w:RustWorld,clubId:number,monthZeroBased:number,monthOf:(epoch:bigint)=>number):boolean {
 if(!Number.isInteger(clubId)||clubId<0||clubId>=w.clubs.length)throw RangeError('Invalid ClubId');
 if(!Number.isInteger(monthZeroBased)||monthZeroBased<0||monthZeroBased>11)throw RangeError('Invalid month');
 return days(w).some(day=>{
  if(monthOf(BigInt(int(day.date,'day.date')))!==monthZeroBased)return false;
  return (day.matches as CborValue[]).some(matchRef=>{
   const m=w.matches[ref(matchRef,w.matches.length,'day match')]!;
   return m.home===clubId||m.away===clubId;
  });
 });
}
/** Strict day snapshot for replay/inspection; 'eligibleForAfterDay' does NOT run hooks. */
export function inspectWorldDay(doc:WorldDocument,dayIndex?:number):WorldDayPlan {
 const w=doc.world,index=dayIndex??int(w.game.day,'game.day'),day=days(w)[index];
 if(!day)throw RangeError('No day at cursor');
 const matches:DayMatch[]=[],unplayed:number[]=[];
 for(const raw of day.matches as CborValue[]){
  const matchId=ref(raw,w.matches.length,'day.match'),m=w.matches[matchId]!;
  const played=m.played===true;
  if(!played)unplayed.push(matchId);
  matches.push({matchId,home:m.home==null?undefined:ref(m.home,w.clubs.length,'match.home'),
   away:m.away==null?undefined:ref(m.away,w.clubs.length,'match.away'),played,
   homeGoals:int(m.home_goals,'match.home_goals'),awayGoals:int(m.away_goals,'match.away_goals'),competitionKind:worldMatchKind(w,matchId)});
 }
 return {index,date:BigInt(int(day.date,'day.date')),kind:int(day.kind,'day.kind'),done:day.done===true,
  humanWaiting:firstWaitingHumanLineup(w,index),matches,unplayed,
  tasksBefore:[...(day.tasks_before as string[])],tasksAfter:[...(day.tasks_after as string[])],
  eligibleForAfterDay:day.done!==true&&unplayed.length===0&&matches.length>0};
}
