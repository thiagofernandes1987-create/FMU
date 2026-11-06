/** Rust crates/app/src/screens/calendar.rs: a club's matches in calendar order,
 * opponent, venue and scores in local human perspective. */
import {MatchRow} from './types';
export interface CalendarRow {matchId:string;day:number;home:boolean;opponentId:string;played:boolean;mine?:number;theirs?:number;result:'win'|'loss'|'draw'|'pending';}
export function calendarRows(clubId:string,matches:readonly MatchRow[]):CalendarRow[]{return matches.filter(m=>m.home===clubId||m.away===clubId).map(m=>{
 const home=m.home===clubId,mine=home?m.homeGoals:m.awayGoals,theirs=home?m.awayGoals:m.homeGoals;
 return {matchId:m.id,day:m.date,home,opponentId:home?m.away:m.home,played:!!m.played,mine,theirs,
 result:!m.played||mine===undefined||theirs===undefined?'pending':mine>theirs?'win':mine<theirs?'loss':'draw'};
});}
