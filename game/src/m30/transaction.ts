/**
 * FMU M30 — transactional adapter for M29 `advanceWorldOneDay` / `advanceWorldDays`.
 *
 * Purpose: close M29's known loss of external RNG state upon callback failure.
 * It clones World and ALL deterministic RNG streams before invoking an injected
 * advance function. External effects must be placed in `ctx.queueEffect` and
 * MUST NOT be executed directly by the engine callback.
 *
 * Inputs: a decoded WorldDocument (generic W), deterministic RNG, step count,
 *       and an advance callback supplied by the FMU engine.
 * Outputs: proposed World/RNG, ordered side effects, completed steps.
 * Effects: NONE before `commitPrepared` (journal.ts). On throw, input World/RNG
 * remains unchanged; a paused step is rolled back to its entry snapshot.
 *
 * IMPORTANT: this is an integration component, not a port of Sim::advance,
 * match engines, match results, competitions or end of season.
 */
import {DeterministicRandomSource,RandomSourceSnapshot} from './java_rng';
declare function structuredClone<T>(value:T):T;
export type Effect={key:string;kind:string;payload:unknown};
export type StepResult='completed'|'paused';
export type AdvanceContext={
 readonly rng:DeterministicRandomSource;
 readonly dayIndex:number;
 /** Durable intent only, never a network/database mutation in the callback. */
 queueEffect(kind:string,payload:unknown,keyHint?:string):void;
};
export type AdvanceFn<W>=(world:W,ctx:AdvanceContext)=>StepResult;
export type ProposedBatch<W>={status:'ready'|'paused';base:W;world:W;
 baseRng:RandomSourceSnapshot;rng:RandomSourceSnapshot;completed:number;
 effects:Effect[];batchId:string;};
function validateKey(s:string):boolean{return /^[a-zA-Z0-9_.:\/-]{1,160}$/.test(s);}
function assertJsonValue(x:unknown):void{
 const value=JSON.stringify(x);
 if(value===undefined||value.length>1024*1024)throw Error('Effect payload must be JSON <=1MB');
}
export function prepareBatch<W>(world:W,rng:DeterministicRandomSource,steps:number,advance:AdvanceFn<W>,batchId:string):ProposedBatch<W>{
 if(!Number.isSafeInteger(steps)||steps<1||steps>1000)throw Error('Batch steps must be 1..1000');
 if(!validateKey(batchId))throw Error('Invalid batch ID');
 const base=structuredClone(world);let working=structuredClone(world);
 let drawn=rng.clone(),completed=0,status:'ready'|'paused'='ready';
 const effects:Effect[]=[];
 for(let i=0;i<steps;i++){
  // The active step is isolated; incomplete human decisions do not consume RNG.
  const stepWorld=structuredClone(working),stepRng=drawn.clone(),newEffects:Effect[]=[];
  const keySet=new Set(effects.map(e=>e.key));
  const result=advance(stepWorld,{rng:stepRng,dayIndex:i,queueEffect:(kind,payload,keyHint)=>{
   if(!validateKey(kind))throw Error('Invalid effect kind');
   assertJsonValue(payload);
   const key=keyHint??`${batchId}/${i}/${newEffects.length}`;
   if(!validateKey(key)||keySet.has(key)||newEffects.some(e=>e.key===key))throw Error('Effect idempotency key collision');
   newEffects.push({key,kind,payload:JSON.parse(JSON.stringify(payload))});
  }});
  if(result==='paused'){status='paused';break;}
  if(result!=='completed')throw Error('Advance engine returned unsupported status');
  // Snapshot after success; no external state is updated by the bridge.
  working=stepWorld;
  drawn=stepRng;completed++;effects.push(...newEffects);
 }
 return {status,base,world:working,baseRng:rng.snapshot(),rng:drawn.snapshot(),completed,effects,batchId};
}
/** Strict utility to ensure callback only has a World/RNG draft. */
export function verifyProposal<W>(p:ProposedBatch<W>):void{
 if(!p.completed||p.completed>1000)throw Error('Cannot commit a zero-step proposal');
 if(p.status==='paused')throw Error('Paused batch requires explicit partial acceptance');
 if(new Set(p.effects.map(e=>e.key)).size!==p.effects.length)throw Error('Duplicate effect keys');
}
