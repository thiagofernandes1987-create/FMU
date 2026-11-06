/**
 * FMU M30 — Java RNG bit-compatible port of Brasfoot Next
 * crates/model/src/rng.rs (JavaRandom and RandomSource deterministic mode).
 *
 * Inputs: signed 64-bit seeds; outputs 32-bit ints, bounded draws, floats,
 * doubles, longs, Gaussian and deterministic shuffle. Internal state is 48-bit
 * BigInt and is copyable/serializable for transactional rollback.
 *
 * Dependencies: none. Does not use Math.random or wall-clock entropy.
 * Float Gaussian fdlibm StrictMath.log may differ in last bit by JS engine;
 * exact GAUSSIAN parity is tested separately and not assumed if it fails.
 */
const MASK=(1n<<48n)-1n, MULT=0x5deece66dn, ADD=11n;
const asLong=(n:bigint)=>BigInt.asIntN(64,n);
export type JavaRngSnapshot={seed:string; cachedGaussian:number|null; draws:number};
const validInteger=(n:number,bound:number)=>Number.isSafeInteger(n)&&n>=0&&n<bound;
function parseBigInt(s:string):bigint{if(!/^-?\d+$/.test(s))throw Error('Invalid RNG integer string');return BigInt(s);}
export class JavaRandom {
 private state:bigint;
 private gaussianCache:number|null=null;
 draws=0;
 constructor(seed:bigint|number){
  if(typeof seed==='number'&&!Number.isSafeInteger(seed))throw Error('JavaRandom seed must be safe integer or bigint');
  this.state=(BigInt(seed)^MULT)&MASK;
 }
 static fromSnapshot(s:JavaRngSnapshot):JavaRandom{
  const r=new JavaRandom(0);r.state=parseBigInt(s.seed);
  if(r.state<0n||r.state>MASK||!Number.isSafeInteger(s.draws)||s.draws<0)throw Error('Invalid Java RNG snapshot');
  if(s.cachedGaussian!==null&&!Number.isFinite(s.cachedGaussian))throw Error('Invalid gaussian cache');
  r.gaussianCache=s.cachedGaussian;r.draws=s.draws;return r;
 }
 snapshot():JavaRngSnapshot{return {seed:this.state.toString(),cachedGaussian:this.gaussianCache,draws:this.draws};}
 clone():JavaRandom{return JavaRandom.fromSnapshot(this.snapshot());}
 setSeed(seed:bigint|number):void{if(typeof seed==='number'&&!Number.isSafeInteger(seed))throw Error('Invalid seed');this.state=(BigInt(seed)^MULT)&MASK;this.gaussianCache=null;}
 private next(bits:number):number{
  if(!Number.isInteger(bits)||bits<1||bits>32)throw RangeError('JavaRandom bits 1..32');
  this.state=(this.state*MULT+ADD)&MASK;this.draws++;
  const result=Number(this.state>>BigInt(48-bits));
  return bits===32?result|0:result;
 }
 nextInt():number{return this.next(32);}
 nextIntBounded(bound:number):number{
  if(!Number.isSafeInteger(bound)||bound<1||bound>2147483647)throw RangeError('Java nextInt bound 1..2147483647');
  let r=this.next(31),m=bound-1;
  if((bound&m)===0)return Number((BigInt(bound)*BigInt(r))>>31n);
  let u=r;
  while(true){r=u%bound;
   if(((u-r+m)|0)>=0)return r;
   u=this.next(31);
  }
 }
 nextLong():bigint{
  const left=this.next(32),right=this.next(32);
  return asLong((BigInt(left)<<32n)+BigInt(right));
 }
 nextBoolean():boolean{return this.next(1)!==0;}
 nextFloat():number{return Math.fround(this.next(24)/(1<<24));}
 nextDouble():number{return (this.next(26)*2**27+this.next(27))/2**53;}
 nextGaussian():number{
  if(this.gaussianCache!==null){const x=this.gaussianCache;this.gaussianCache=null;return x;}
  for(let i=0;i<10000;i++){
   const v1=2*this.nextDouble()-1,v2=2*this.nextDouble()-1,s=v1*v1+v2*v2;
   if(s<1&&s!==0){const multiplier=Math.sqrt(-2*Math.log(s)/s);
    this.gaussianCache=v2*multiplier;return v1*multiplier;
   }
  }
  throw Error('Gaussian generator exceeded safety threshold');
 }
 shuffle<T>(list:T[]):T[]{for(let i=list.length-1;i>0;i--){const j=this.nextIntBounded(i+1);[list[i],list[j]]=[list[j]!,list[i]!];}return list;}
}
export type RandomSourceSnapshot={nextSeed:string;math:JavaRngSnapshot|null;collections:JavaRngSnapshot|null;};
/** Deterministic RandomSource of Rust used for differential fixtures. */
export class DeterministicRandomSource {
 private nextSeed:bigint;
 private math:JavaRandom|null=null;
 private collections:JavaRandom|null=null;
 constructor(seed:bigint|number){if(typeof seed==='number'&&!Number.isSafeInteger(seed))throw Error('Unsafe RNG seed');this.nextSeed=asLong(BigInt(seed));}
 static fromSnapshot(s:RandomSourceSnapshot):DeterministicRandomSource{
  const r=new DeterministicRandomSource(parseBigInt(s.nextSeed));
  r.math=s.math?JavaRandom.fromSnapshot(s.math):null;
  r.collections=s.collections?JavaRandom.fromSnapshot(s.collections):null;return r;
 }
 snapshot():RandomSourceSnapshot{return {nextSeed:this.nextSeed.toString(),math:this.math?.snapshot()??null,collections:this.collections?.snapshot()??null};}
 clone():DeterministicRandomSource{return DeterministicRandomSource.fromSnapshot(this.snapshot());}
 get nextSeedValue():bigint{return this.nextSeed;}
 newRandom():JavaRandom{const r=new JavaRandom(this.nextSeed);this.nextSeed=asLong(this.nextSeed+1n);return r;}
 freshInt(bound:number):number{return this.newRandom().nextIntBounded(bound);}
 staticRandom(seed:bigint|number):JavaRandom{return new JavaRandom(seed);}
 mathRandom():number{if(!this.math)this.math=this.newRandom();return this.math.nextDouble();}
 shuffle<T>(list:T[]):T[]{if(!this.collections)this.collections=this.newRandom();return this.collections.shuffle(list);}
}
/** Rust Java Math.round uses half-up with ties to +infinity and i64 saturation. */
export function javaRound(x:number):bigint{
 if(Number.isNaN(x))return 0n;
 const max=(1n<<63n)-1n,min=-(1n<<63n);
 if(x>=Number(max))return max;if(x<=Number(min))return min;
 const floor=Math.floor(x);return BigInt(x-floor>=0.5?floor+1:floor);
}
