/** Rust crates/app/src/screens/new_game.rs: coach onboarding validation,
 * selection of first club by division and seeded random choice (RNG injected). */
export interface NewGameChoice {countryIndex:number;divisions:readonly (readonly string[])[];chosen?:{division:number;clubId:string};random?:string;randomOn:boolean;name:string;}
export function chooseFirstClub(divisions:readonly (readonly string[])[]):{division:number;clubId:string}|undefined{
 for(let d=0;d<divisions.length;d++)if(divisions[d]?.length)return {division:d,clubId:divisions[d]![0]!};return undefined;
}
export function chooseRandomClub(divisions:readonly (readonly string[])[],draw:(n:number)=>number):string|undefined{
 let last=0;for(let d=0;d<divisions.length;d++)if(divisions[d]?.length)last=d+1;
 if(!last)return undefined;const idx=draw(last);if(idx<0||idx>=last)throw new RangeError('Invalid division RNG');
 const clubs=divisions[idx]!;if(!clubs.length)return undefined;const club=draw(clubs.length);
 if(club<0||club>=clubs.length)throw new RangeError('Invalid club RNG');return clubs[club];
}
export function validateNewCoach(name:string,teamSelected:boolean):string|undefined{
 const s=name.trim(),length=Array.from(s).length;
 if(!length)return 'add-human-coach-error-name-empty';
 if(length<2)return 'add-human-coach-error-name-short';
 if(length>35)return 'add-human-coach-error-name-long';
 if(!teamSelected)return 'add-human-coach-error-no-team';
 return undefined;
}
