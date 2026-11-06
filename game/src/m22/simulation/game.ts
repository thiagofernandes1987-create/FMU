/** M22 partial port simulation/src/game.rs::human_waiting, advance, after_day marks.
 * Inputs a day of matches and human clubs; emits next action with no asynchronous work.
 * Consumers still need full `World` to execute AI lineups, stage rounds and finance. */
export interface DayMatch22{id:string;homeId?:string;awayId?:string;played:boolean}
export interface DayState22{matches:DayMatch22[];done:boolean}
export interface HumanReady22{id:string;human:boolean;lineupSet:boolean}
export function humanWaiting22(matches:readonly DayMatch22[],clubs:Readonly<Record<string,HumanReady22>>):{clubId:string;matchId:string}|undefined {
 for(const m of matches)for(const id of [m.homeId,m.awayId]){
  const c=id?clubs[id]:undefined;if(c?.human&&!c.lineupSet)return {clubId:id!,matchId:m.id};
 }return undefined;
}
export function advanceGameAction22(seasonOver:boolean,waiting?:{clubId:string;matchId:string}):'NEW_SEASON'|'WAIT_HUMAN'|'PLAY_MATCH_DAY' {
 return seasonOver?'NEW_SEASON':waiting?'WAIT_HUMAN':'PLAY_MATCH_DAY';
}
export function markDaysDone22(days:readonly DayState22[],through:number):DayState22[] {
 if(!Number.isInteger(through)||through<0||through>=days.length)throw Error('Invalid day cursor');
 return days.map((d,i)=>({...d,done:i<=through?true:d.done,matches:d.matches.map(m=>({...m}))}));
}
