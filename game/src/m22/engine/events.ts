/** M22 partial port engine/src/events.rs::record_season/competition_stats.
 * Input per-player stats and event kind, output updated in-memory stats, no World writes.
 * Assists require competition and non-youth athlete, second yellow counts as red. */
export const PLAYER_EVENT22={GAME:0,GOAL:1,YELLOW:2,SECOND_YELLOW:3,RED:4,INJURY:5,ASSIST:8,RATING:100} as const;
export interface SeasonEventStats22{games:number;goals:number;yellow:number;red:number;injuries:number;assists:number;ratingSum:number;ratedGames:number}
export function emptySeasonStats22():SeasonEventStats22{return {games:0,goals:0,yellow:0,red:0,injuries:0,assists:0,ratingSum:0,ratedGames:0};}
export function recordSeasonEvent22(s:SeasonEventStats22,kind:number,competition:boolean,youth:boolean,value=0):void {
 if(kind===0)s.games++;else if(kind===1)s.goals++;else if(kind===2)s.yellow++;
 else if(kind===3){s.yellow++;s.red++;}else if(kind===4)s.red++;else if(kind===5)s.injuries++;
 else if(kind===8&&competition&&!youth)s.assists++;
 else if(kind===100&&Number.isFinite(value)&&value>=2){s.ratedGames++;s.ratingSum+=value;}
}
