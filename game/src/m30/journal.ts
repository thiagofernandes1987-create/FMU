/**
 * FMU M30 — durable outbox and crash recovery for `.bfn` byte persistence.
 * Source semantics: `M29 persistAdvancedBatch`, `M27 writeBfnWorldAtomic`.
 *
 * Guarantees:
 * - optimistic SHA-256 prevents overwriting a changed game save;
 * - write-ahead journal precedes atomic save replacement;
 * - RNG snapshot stored with the committed save (sidecar file);
 * - outbox replay after crash uses stable idempotency keys;
 * - no externally queued effects before save commit;
 * - a crash between save and RNG sidecar is repairable by `recover`.
 *
 * Important limit: at-least-once delivery of external effects, NOT exactly-once
 * unless the receiver implements deduplication by the supplied effect key.
 * No automatic path for calls bypassing this journal can be made safe here.
 */
declare function require(name:string):any;
const fs=require('node:fs'),crypto=require('node:crypto'),path=require('node:path'),util=require('node:util');
import {ProposedBatch,Effect,verifyProposal} from './transaction';
import {RandomSourceSnapshot} from './java_rng';
const sha=(bytes:Uint8Array):string=>crypto.createHash('sha256').update(bytes).digest('hex');
export type SaveCodec<W>={encode(world:W):Uint8Array;decode(bytes:Uint8Array):W;validate(world:W):void};
export type EffectSink=(event:Effect)=>void;
export type FaultStage='journal-prepared'|'save-renamed'|'sidecar-written'|'event-published';
export type FaultInjector=(stage:FaultStage)=>void;
export type Journal={schema:'fmu-m30-journal-v1';status:'prepared'|'committed';batchId:string;
 baseSha:string;targetSha:string;rng:RandomSourceSnapshot;effects:Effect[];acked:string[]};
export type CommitResult={state:'committed'|'aborted'|'pending-delivery';delivered:number;pending:number;sha:string};
const validSha=(v:unknown):v is string=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
/** Exclusive lock for compliant FMU writers; uncoordinated external edits are caught
 * by the SHA check but no filesystem API can prevent other programs writing. */
function withLock<T>(file:string,work:()=>T):T {
 const lock=file+'.m30.lock';let handle:number;
 try{handle=fs.openSync(lock,'wx',0o600);}catch{throw Error('LOCKED: another writer or stale M30 lock owns '+file);}
 try{
  fs.writeSync(handle,JSON.stringify({pid:process.pid,created:new Date().toISOString()}));
  fs.fsyncSync(handle);return work();
 }finally{fs.closeSync(handle);fs.unlinkSync(lock);}
}
/** Explicit recovery helper; never steals a lock from a known live process. */
export function clearStaleLock(file:string):boolean {
 const lock=file+'.m30.lock';if(!fs.existsSync(lock))return false;
 let pid:number;try{pid=Number(JSON.parse(fs.readFileSync(lock,'utf8')).pid);}catch{throw Error('Unparseable lock; manual inspection required');}
 if(!Number.isSafeInteger(pid)||pid<1)throw Error('Unsafe lock owner PID');
 try{process.kill(pid,0);throw Error('LOCKED: writer process still alive');}
 catch(e){if((e as {code?:string}).code!=='ESRCH')throw e;}
 fs.unlinkSync(lock);return true;
}
const journalPath=(file:string)=>file+'.m30.txn.json';
const rngPath=(file:string)=>file+'.m30.rng.json';
function atomicWrite(file:string,data:Uint8Array):void{
 const temp=file+'.m30.tmp';let fd:number|undefined;
 try{
  fd=fs.openSync(temp,'wx',0o600);
  let offset=0;while(offset<data.byteLength){const n=fs.writeSync(fd,data,offset,data.byteLength-offset,offset);if(n<=0)throw Error('Short atomic write');offset+=n;}
  fs.fsyncSync(fd);fs.closeSync(fd);fd=undefined;
  fs.renameSync(temp,file);
  try{const dir=fs.openSync(path.dirname(file),'r');try{fs.fsyncSync(dir);}finally{fs.closeSync(dir);}}catch{/* Windows file handles can prohibit directory fsync */}
 }catch(e){if(fd!==undefined)fs.closeSync(fd);if(fs.existsSync(temp))fs.unlinkSync(temp);throw e;}
}
const jsonBytes=(x:unknown):Uint8Array=>require('node:buffer').Buffer.from(JSON.stringify(x),'utf8');
function writeJson(file:string,data:unknown):void{atomicWrite(file,jsonBytes(data));}
function readJournal(file:string):Journal|null{
 const f=journalPath(file);if(!fs.existsSync(f))return null;
 const value=JSON.parse(fs.readFileSync(f,'utf8')) as Journal;
 if(value.schema!=='fmu-m30-journal-v1'||!validSha(value.baseSha)||!validSha(value.targetSha)
  ||(value.status!=='prepared'&&value.status!=='committed')||!Array.isArray(value.effects)||!Array.isArray(value.acked))throw Error('Corrupted FMU journal');
 if(new Set(value.effects.map(x=>x.key)).size!==value.effects.length)throw Error('Duplicate journal effect keys');
 return value;
}
function currentSha(file:string):string{
 if(!fs.existsSync(file))throw Error('BFN target missing');
 return sha(fs.readFileSync(file));
}
/** `commit` operates on bytes from existing M29 codec; it never writes CBOR by itself. */
export function commitPrepared<W>(file:string,p:ProposedBatch<W>,codec:SaveCodec<W>,sink:EffectSink,
 options:{expectedBaseSha:string;allowPartial?:boolean;fault?:FaultInjector}):CommitResult {
 return withLock(file,()=>{
 if(!file.toLowerCase().endsWith('.bfn'))throw Error('Commit requires a .bfn target');
 if(!options.allowPartial)verifyProposal(p);
 else if(!p.completed)throw Error('Cannot commit zero-step batch');
 if(readJournal(file))throw Error('Pending journal must be recovered before new commit');
 if(util.isDeepStrictEqual(p.base,p.world)&&JSON.stringify(p.rng)!==JSON.stringify(p.baseRng))throw Error('Ambiguous commit: World unchanged while RNG advanced');
 const actual=currentSha(file);
 if(actual!==options.expectedBaseSha)throw Error('CONFLICT: game save modified since load');
 codec.validate(p.world);
 const target=codec.encode(p.world),targetSha=sha(target);
 const reread=codec.decode(target);
 if(reread===null||typeof reread!=='object')throw Error('Encoded World failed validation');
 codec.validate(reread);
 const journal:Journal={schema:'fmu-m30-journal-v1',status:'prepared',batchId:p.batchId,
  baseSha:actual,targetSha,rng:p.rng,effects:p.effects,acked:[]};
 if(targetSha===actual&&JSON.stringify(p.rng)!==JSON.stringify(p.baseRng))throw Error('Ambiguous commit: World bytes unchanged while RNG advanced');
 writeJson(journalPath(file),journal);options.fault?.('journal-prepared');
 // Original save backup is retained until external effects are dispatched.
 fs.copyFileSync(file,file+'.m30.bak');
 atomicWrite(file,target);options.fault?.('save-renamed');
 writeJson(rngPath(file),{schema:'fmu-m30-rng-v1',targetSha,rng:p.rng});options.fault?.('sidecar-written');
 journal.status='committed';writeJson(journalPath(file),journal);
 return deliver(file,journal,sink,options.fault);
 });
}
function deliver(file:string,journal:Journal,sink:EffectSink,fault?:FaultInjector):CommitResult{
 if(currentSha(file)!==journal.targetSha)throw Error('CONFLICT: committed save digest diverged');
 const ack=new Set(journal.acked);let delivered=0;
 for(const e of journal.effects){if(ack.has(e.key))continue;
  sink(e);fault?.('event-published'); // Crash here may replay: receiver must deduplicate key.
  journal.acked.push(e.key);ack.add(e.key);delivered++;
  writeJson(journalPath(file),journal);
 }
 const pending=journal.effects.length-ack.size;
 if(!pending)fs.unlinkSync(journalPath(file));
 return {state:pending?'pending-delivery':'committed',delivered,pending,sha:journal.targetSha};
}
/** Repair `save-renamed` crash: compare actual digest with journal before effects. */
export function recoverCommit(file:string,sink:EffectSink):CommitResult|null{
 return withLock(file,()=>{
 const j=readJournal(file);if(!j)return null;
 const digest=currentSha(file);
 if(digest===j.baseSha&&digest!==j.targetSha){
  fs.unlinkSync(journalPath(file));return {state:'aborted',delivered:0,pending:0,sha:digest};
 }
 if(digest!==j.targetSha)throw Error('CONFLICT: neither pre-save nor committed save matches the journal');
 writeJson(rngPath(file),{schema:'fmu-m30-rng-v1',targetSha:j.targetSha,rng:j.rng});
 j.status='committed';writeJson(journalPath(file),j);
 return deliver(file,j,sink);
 });
}
export function readCommittedRng(file:string):RandomSourceSnapshot|null{
 const p=rngPath(file);if(!fs.existsSync(p))return null;
 const value=JSON.parse(fs.readFileSync(p,'utf8'));
 if(value.schema!=='fmu-m30-rng-v1'||value.targetSha!==currentSha(file))throw Error('RNG sidecar does not match BFN contents');
 return value.rng;
}
export function hashSaveFile(file:string):string{return currentSha(file);}

/** Read-only operator diagnostics; never acknowledges effects or edits a save. */
export function inspectJournal(file:string):{present:boolean;status:string;saveMatches:'base'|'target'|'foreign'|null;pending:number;acked:number;batchId?:string}{
 const j=readJournal(file);if(!j)return {present:false,status:'none',saveMatches:null,pending:0,acked:0};
 const digest=currentSha(file);
 return {present:true,status:j.status,saveMatches:digest===j.targetSha?'target':digest===j.baseSha?'base':'foreign',
  pending:j.effects.length-j.acked.length,acked:j.acked.length,batchId:j.batchId};
}
