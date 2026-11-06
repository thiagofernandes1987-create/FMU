/**
 * FMU M30↔M29 additive adapter: applies M29's validated day transition inside
 * the same *draft World + draft RNG* transaction and commits via M30 journal.
 *
 * Contracts:
 * - A missing match-engine hook still throws; not a replacement for Rust Sim::advance.
 * - If the human lineup pauses the day, RNG, World and outbox stay unchanged.
 * - Only the explicit `commitPrepared` (M30) writes a .bfn and sidecars.
 * - External effects must use queueEffect; consumers must deduplicate keys.
 * - The original M29 `advanceWorldDays` direct persistence remains available but
 *   bypasses M30 journaling; use this adapter when crash consistency is required.
 */
import {WorldDocument,loadBfnWorld,encodeWorldDocument,validateRustWorld,WorldValidationError} from '../m27/persistence/bfn_world';
import {advanceWorldOneDay,WorldAdvanceHooks,WorldAdvanceResult} from '../m29_world_advance';
import {DeterministicRandomSource} from './java_rng';
import {Effect,AdvanceContext,ProposedBatch,prepareBatch,verifyProposal} from './transaction';
import {SaveCodec,EffectSink,commitPrepared,CommitResult} from './journal';

export type M29HookFactory=(context:AdvanceContext)=>Omit<WorldAdvanceHooks,'draw100'>;
function applyDocument(target:WorldDocument,replacement:WorldDocument):void {
 const obj=target as unknown as Record<string,unknown>;
 for(const key of Object.keys(obj))delete obj[key];
 Object.assign(obj,replacement);
}
/** Construct a testable save codec with the real M29 .bfn World schema. */
export const m29WorldCodec:SaveCodec<WorldDocument>={
 encode:doc=>encodeWorldDocument(doc),
 decode:bytes=>loadBfnWorld(bytes),
 validate:doc=>{
  const report=validateRustWorld(doc.world,{profile:'complete'});
  if(!report.valid)throw new WorldValidationError(report);
 }
};
/**
 * Synchronous, deterministic, no external effects until commit. `hooks` receives
 * a contextual RNG via draw100 and may queue effects for later delivery. It must
 * not perform I/O or mutate structures outside the World draft.
 */
export function prepareM29WorldBatch(
 original:WorldDocument,rng:DeterministicRandomSource,days:number,hooks:M29HookFactory,batchId:string
):ProposedBatch<WorldDocument>{
 return prepareBatch(original,rng,days,(working,context)=>{
  const dayHooks:WorldAdvanceHooks={...hooks(context),draw100:()=>context.rng.freshInt(100)};
  const result:WorldAdvanceResult=advanceWorldOneDay(working,dayHooks);
  if('paused' in result)return 'paused';
  applyDocument(working,result.document);
  context.queueEffect('world.day.advanced',{day:result.day,nextDay:result.nextDay,seasonOver:result.seasonOver});
  return 'completed';
 },batchId);
}
export function commitM29WorldBatch(file:string,proposed:ProposedBatch<WorldDocument>,sink:EffectSink,baseSha:string):CommitResult {
 verifyProposal(proposed);
 return commitPrepared(file,proposed,m29WorldCodec,sink,{expectedBaseSha:baseSha});
}
