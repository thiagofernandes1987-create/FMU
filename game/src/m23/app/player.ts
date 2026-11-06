/** Rust crates/app/src/screens/player.rs: rating text fallback and career
 * rows ordered newest-first with total last; panel layout not ported. */
export interface PlayerCareerSeason {season:number;clubId:string;games:number;goals:number;assists:number;}
export function playerCareerRows(records:readonly PlayerCareerSeason[]):PlayerCareerSeason[]{return [...records].reverse();}
export function playerRatingText(value:number|undefined,format:(n:number)=>string):string{return value===undefined?'—':format(value);}
