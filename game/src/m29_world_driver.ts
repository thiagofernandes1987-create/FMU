/**
 * M29 — controlador de múltiplos avanços, análise de bloqueios e checkpoint .bfn.
 * Depende de: m29_world_advance, m28/career_world, world_calendar.
 * Não sintetiza resultados nem declara paridade; grava um novo save apenas quando
 * todos os passos da sequência tiverem sido concluídos e auditados com sucesso.
 */
import {WorldDocument,RustWorld} from './m27/persistence/bfn_world';
import {WorldAdvanceHooks,WorldAdvanceInfo,advanceWorldOneDay} from './m29_world_advance';
import {findNextPlayableDay,firstWaitingHumanLineup} from './m28/world_calendar';
import {persistCareerWorld} from './m28/career_world';
import {CborRecord,CborValue} from './m26/persistence/cbor';

function num(v:CborValue):number|undefined {return typeof v==='number'&&Number.isSafeInteger(v)?v:
 typeof v==='bigint'&&v>=0n&&v<=BigInt(Number.MAX_SAFE_INTEGER)?Number(v):undefined;}
function list(v:CborValue):CborValue[]{return Array.isArray(v)?v:[];}
export interface AdvanceReadiness{
 currentDay:number|null;plannedMatches:number;alreadyPlayed:number;
 humanWaiting:{clubId:number;matchId:number}|null;requiredHooks:string[];
 source:'Rust simulation/game.rs, matchday.rs, season.rs';
 engineParityVerified:false;runtimeReady:boolean;
}
/** Readiness check never edits a save, drops tasks, consumes RNG or creates fixtures. */
export function assessWorldAdvance(doc:WorldDocument):AdvanceReadiness {
 const w=doc.world,day=num(w.game.day),cursor=day===undefined?null:day;
 const blocked=new Set<string>(),validDay=cursor!==null&&cursor>=0&&cursor<list(w.game.days).length;
 const dayObj=validDay?(w.game.days as CborRecord[])[cursor!]:undefined;
 const matches=dayObj?list(dayObj.matches):[],pending=validDay?firstWaitingHumanLineup(w,cursor!):undefined;
 if(w.game.season_over===true)blocked.add('new_season');
 if(!doc.runtimePreflight.minimumReady)blocked.add('runtime_preflight');
 if(!validDay||dayObj?.done===true||!matches.length)blocked.add('playable_calendar');
 if(pending)blocked.add('human_lineup');
 let played=0;
 for(const raw of matches){const id=num(raw);if(id===undefined||id<0||id>=w.matches.length){blocked.add('match_reference');continue;}
  const match=w.matches[id]!;
  if(match.played===true){played++;continue;}
  blocked.add('play_match_day');
  for(const clubRef of [match.home,match.away]){
   if(clubRef===null||clubRef===undefined)continue;
   const cid=num(clubRef);
   if(cid===undefined||cid<0||cid>=w.clubs.length){blocked.add('club_reference');continue;}
   const c=w.clubs[cid]!;if(c.human!==true&&c.lineup_set!==true)blocked.add('pick_ai_lineup');
  }
 }
 if(matches.length)blocked.add('after_match');
 if(list(dayObj?.stages).length)blocked.add('process_stage');
 for(const d of list(w.game.days)){
  if(typeof d!=='object'||d===null||Array.isArray(d)||d instanceof Map||d instanceof Uint8Array||'tag' in d)continue;
  for(const c of [...list(d.tasks_before),...list(d.tasks_after)]){
   if(c==='aj')blocked.add('evolve_players');
   else if(typeof c==='string'&&!['','ds','dJ','criaMataMataAscenso','criaplayOffRebaixamento'].includes(c))blocked.add(`day_task:${c}`);
  }
 }
 if(list(w.game.loans).length)blocked.add('loans_coming_back');
 if(list(w.game.stadium_works).length)blocked.add('finish_stadium_works');
 if(list(w.game.coaches).length>1)blocked.add('sorting::coaches');
 const next=validDay?findNextPlayableDay(w,cursor!+1):undefined;
 if(next===undefined)blocked.add('end_season');
 return {currentDay:cursor,plannedMatches:matches.length,alreadyPlayed:played,
  humanWaiting:pending??null,requiredHooks:[...blocked].sort(),
  source:'Rust simulation/game.rs, matchday.rs, season.rs',engineParityVerified:false,
  runtimeReady:doc.runtimePreflight.minimumReady};
}
export interface AdvanceBatchResult {document:WorldDocument;completed:readonly WorldAdvanceInfo[];
 paused:{clubId:number;matchId:number}|null;seasonOver:boolean;}
/**
 * Batch of 1–1000 Rust World match-days. On failure, throws without changing `doc`.
 * End-of-season stops here: a second season requires the not-yet-ported generator.
 * This adapter is synchronous, and each engine hook must restrict side effects to the
 * cloned World (external RNG state cannot be rolled back by this API).
 */
export function advanceWorldDays(doc:WorldDocument,hooks:WorldAdvanceHooks,maxDays=1):AdvanceBatchResult {
 if(!Number.isInteger(maxDays)||maxDays<1||maxDays>1000)throw RangeError('maxDays must be 1..1000');
 let result=doc;const completed:WorldAdvanceInfo[]=[];
 for(let i=0;i<maxDays;i++){
  const r=advanceWorldOneDay(result,hooks);
  if('paused' in r)return {document:result,completed,paused:{clubId:r.clubId,matchId:r.matchId},seasonOver:false};
  completed.push(r);result=r.document;
  if(r.seasonOver)return {document:result,completed,paused:null,seasonOver:true};
 }
 return {document:result,completed,paused:null,seasonOver:false};
}
/**
 * File checkpoint of a completed batch; never writes on paused or zero-day batches.
 * Destination may be a new file or one with existing backups; the writer is atomic.
 */
export function persistAdvancedBatch(filename:string,batch:AdvanceBatchResult):{path:string;bytes:number;reopened:WorldDocument}{
 if(batch.completed.length===0||batch.paused)throw Error('No completed career batch to checkpoint');
 const res=persistCareerWorld(filename,batch.document);
 return {path:filename,bytes:res.size,reopened:res.reopened.document};
}
