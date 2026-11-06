/** Rust crates/app/src/screens/round.rs: playback speed and live clock label;
 * simulation and event rendering are handled by the existing engine. */
export function roundSpeedIndex(hasHuman:boolean,humanSpeed:number,otherSpeed:number):number{return Math.max(0,Math.min(5,hasHuman?humanSpeed:otherSpeed));}
export type RoundTimeState={on:boolean;over:boolean;minute:number;half:number;};
export function roundTimeLabel(s:RoundTimeState):{key:string;args?:Record<string,string>}{
 if(!s.on)return {key:'live-round-finished'};
 if(s.over)return {key:'live-round-full-time'};
 if(s.half===2&&s.minute===0)return {key:'live-round-half-time'};
 if(s.minute>=45)return {key:'live-round-added-time',args:{half:String(s.half)}};
 return {key:'live-round-clock',args:{minute:String(s.minute),half:String(s.half)}};
}
