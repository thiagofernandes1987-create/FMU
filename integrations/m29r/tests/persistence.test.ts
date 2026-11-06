const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
import {demoWorld,demoHooks} from '../src/demo';
import {RandomSource} from '../src/rng';
import {advanceWorld} from '../src/advance';
import {encodeCheckpoint,decodeCheckpoint,writeCheckpointAtomic,readCheckpoint} from '../src/persistence';
test('World and RNG lossless binary checkpoint (bigint, unknown metadata)',()=>{
 const w=demoWorld(),rng=new RandomSource(9923n);rng.mathRandom();
 w.clubs[0]!.cash=9007199254740999n;(w.game as any).opaque={n:1234567890123456789n,b:Uint8Array.from([1,2,3]),key:'ignored by engine'};
 const out=decodeCheckpoint(encodeCheckpoint(w,rng));assert.deepEqual(out.world,w);assert.deepEqual(out.rng.snapshot(),rng.snapshot());
});
test('roundtrip includes continued game: restart after day 9 is byte-equivalent to in-memory',()=>{
 let w=demoWorld(),rng=new RandomSource(42n);for(let i=0;i<9;i++){const o=advanceWorld(w,rng,demoHooks());w=o.world;rng=o.rng;}
 const loaded=decodeCheckpoint(encodeCheckpoint(w,rng));
 for(let i=0;i<9;i++){
  const a=advanceWorld(w,rng,demoHooks()),b=advanceWorld(loaded.world,loaded.rng,demoHooks());
  assert.deepEqual(a.world,b.world);assert.deepEqual(a.rng.snapshot(),b.rng.snapshot());
  w=a.world;rng=a.rng;loaded.world=b.world;loaded.rng=b.rng;
 }
 assert.equal(w.game.season_over,true);
});
test('snapshot changes to header or payload fail SHA256 before deserialization',()=>{
 const save=encodeCheckpoint(demoWorld(),new RandomSource(1));
 const b=Uint8Array.from(save);b[b.length-1]! ^=1;assert.throws(()=>decodeCheckpoint(b),/checksum/);
 const wrong=Uint8Array.from(save);wrong[0]=65;assert.throws(()=>decodeCheckpoint(wrong),/not a .fmu-day/);
});
test('atomic save: three rotated backups, no .tmp and exact re-open',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fmu-atomic-')),p=path.join(dir,'career.fmu-day');
 try {
  const w=demoWorld(),rng=new RandomSource(8);
  for(let n=0;n<5;n++){w.game.season=n+1;writeCheckpointAtomic(p,w,rng);}
  assert.equal(readCheckpoint(p).world.game.season,5);
  assert.equal(readCheckpoint(p+'.bak1').world.game.season,4);
  assert.equal(readCheckpoint(p+'.bak3').world.game.season,2);
  assert.equal(fs.existsSync(p+'.tmp'),false);assert.equal(fs.existsSync(p+'.bak4'),false);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('validation failures do not replace the existing checkpoint file',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fmu-atomic-')),p=path.join(dir,'career.fmu-day');
 try {
  const w=demoWorld(),rng=new RandomSource(8);writeCheckpointAtomic(p,w,rng);const old=fs.readFileSync(p);
  w.matches[0]!.home=1000;
  assert.throws(()=>writeCheckpointAtomic(p,w,rng),/invalid home/);
  assert.deepEqual(fs.readFileSync(p),old);assert.equal(fs.existsSync(p+'.tmp'),false);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('never represent own checkpoint format as original .bfn',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fmu-atomic-')),p=path.join(dir,'career.bfn');
 try{assert.throws(()=>writeCheckpointAtomic(p,demoWorld(),new RandomSource(1)),/NOT .bfn/);}
 finally{fs.rmSync(dir,{recursive:true,force:true});}
});
