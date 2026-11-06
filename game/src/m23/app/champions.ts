/** Rust crates/app/src/screens/champions.rs: one champion per season newest-first.
 * Winner/scorer/coach presentation remains responsibility of UI. */
export interface TitleEdition {season:number;champion:string;runnerUp?:string;topScorerName?:string;topScorerGoals?:number;championCoach?:string;}
export function championEditions(titles:readonly TitleEdition[]):TitleEdition[]{
 const out:TitleEdition[]=[];let last=-1;
 for(let i=titles.length-1;i>=0;i--){const t=titles[i]!;if(t.season!==last){out.push(t);last=t.season;}}
 return out;
}
export function championSeasonYear(startYear:number,season:number):number{return startYear-1+season;}
