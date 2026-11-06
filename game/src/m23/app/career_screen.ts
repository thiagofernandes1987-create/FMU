/** Rust crates/app/src/screens/career.rs::new and screen dialog state lifecycle.
 * Navigation and mod ticks use their own implementations; this is view state. */
export const CAREER_DIALOGS=['tables','calendar','teams','lineup','round','contract','offer','youth','history','search','preferences','training','newspaper','messages','coaches','trophies'] as const;
export type CareerDialog=(typeof CAREER_DIALOGS)[number];
export interface CareerScreenView {clubId:string;selectedPlayerId?:string;openDialogs:CareerDialog[];squadSort?:{key:string;descending:boolean};seasonOverSeen:boolean;tickedAt?:[number,number];}
export function newCareerScreenView(humanClubId:string|undefined,firstLeagueClubId:string|undefined,seasonOver:boolean):CareerScreenView {
 return {clubId:humanClubId??firstLeagueClubId??'0',openDialogs:[],seasonOverSeen:seasonOver};
}
export function toggleCareerDialog(s:CareerScreenView,dialog:CareerDialog,on:boolean):CareerScreenView{
 const open=s.openDialogs.filter(x=>x!==dialog);if(on)open.push(dialog);return {...s,openDialogs:open};
}
