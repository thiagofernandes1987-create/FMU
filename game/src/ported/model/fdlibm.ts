/** M21 — conversão literal de crates/model/src/fdlibm.rs (`StrictMath.log`).
 * Preserva operações IEEE-754 e bitwise do fdlibm 5.3; zero I/O e estado.
 * Equivalência conferida contra os sete vetores de bits do próprio teste Rust. */
const LN2_HI=6.93147180369123816490e-1,LN2_LO=1.90821492927058770002e-10;
const TWO54=1.80143985094819840000e16;
const LG1=6.666666666666735130e-1,LG2=3.999999999940941908e-1;
const LG3=2.857142874366239149e-1,LG4=2.222219843214978396e-1;
const LG5=1.818357216161805012e-1,LG6=1.531383769920937332e-1,LG7=1.479819860511658591e-1;
const view=new DataView(new ArrayBuffer(8));
export function f64FromBits(bits:bigint):number {view.setBigUint64(0,bits,false);return view.getFloat64(0,false);}
export function f64Bits(x:number):bigint{view.setFloat64(0,x,false);return view.getBigUint64(0,false);}
function high(x:number):number{view.setFloat64(0,x,false);return view.getInt32(0,false);}
function low(x:number):number{view.setFloat64(0,x,false);return view.getUint32(4,false);}
function withHigh(x:number,hi:number):number{const lo=low(x);view.setInt32(0,hi,false);view.setUint32(4,lo,false);return view.getFloat64(0,false);}
/** `StrictMath.log`: reproduz redução de expoente, polinômios e casos subnormais. */
export function strictLog(input:number):number{
 let x=input,hx=high(x),lx=low(x),k=0;
 if(hx<0x00100000){
  if(((hx&0x7fffffff)|lx)===0)return -Infinity;
  if(hx<0)return NaN;
  k-=54;x*=TWO54;hx=high(x);
 }
 if(hx>=0x7ff00000)return x+x;
 k+=(hx>>20)-1023;hx&=0x000fffff;
 const i=(hx+0x95f64)&0x100000;
 x=withHigh(x,hx|(i^0x3ff00000));k+=i>>20;
 const f=x-1;
 if((0x000fffff&(2+hx))<3){
  if(f===0){if(k===0)return 0;return k*LN2_HI+k*LN2_LO;}
  const r=f*f*(.5-.33333333333333333*f);
  if(k===0)return f-r;
  return k*LN2_HI-((r-k*LN2_LO)-f);
 }
 const s=f/(2+f),dk=k,z=s*s;
 let ii=hx-0x6147a;
 const w=z*z,j=0x6b851-hx;
 const t1=w*(LG2+w*(LG4+w*LG6));
 const t2=z*(LG1+w*(LG3+w*(LG5+w*LG7)));
 ii|=j;
 const r=t2+t1;
 if(ii>0){
  const hfsq=.5*f*f;
  if(k===0)return f-(hfsq-s*(hfsq+r));
  return dk*LN2_HI-((hfsq-(s*(hfsq+r)+dk*LN2_LO))-f);
 }
 if(k===0)return f-s*(f-r);
 return dk*LN2_HI-((s*(f-r)-dk*LN2_LO)-f);
}
