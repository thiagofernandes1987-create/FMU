/** M30: crash recovery, on-disk journal, optimistic concurrency and explicit at-least-once effects. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),v8=require('node:v8');
import {DeterministicRandomSource} from '../../src/m30/java_rng';
import {prepareBatch} from '../../src/m30/transaction';
import {commitPrepared,recoverCommit,readCommittedRng,hashSaveFile,SaveCodec} from '../../src/m30/journal';
type State={day:number;balance:bigint;registrations:number[]};
const codec:SaveCodec<State>={encode:w=>v8.serialize(w),decode:b=>v8.deserialize(b),validate:w=>{if(!Number.isSafeInteger(w.day)||w.day<0||typeof w.balance!=='bigint')throw Error('Invalid World');}};
function setup(){const folder=fs.mkdtempSync(path.join(os.tmpdir(),'fmu-m30-')),file=path.join(folder,'career.bfn');
 const state:State={day:0,balance:9007199254740998n,registrations:[]};fs.writeFileSync(file,codec.encode(state));
 const base=hashSaveFile(file),rng=new DeterministicRandomSource(2026);
 const p=prepareBatch(state,rng,3,(w,c)=>{w.day++;w.balance-=5n;w.registrations.push(c.rng.freshInt(99));c.queueEffect('club.wages',{day:w.day});return 'completed';},'s1');
 return {folder,file,state,rng,p,base,cleanup:()=>fs.rmSync(folder,{recursive:true,force:true})};}
test('M30 successful commit: state file, durable RNG, backup, ordered outbox',()=>{
 const x=setup();try{const seen:string[]=[];
  const result=commitPrepared(x.file,x.p,codec,e=>seen.push(e.key),{expectedBaseSha:x.base});
  assert.equal(result.state,'committed');assert.equal(result.delivered,3);
  assert.deepEqual(seen,['s1/0/0','s1/1/0','s1/2/0']);
  const reread=codec.decode(fs.readFileSync(x.file));assert.equal(reread.day,3);
  assert.equal(reread.balance,9007199254740983n);assert.deepEqual(readCommittedRng(x.file),x.p.rng);
  assert.equal(codec.decode(fs.readFileSync(x.file+'.m30.bak')).day,0);
  assert.equal(fs.existsSync(x.file+'.m30.txn.json'),false);
 }finally{x.cleanup();}
});
test('M30 fail before save leaves original unchanged and no published events',()=>{
 const x=setup();try{const emitted:string[]=[];
  assert.throws(()=>commitPrepared(x.file,x.p,codec,e=>emitted.push(e.key),{expectedBaseSha:x.base,fault:stage=>{if(stage==='journal-prepared')throw Error('power loss');}}),/power loss/);
  assert.equal(codec.decode(fs.readFileSync(x.file)).day,0);assert.deepEqual(emitted,[]);
  assert.equal(recoverCommit(x.file,e=>emitted.push(e.key))?.state,'aborted');assert.deepEqual(emitted,[]);
  assert.equal(fs.existsSync(x.file+'.m30.txn.json'),false);
 }finally{x.cleanup();}
});
test('M30 crash after world rename: replay journal, restore RNG, deliver once after recovery',()=>{
 const x=setup();try{const seen:string[]=[];
  assert.throws(()=>commitPrepared(x.file,x.p,codec,e=>seen.push(e.key),{expectedBaseSha:x.base,fault:stage=>{if(stage==='save-renamed')throw Error('crashed');}}),/crashed/);
  assert.equal(codec.decode(fs.readFileSync(x.file)).day,3);assert.deepEqual(seen,[]);
  const r=recoverCommit(x.file,e=>seen.push(e.key));assert.equal(r?.state,'committed');assert.equal(r?.delivered,3);
  assert.equal(seen.length,3);assert.deepEqual(readCommittedRng(x.file),x.p.rng);
  assert.equal(recoverCommit(x.file,()=>{throw Error('should not emit');}),null);
 }finally{x.cleanup();}
});
test('M30 crash after first publication may retry effect; receiver deduplicates by idempotency key',()=>{
 const x=setup();try{const published=new Set<string>();let calls=0;
  assert.throws(()=>commitPrepared(x.file,x.p,codec,e=>{published.add(e.key);calls++;},{expectedBaseSha:x.base,
   fault:s=>{if(s==='event-published')throw Error('crash after outbound request');}}),/crash/);
  assert.equal(calls,1);
  recoverCommit(x.file,e=>{published.add(e.key);calls++;});
  assert.equal(calls,4); // 1 repeated delivery; exactly once requires consumer dedup.
  assert.equal(published.size,3);
 }finally{x.cleanup();}
});
test('M30 optimistic concurrency detects changed save before any journal/write',()=>{
 const x=setup();try{fs.writeFileSync(x.file,codec.encode({...x.state,day:100}));
  assert.throws(()=>commitPrepared(x.file,x.p,codec,()=>{throw Error('never');},{expectedBaseSha:x.base}),/CONFLICT/);
  assert.equal(codec.decode(fs.readFileSync(x.file)).day,100);
  assert.equal(fs.existsSync(x.file+'.m30.txn.json'),false);
 }finally{x.cleanup();}
});
test('M30 corrupted save between crash and recovery requires manual resolution',()=>{
 const x=setup();try{
  assert.throws(()=>commitPrepared(x.file,x.p,codec,()=>{throw Error('no');},{expectedBaseSha:x.base,fault:s=>{if(s==='save-renamed')throw Error('crash');}}),/crash/);
  fs.writeFileSync(x.file,codec.encode({...x.state,day:99}));
  assert.throws(()=>recoverCommit(x.file,()=>{}),/CONFLICT/);
 }finally{x.cleanup();}
});
test('M30 pending journal blocks concurrent commits until recovery',()=>{
 const x=setup();try{
  assert.throws(()=>commitPrepared(x.file,x.p,codec,()=>{},{expectedBaseSha:x.base,fault:s=>{if(s==='journal-prepared')throw Error('crash');}}),/crash/);
  assert.throws(()=>commitPrepared(x.file,x.p,codec,()=>{},{expectedBaseSha:x.base}),/Pending journal/);
 }finally{x.cleanup();}
});
test('M30 inspect RNG sidecar detects mismatched game file',()=>{
 const x=setup();try{
  commitPrepared(x.file,x.p,codec,()=>{},{expectedBaseSha:x.base});
  fs.writeFileSync(x.file,codec.encode(x.state));
  assert.throws(()=>readCommittedRng(x.file),/does not match/);
 }finally{x.cleanup();}
});
import {clearStaleLock} from '../../src/m30/journal';
test('M30 lock refuses competing commit, preserves save and effects',()=>{
 const x=setup();try{
  fs.writeFileSync(x.file+'.m30.lock',JSON.stringify({pid:process.pid,created:'2026-01-01'}));
  assert.throws(()=>commitPrepared(x.file,x.p,codec,()=>{throw Error('unexpected publish');},{expectedBaseSha:x.base}),/LOCKED/);
  assert.equal(codec.decode(fs.readFileSync(x.file)).day,0);
  assert.throws(()=>clearStaleLock(x.file),/still alive/);
 }finally{x.cleanup();}
});
test('M30 stale lock can be removed only if PID is proven dead',()=>{
 const x=setup();try{
  fs.writeFileSync(x.file+'.m30.lock',JSON.stringify({pid:2147483647,created:'2026-01-01'}));
  assert.equal(clearStaleLock(x.file),true);assert.equal(clearStaleLock(x.file),false);
  assert.equal(commitPrepared(x.file,x.p,codec,()=>{},{expectedBaseSha:x.base}).state,'committed');
 }finally{x.cleanup();}
});
test('M30 codec validation failure occurs before write-ahead log',()=>{
 const x=setup();try{
  const invalid={...x.p,world:{...x.p.world,day:-50}};
  assert.throws(()=>commitPrepared(x.file,invalid,codec,()=>{},{expectedBaseSha:x.base}),/Invalid World/);
  assert.equal(codec.decode(fs.readFileSync(x.file)).day,0);
  assert.equal(fs.existsSync(x.file+'.m30.txn.json'),false);
 }finally{x.cleanup();}
});
test('M30 no-op World + advanced RNG is rejected instead of ambiguous crash recovery',()=>{
 const x=setup();try{
  const proposal=prepareBatch(x.state,x.rng,1,(_,ctx)=>{ctx.rng.freshInt(100);return 'completed';},'rng-only');
  assert.throws(()=>commitPrepared(x.file,proposal,codec,()=>{},{expectedBaseSha:x.base}),/Ambiguous commit/);
  assert.equal(fs.existsSync(x.file+'.m30.txn.json'),false);
 }finally{x.cleanup();}
});
test('M30 crash after RNG sidecar is written: recover without losing events',()=>{
 const x=setup();try{
  assert.throws(()=>commitPrepared(x.file,x.p,codec,()=>{},{expectedBaseSha:x.base,
   fault:stage=>{if(stage==='sidecar-written')throw Error('powerloss');}}),/powerloss/);
  assert.deepEqual(readCommittedRng(x.file),x.p.rng);
  const seen:string[]=[];assert.equal(recoverCommit(x.file,e=>seen.push(e.key))?.delivered,3);
  assert.equal(seen.length,3);
 }finally{x.cleanup();}
});

import {inspectJournal} from '../../src/m30/journal';
test('M30 read-only journal inspection distinguishes prepared/committed without publishing',()=>{
 const x=setup();try{
  assert.equal(inspectJournal(x.file).present,false);
  assert.throws(()=>commitPrepared(x.file,x.p,codec,()=>{},{expectedBaseSha:x.base,
   fault:s=>{if(s==='journal-prepared')throw Error('crash');}}),/crash/);
  const j=inspectJournal(x.file);assert.equal(j.present,true);assert.equal(j.saveMatches,'base');
  assert.equal(j.pending,3);assert.equal(j.acked,0);
  assert.equal(codec.decode(fs.readFileSync(x.file)).day,0);
 }finally{x.cleanup();}
});
