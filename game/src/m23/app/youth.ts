/** Rust crates/app/src/screens/youth.rs: academy/championship/scouting tabs
 * and selected youth player state; no simulated academy generation. */
export const YOUTH_TABS=['youth-tab-academy','youth-tab-championship','youth-tab-scouting'] as const;
export type YouthViewState={clubId:string;tab:number;selectedPlayerId?:string;status?:string};
export function newYouthState(clubId:string):YouthViewState{return {clubId,tab:0};}
export function selectYouthTab(s:YouthViewState,tab:number):YouthViewState{
 if(!Number.isInteger(tab)||tab<0||tab>=YOUTH_TABS.length)throw new RangeError('Invalid youth tab');return {...s,tab};}
