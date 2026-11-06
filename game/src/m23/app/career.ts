/** Rust crates/app/src/career.rs: transactional career advancement and original
 * UI policy for human-club advancement; persistence and complete World are injected.
 * DOES NOT replace the native `.bfn` serializer or Rust full World. */
export interface CareerState<W> {world:W;humanCoachClubIds:(string|undefined)[];humanClubs:string[];}
export function humanCareerClub<W>(state:CareerState<W>):string|undefined{return state.humanCoachClubIds.find((s):s is string=>s!==undefined);}
/** `can_advance`: only entirely AI-managed careers may run unattended. */
export function canAdvanceCareer<W>(state:CareerState<W>):boolean{return state.humanClubs.length===0&&humanCareerClub(state)===undefined;}
/** `advance`: roll back world to a deep snapshot on an error; other hooks are external.
 * The callbacks perform real simulation and provide a faithful clone/restore contract. */
export function advanceCareer<W>(state:CareerState<W>,clone:(world:W)=>W,run:(world:W)=>void):void{
 const prior=clone(state.world);try{run(state.world);}catch(error){state.world=prior;throw error;}
}
export function careerSaveMeta(date:{year:number;monthZero:number;day:number},club:string,coach:string,season:number,source?:string):{club:string;coach:string;date:string;season:number;importedFrom?:string}{
 return {club,coach,date:`${String(date.year).padStart(4,'0')}-${String(date.monthZero+1).padStart(2,'0')}-${String(date.day).padStart(2,'0')}`,season,importedFrom:source};
}
