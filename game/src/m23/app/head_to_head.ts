/** Rust crates/app/src/screens/head_to_head.rs: find pair either direction;
 * list opponents by name; match history is season-local, newest first. */
import {MatchRow} from './types';
export interface H2HRecord {club1:string;club2:string;wins1:number;wins2:number;draws:number;}
export function headToHead(records:readonly H2HRecord[],a:string,b:string):H2HRecord|undefined {
 return records.find(r=>(r.club1===a&&r.club2===b)||(r.club1===b&&r.club2===a));
}
export function headToHeadOpponents(records:readonly H2HRecord[],a:string,names:Readonly<Record<string,string>>):string[]{
 const list=records.flatMap(r=>r.club1===a?[r.club2]:r.club2===a?[r.club1]:[]).filter(id=>names[id]!==undefined);
 return list.sort((a,b)=>(names[a]??'').localeCompare(names[b]??'','pt-BR'));
}
export function seasonRivalMatches(matches:readonly MatchRow[],a:string,b:string,currentSeason:number):MatchRow[]{
 return matches.filter(m=>m.season===currentSeason&&((m.home===a&&m.away===b)||(m.home===b&&m.away===a))).sort((x,y)=>y.date-x.date);
}
