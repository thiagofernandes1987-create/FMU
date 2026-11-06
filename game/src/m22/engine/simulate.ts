/** M22 partial port engine/src/simulate.rs::behind and AI substitution preflight.
 * Match events, referee and penalty shootout require the full mutable Rust World,
 * so this module only ports the selection predicates used before substitutions.
 * Inputs game score/timers/substitute slots. Side 1 is home, 2 away.
 * Effects: none; the caller must perform actual substitute only after true. */
export function sideBehind22(homeGoals:number,awayGoals:number,side:1|2,by=1):boolean {
 if(![homeGoals,awayGoals,by].every(Number.isInteger)||by<0)throw Error('Invalid match score');
 return side===1?awayGoals-homeGoals>=by:homeGoals-awayGoals>=by;
}
export interface AiChanges22 {
 half:number;minute:number;side:1|2;human:boolean;subsLeft:number;
 homeGoals:number;awayGoals:number;plannedMinutes:readonly number[];substitutionMinutes:readonly number[];
}
/** `ai_changes`: second-half only. At half-time losing side may pick a random change;
 * at planned minutes normal changes are suppressed. This is a decision, not an event. */
export function aiChangeDecision22(x:AiChanges22,drawPercent:()=>number):'NONE'|'PLANNED'|'HALFTIME_CHANCE' {
 if(x.half!==2||x.human||x.subsLeft<=0)return 'NONE';
 if(x.minute===0&&sideBehind22(x.homeGoals,x.awayGoals,x.side,1)){
  const draw=drawPercent();if(!Number.isInteger(draw)||draw<0||draw>=100)throw Error('Invalid substitution RNG');
  return draw>50?'HALFTIME_CHANCE':'NONE';
 }
 if(!x.plannedMinutes.slice(0,3).includes(x.minute)&&x.substitutionMinutes.slice(0,4).includes(x.minute))return 'PLANNED';
 return 'NONE';
}
