/** M22 partial port engine/src/tactics.rs balancing, style cycle and role fit.
 * Inputs slot aggregates and tactical styles; no engine state is modified.
 * Full duel modifiers/callback hooks remain in Rust engine, not ported. */
export const BALANCED22=0,ALL_OUT_ATTACK22=1,COUNTER_ATTACK22=2;
export function tacticalBeats22(a:number,b:number):boolean {return a===ALL_OUT_ATTACK22&&b===BALANCED22||a===BALANCED22&&b===COUNTER_ATTACK22||a===COUNTER_ATTACK22&&b===ALL_OUT_ATTACK22;}
export function tacticalAdvantage22(a:number,b:number):number {return tacticalBeats22(a,b)?1:tacticalBeats22(b,a)?-1:0;}
export function tacticalCycle22(a:number,b:number):number {return 1+.4*tacticalAdvantage22(a,b);}
export function tacticalFitLimit22(x:number):number {return Math.max(.6,Math.min(1.3,x));}
export function tacticalSlotAverage22(players:readonly {slot:number;value:number}[],slots:readonly number[]):number {
 const relevant=players.filter(p=>slots.includes(p.slot));return relevant.length?relevant.reduce((v,p)=>v+p.value/10,0)/relevant.length:0;
}
