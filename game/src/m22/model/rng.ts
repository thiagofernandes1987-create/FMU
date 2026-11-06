/** Fonte: model/src/rng.rs. LCG java.util.Random de 48 bits e RNGs separados.
 * Dependência: aritmética BigInt; efeitos: apenas estado da instância.
 * nextIntBounded corresponde ao algoritmo Java com rejeição e overflow i32. */
const MULT=0x5deece66dn,ADD=11n,MASK=(1n<<48n)-1n;
export class JavaLCG22 {
 private seed:bigint;
 public draws=0;
 constructor(seed:number|bigint){this.seed=(BigInt(seed)^MULT)&MASK;}
 /** `next(bits)`, contagem em ordem e truncamento de 32 bits. */
 next(bits:number):number{if(!Number.isInteger(bits)||bits<1||bits>32)throw RangeError('bits 1..32');this.draws++;this.seed=(this.seed*MULT+ADD)&MASK;return Number(this.seed>>BigInt(48-bits))|0;}
 nextInt():number{return this.next(32);}
 nextIntBounded(bound:number):number{
 if(!Number.isInteger(bound)||bound<=0||bound>0x7fffffff)throw RangeError('bound positive int32');
 let r=this.next(31),m=bound-1;
 if((bound&m)===0)return Number((BigInt(bound)*BigInt(r))>>31n);
 while(true){const u=r;r=u%bound;if(((u-r+m)|0)>=0)return r;r=this.next(31);}
 }
 nextDouble():number{return (Number((BigInt(this.next(26))<<27n)+BigInt(this.next(27))))/(2**53);}
 shuffle<T>(items:T[]):T[]{for(let i=items.length-1;i>0;i--){const j=this.nextIntBounded(i+1);[items[i],items[j]]=[items[j]!,items[i]!];}return items;}
 exportState():string{return this.seed.toString(16).padStart(12,'0');}
}
