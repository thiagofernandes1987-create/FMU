/**
 * Port tested against java.util.Random and crates/model/src/rng.rs.
 * Exact 48-bit LCG for nextInt, bounded int, long, boolean, float, double,
 * Math.random and Collections.shuffle (not StrictMath Gaussian).
 * All seeds, draw counters and caches are clonable: rollbacks include RNG.
 * Cannot claim parity for unseeded, time/OS-dependent Random sources.
 */
const MASK=(1n<<48n)-1n, MULT=0x5deece66dn, ADD=11n;
const I64_MASK=(1n<<64n)-1n;
const signed64=(v:bigint):bigint=>BigInt.asIntN(64,v);
const i32=(x:number):number=>x|0;
export interface RandomCheckpoint {seed:string;gaussian:number|null;draws:number;}
export class JavaRandom {
 private state:bigint;
 private gaussian:number|null=null;
 draws=0;
 constructor(seed:bigint|number){this.state=(BigInt(seed)^MULT)&MASK;}
 static restore(snapshot:RandomCheckpoint):JavaRandom {
  const r=new JavaRandom(0n);r.state=BigInt(snapshot.seed);r.gaussian=snapshot.gaussian;r.draws=snapshot.draws;return r;
 }
 snapshot():RandomCheckpoint{return {seed:this.state.toString(),gaussian:this.gaussian,draws:this.draws};}
 private next(bits:number):number {
  if(bits<1||bits>32||!Number.isInteger(bits))throw new RangeError('next bits must be 1..32');
  this.draws++;this.state=(this.state*MULT+ADD)&MASK;
  const n=Number(this.state>>BigInt(48-bits));return bits===32?i32(n):n;
 }
 int():number{return this.next(32);}
 bounded(bound:number):number {
  if(!Number.isInteger(bound)||bound<=0||bound>2147483647)throw new RangeError('bound must be positive i32');
  let bits=this.next(31),value:number;
  if((bound&(bound-1))===0)return Number((BigInt(bound)*BigInt(bits))>>31n);
  for(;;){value=bits%bound;
   if(i32(bits-value+(bound-1))>=0)return value;
   bits=this.next(31);
  }
 }
 long():bigint {
  const high=BigInt(this.next(32)),low=BigInt(this.next(32));
  return signed64((high<<32n)+low);
 }
 boolean():boolean{return this.next(1)!==0;}
 float():number{return this.next(24)/16777216;}
 double():number{return ((this.next(26)*134217728)+this.next(27))/9007199254740992;}
 shuffle<T>(items:T[]):void {for(let i=items.length-1;i>0;i--){const j=this.bounded(i+1);[items[i],items[j]]=[items[j]!,items[i]!];}}
}
export interface RandomSourceCheckpoint {nextSeed:string;math:RandomCheckpoint|null;collections:RandomCheckpoint|null;}
export class RandomSource {
 private nextSeed:bigint;private math:JavaRandom|null=null;private collections:JavaRandom|null=null;
 constructor(seed:bigint|number){this.nextSeed=BigInt(seed);}
 static restore(state:RandomSourceCheckpoint):RandomSource {const r=new RandomSource(BigInt(state.nextSeed));r.math=state.math?JavaRandom.restore(state.math):null;r.collections=state.collections?JavaRandom.restore(state.collections):null;return r;}
 snapshot():RandomSourceCheckpoint{return {nextSeed:this.nextSeed.toString(),math:this.math?.snapshot()??null,collections:this.collections?.snapshot()??null};}
 clone():RandomSource{return RandomSource.restore(this.snapshot());}
 newRandom():JavaRandom {const r=new JavaRandom(this.nextSeed);this.nextSeed=signed64(this.nextSeed+1n);return r;}
 freshInt(bound:number):number{return this.newRandom().bounded(bound);}
 mathRandom():number{if(!this.math)this.math=this.newRandom();return this.math.double();}
 shuffle<T>(items:T[]):void {if(!this.collections)this.collections=this.newRandom();this.collections.shuffle(items);}
}
/** Java Math.round(double): saturating and NaN→0. */
export function javaRound(x:number):bigint {
 if(Number.isNaN(x))return 0n;
 if(x===Infinity)return (1n<<63n)-1n;if(x===-Infinity)return -(1n<<63n);
 if(x>=9223372036854775807)return (1n<<63n)-1n;
 if(x<=-9223372036854775808)return -(1n<<63n);
 const floored=Math.floor(x);return BigInt(x-floored>=0.5?floored+1:floored);
}