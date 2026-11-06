/** Fonte: systems/src/academy.rs. Curva 16–25 anos, potencial e seleção por força.
 * Dependência: academia do World fornece teto; cálculo puro e determinístico. */
const CURVE=[.45,.52,.60,.68,.75,.82,.88,.94,.98,1] as const;
export function academyCurve22(age:number):number{
 if(age<=16)return CURVE[0]*Math.max(.8,age/16);if(age>=25)return 1;
 const n=Math.floor(age)-16,f=age-Math.floor(age);return CURVE[n]!+(CURVE[n+1]!-CURVE[n]!)*f;
}
export function academyTargetStrength22(ceiling:number,age:number):number{return Math.floor(ceiling*academyCurve22(age)+.5);}
export function academyPotential22(ceiling:number):number{return Math.max(1,Math.min(10,Math.floor((ceiling-30)/6.5+.5)));}
export function academyNthBest22(strengths:readonly number[],n:number):number{return [...strengths].sort((a,b)=>b-a)[n-1]??0;}
