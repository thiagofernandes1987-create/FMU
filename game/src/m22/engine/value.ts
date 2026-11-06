/** M22 partial port engine/src/value.rs. Slot kind, seven attribute weights, positional penalty.
 * Inputs authentic attribute order [Gol,Vel,Tec,Pas,Des,Arm,Fin] and position/slot;
 * output strength integer; no mutable World. Engine's reputation/competition cuts remain pending. */
const W:readonly (readonly number[])[]=[
 [.6,0,0,0,.15,.15,.1],[0,.5,.05,0,.25,.1,.1],[0,.4,.05,.05,.1,.1,.3],
 [0,.05,.2,.1,.25,.15,.25],[0,.4,.1,.05,.15,.1,.2],
 [0,.05,.4,.1,.1,.1,.25],[0,0,.05,.4,.25,.25,.05],[0,0,.05,.4,.25,.15,.15]
];
export function slotKind22(slot:number):number {return slot===1?0:slot>=3&&slot<=8?1:slot===2||slot===9?2:slot===10||slot===17?3:slot>=11&&slot<=13?4:slot>=14&&slot<=16?5:slot===18||slot===25?7:6;}
export function modAttributeMix22(attributes:readonly number[],slot:number):number {
 if(attributes.length!==7||attributes.some(v=>!Number.isFinite(v)))throw Error('Expected seven skills');
 const a=[attributes[0],attributes[4],attributes[5],attributes[6],attributes[1],attributes[2],attributes[3]];
 return a.reduce<number>((total,value,i)=>total+Math.floor(value!*W[slotKind22(slot)]![i]!+0.5),0);
}
export function modPlayerValue22(strength:number,attributes:readonly number[],slot:number,individual:boolean,offPosition:boolean):number {
 let value=individual?modAttributeMix22(attributes,slot):strength;
 if(offPosition)value=Math.floor(value*.5+.5);
 return Math.max(1,value);
}
