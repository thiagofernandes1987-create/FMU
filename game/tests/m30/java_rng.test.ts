/** Differential regression against the four Java/JDK 21 bit vectors embedded in upstream Rust rng.rs. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
import {JavaRandom,DeterministicRandomSource,javaRound} from '../../src/m30/java_rng';
const source=fs.readFileSync(path.join(process.cwd(),'reference','rng.rs'),'utf8') as string;
const part=source.split('const REFERENCES: [Reference; 4]')[1]?.split('];')[0];
if(!part)throw Error('Missing upstream Rust RNG vectors');
const records=(part.match(/Reference \{[\s\S]*?\}/g)??[]).map((r:string)=>{
 const num=(k:string)=>{const x=new RegExp(k+':\\s*(-?[\\d_]+)').exec(r);if(!x)throw Error('Missing reference '+k);return BigInt(x[1]!.replace(/_/g,''));};
 const shuffled=(r.match(/shuffled:\s*\[([^\]]+)\]/)?.[1]??'').split(',').map((x:string)=>Number(x.trim()));
 return {seed:num('seed'),int:Number(num('int')),int10:Number(num('int10')),int100:Number(num('int100')),
 int1000:Number(num('int1000')),int16:Number(num('int16')),int7e8:Number(num('int7e8')),
 long:num('long'),boolean:/boolean:\s*true/.test(r),floatBits:Number(num('float_bits')),
 doubleBits:num('double_bits'),gaussianBits:(r.match(/gaussian_bits:\s*\[([^\]]+)\]/)?.[1]??'').split(',').map((x:string)=>BigInt(x.trim())),shuffled};
});
function f32bits(n:number):number{const d=new DataView(new ArrayBuffer(4));d.setFloat32(0,n);return d.getUint32(0);}
function f64bits(n:number):bigint{const d=new DataView(new ArrayBuffer(8));d.setFloat64(0,n);return BigInt.asIntN(64,d.getBigUint64(0));}
test('M30 RNG reference set from original Rust source has four JDK21 seeds',()=>assert.equal(records.length,4));
for(const ref of records){
 test(`M30 JavaRandom exact integer/float/double vectors seed=${ref.seed}`,()=>{
  const r=new JavaRandom(ref.seed);
  assert.equal(r.nextInt(),ref.int);assert.equal(r.nextIntBounded(10),ref.int10);
  assert.equal(r.nextIntBounded(100),ref.int100);assert.equal(r.nextIntBounded(1000),ref.int1000);
  assert.equal(r.nextIntBounded(16),ref.int16);assert.equal(r.nextIntBounded(700_000_000),ref.int7e8);
  assert.equal(r.nextLong(),ref.long);assert.equal(r.nextBoolean(),ref.boolean);
  assert.equal(f32bits(r.nextFloat()),ref.floatBits);assert.equal(f64bits(r.nextDouble()),BigInt.asIntN(64,ref.doubleBits));
 });
 test(`M30 JavaRandom snapshot restores shuffle and stochastic stream seed=${ref.seed}`,()=>{
  const a=new JavaRandom(ref.seed),b=a.clone();
  for(let i=0;i<200;i++)assert.equal(a.nextIntBounded(100_000),b.nextIntBounded(100_000));
  const ss=a.snapshot();const c=JavaRandom.fromSnapshot(ss);
  assert.deepEqual(c.snapshot(),ss);assert.equal(a.nextDouble(),c.nextDouble());
 });
 test(`M30 JavaRandom Gaussian and shuffle match source reference seed=${ref.seed}`,()=>{
  const r=new JavaRandom(ref.seed);
  r.nextInt();for(const n of [10,100,1000,16,700000000])r.nextIntBounded(n);
  r.nextLong();r.nextBoolean();r.nextFloat();r.nextDouble();
  const gs=[f64bits(r.nextGaussian()),f64bits(r.nextGaussian())];
  // JS Math.log may differ from fdlibm::log at sub-ulp precision.
  assert.ok(gs.every((x,i)=>(x-ref.gaussianBits[i]!)<=8n&&(x-ref.gaussianBits[i]!)>=-8n),`gaussian drift seed ${ref.seed}: ${gs} vs ${ref.gaussianBits}`);
  const list=Array.from({length:10},(_,i)=>i);assert.deepEqual(r.shuffle(list),ref.shuffled);
 });
}
test('M30 deterministic RandomSource counter matches original Rust test',()=>{
 const a=new DeterministicRandomSource(100),b=new DeterministicRandomSource(100);
 assert.deepEqual(a.newRandom().snapshot(),new JavaRandom(100).snapshot());
 assert.equal(a.freshInt(1000),new JavaRandom(101).nextIntBounded(1000));
 b.newRandom();b.newRandom();assert.equal(a.mathRandom(),b.mathRandom());
});
test('M30 transaction RNG snapshots capture math + shuffle generator states',()=>{
 const a=new DeterministicRandomSource(1);
 a.mathRandom();a.shuffle([0,1,2,3,4]);const b=DeterministicRandomSource.fromSnapshot(a.snapshot());
 assert.deepEqual(b.snapshot(),a.snapshot());assert.equal(a.mathRandom(),b.mathRandom());
 assert.deepEqual(a.shuffle([0,1,2,3,4,5]),b.shuffle([0,1,2,3,4,5]));
});
test('M30 invalid bounds, snapshots, unsafe seeds rejected before random draw',()=>{
 assert.throws(()=>new JavaRandom(Number.MAX_SAFE_INTEGER+1));
 const r=new JavaRandom(42);for(const bound of [0,-1,2**31,1.2])assert.throws(()=>r.nextIntBounded(bound));
 assert.throws(()=>JavaRandom.fromSnapshot({seed:'-1',cachedGaussian:null,draws:0}));
 assert.throws(()=>JavaRandom.fromSnapshot({seed:'garbage',cachedGaussian:null,draws:0}));
});
test('M30 Java Math.round matches Rust tie cases and saturation',()=>{
 for(const [n,v] of [[2.5,3n],[-2.5,-2n],[0.49999999999999994,0n],[-0.5,0n],[-1.5,-1n],[7.5,8n], [NaN,0n]] as const){
  assert.equal(javaRound(n),v);
 }
 assert.equal(javaRound(1e20),9223372036854775807n);
});
