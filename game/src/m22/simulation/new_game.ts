/** M22 partial port simulation/src/new_game.rs::tournament_cycles and level sorting.
 * Inputs year and club descriptors; output tournament schedule/ordered clubs.
 * 4-year periodicity carried from Rust, no arena construction in this subset. */
export interface TournamentCycles22{world_cup_season:number;euro_season:number;copa_america_season:number;finalissima_season:number;africa_cup_season:number;asian_cup_season:number;oceania_cup_season:number;gold_cup_season:number;nations_league_m_season:number;nations_league_n_season:number}
export function tournamentCycles22(year:number,base:TournamentCycles22):TournamentCycles22 {
 if(!Number.isInteger(year))throw Error('Invalid start year');
 if(((year%4)+4)%4!==3)return {...base};
 return {...base,world_cup_season:4,euro_season:2,copa_america_season:2,finalissima_season:3,
 africa_cup_season:1,asian_cup_season:1,oceania_cup_season:3,gold_cup_season:1,nations_league_m_season:1,nations_league_n_season:1};
}
export interface ClubLevel22{id:string;level:number;reputation:number;tiebreakNumber:number;name:string}
export function clubsByLevel22(clubs:readonly ClubLevel22[],reputation=false):ClubLevel22[]{
 return [...clubs].sort((a,b)=>b.level-a.level||(reputation?b.reputation-a.reputation:0)||b.tiebreakNumber-a.tiebreakNumber);
}
/** Java String.compareTo is UTF-16 code-unit order (not localeCompare). */
export function javaCompareClubName22(a:string,b:string):number {
 for(let i=0;i<Math.min(a.length,b.length);i++)if(a.charCodeAt(i)!==b.charCodeAt(i))return a.charCodeAt(i)-b.charCodeAt(i);
 return a.length-b.length;
}
