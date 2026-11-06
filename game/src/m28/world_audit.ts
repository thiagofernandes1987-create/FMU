/**
 * M28 — semantic cross-arena audit for real Rust Worlds from native `.bfn`.
 * Dependency: structural validation M27 + schema, World Club/Player/Day views.
 * Entry: RustWorld; exit: diagnostics only, no mutations to career or references.
 * Rules are intentionally conservative: a player may be registered to a national
 * team in addition to their owner club, and a player's absence from a squad is
 * not enough to declare corruption (retirement, transfers, temporary squads).
 * This is NOT a proof that `Sim::advance` will succeed; main engine not ported.
 */
import {RustWorld,validateRustWorld} from '../m27/persistence/bfn_world';
import {CborRecord,CborValue} from '../m26/persistence/cbor';
export interface WorldAuditFinding {severity:'ERROR'|'WARNING';code:string;path:string;detail:string;}
export interface WorldAuditReport{valid:boolean;structurallyValid:boolean;findings:WorldAuditFinding[];counts:{players:number;clubs:number;matches:number;days:number};}
function id(v:CborValue):number|undefined {return typeof v==='number'&&Number.isSafeInteger(v)&&v>=0?v:
 typeof v==='bigint'&&v>=0n&&v<=4294967295n?Number(v):undefined;}
function isRecord(v:CborValue):v is CborRecord {return Boolean(v)&&typeof v==='object'&&!Array.isArray(v)&&!(v instanceof Uint8Array)&&!(v instanceof Map)&&!('tag' in (v as object));}
function readList(v:CborValue):CborValue[]{return Array.isArray(v)?v:[];}
/** `World` semantic graph report; no repair or World mutation. */
export function auditWorldSemantics(w:RustWorld):WorldAuditReport {
 const findings:WorldAuditFinding[]=[],put=(severity:'ERROR'|'WARNING',code:string,path:string,detail:string)=>{
  if(findings.length<250)findings.push({severity,code,path,detail});
 };
 const checked=validateRustWorld(w,{profile:'complete',maxIssues:100});
 for(const err of checked.errors)put('ERROR','STRUCTURAL_'+err.code,err.path,err.description);
 const nationals=new Set<number>();
 for(const c of w.countries){if(c.national_team!==null&&c.national_team!==undefined){const idx=id(c.national_team);if(idx!==undefined)nationals.add(idx);}}
 const assignments=new Map<number,number[]>();
 for(const [ci,c] of w.clubs.entries()){
  const entries=[...readList(c.squad),...readList(c.youth_squad)],seen=new Set<number>();
  for(const [j,ref] of entries.entries()){
   const pid=id(ref),path=`$.clubs[${ci}].squad/youth[${j}]`;
   if(pid===undefined||pid>=w.players.length){put('ERROR','INVALID_SQUAD_REFERENCE',path,'Player index missing');continue;}
   if(seen.has(pid))put('ERROR','DUPLICATE_CLUB_PLAYER',path,`Player ${pid} appears more than once in club ${ci}`);
   seen.add(pid);
   if(!nationals.has(ci)){
    const a=assignments.get(pid)??[];a.push(ci);assignments.set(pid,a);
    if(w.players[pid]!.club!==ci)put('WARNING','OWNER_SQUAD_MISMATCH',path,`Player.club=${String(w.players[pid]!.club)} ≠ ${ci}; loan/transition possible`);
   }
  }
 }
 for(const [pid,clubs] of assignments){if(new Set(clubs).size>1)put('ERROR','MULTIPLE_OWNER_SQUADS',`$.players[${pid}]`,clubs.join(','));}
 const dayList=readList(w.game.days);
 const matchInDays=new Map<number,number[]>();
 for(const [d,raw] of dayList.entries()){
  if(!isRecord(raw)){put('ERROR','INVALID_DAY',`$.game.days[${d}]`,'Day is not struct');continue;}
  for(const rawMatch of readList(raw.matches)){
   const mid=id(rawMatch);if(mid===undefined||mid>=w.matches.length)continue;
   const list=matchInDays.get(mid)??[];list.push(d);matchInDays.set(mid,list);
  }
 }
 for(const [mid,days] of matchInDays){
  if(days.length>1)put('WARNING','MATCH_REUSED',`$.matches[${mid}]`,days.join(','));
  if(w.matches[mid]!.day!==days[0])put('WARNING','MATCH_DAY_MISMATCH',`$.matches[${mid}].day`,`${String(w.matches[mid]!.day)} vs ${days[0]}`);
 }
 const cursor=id(w.game.day);
 if(dayList.length>0&&(cursor===undefined||cursor>=dayList.length)&&w.game.season_over!==true){
  put('ERROR','CURSOR_OUT_OF_CALENDAR','$.game.day',`Cursor ${String(w.game.day)} / ${dayList.length}`);
 }
 return {valid:!findings.some(f=>f.severity==='ERROR'),structurallyValid:checked.valid,findings,
  counts:{players:w.players.length,clubs:w.clubs.length,matches:w.matches.length,days:dayList.length}};
}
