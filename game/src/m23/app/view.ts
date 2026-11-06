/** Rust crates/app/src/view.rs — selectors used by the app, not renderers.
 * World entities and score engines are injected via DTO callbacks. */
import {MatchRow} from './types';
export type StandingRow={clubId:string;numbers:readonly[number,number,number,number,number,number,number,number]};
export function standingGroups(stage:{clubs:string[];groups?:{clubs:string[]}[]},numbers:(id:string)=>StandingRow['numbers']):StandingRow[][]{
 const groups=stage.groups?.length?stage.groups:[{clubs:stage.clubs}];return groups.map(g=>g.clubs.map(clubId=>({clubId,numbers:numbers(clubId)})));
}
/** Rust `stages_of`: main league first, no duplicate stage IDs. */
export function stagesOf(comp:{league?:string;secondLeague?:string;mainStage?:string;knockout?:string;finalStage?:string;playoff?:string;promotionKnockout?:string;relegationPlayoff?:string}):string[]{
 return [...new Set([comp.league,comp.secondLeague,comp.mainStage,comp.knockout,comp.finalStage,comp.playoff,comp.promotionKnockout,comp.relegationPlayoff].filter((x):x is string=>x!==undefined))];
}
export function clubMatchesByCalendar(days:readonly {matchIds:string[]}[],matches:Readonly<Record<string,MatchRow>>,clubId:string):MatchRow[]{
 return days.flatMap(d=>d.matchIds).map(id=>{const m=matches[id];if(!m)throw new Error('Missing calendar match '+id);return m;}).filter(m=>m.home===clubId||m.away===clubId);
}
export function nextClubMatch(days:readonly {matchIds:string[]}[],matches:Readonly<Record<string,MatchRow>>,clubId:string):MatchRow|undefined{return clubMatchesByCalendar(days,matches,clubId).find(m=>!m.played);}
/** `top_scorers`: goals desc, games asc, stable order and explicit count. */
export function viewTopScorers(rows:readonly {playerId?:string;goals:number;games:number}[],limit:number):{playerId:string;goals:number;games:number}[]{
 return rows.filter((x):x is {playerId:string;goals:number;games:number}=>x.playerId!==undefined).sort((a,b)=>b.goals-a.goals||a.games-b.games).slice(0,limit);
}
export function bestAverageRatings(rows:readonly {playerId:string;ratingSum:number;ratedGames:number}[]):{playerId:string;average:number;ratedGames:number}[]{
 const scored=rows.filter(x=>x.ratedGames>0&&x.ratingSum/x.ratedGames>5).map(x=>({playerId:x.playerId,average:x.ratingSum/x.ratedGames,ratedGames:x.ratedGames}));
 scored.sort((a,b)=>b.average-a.average||a.ratedGames-b.ratedGames);
 return scored.length<5?[]:scored.slice(0,5);
}
export function stagePlace(s:{kind:'League'|'Knockout';knockout?:string;groupCount:number;clubs:string[];groups?:{clubs:string[]}[]},clubId:string):number|undefined{
 if(s.kind!=='League'||s.knockout!==undefined)return undefined;
 if(s.groupCount===0){const index=s.clubs.indexOf(clubId);return index<0?undefined:index+1;}
 for(const g of s.groups??[]){const index=g.clubs.indexOf(clubId);if(index>=0)return index+1;}return undefined;
}
export function shownPlace(s:Parameters<typeof stagePlace>[0]&{round:number}|undefined,clubId:string):number|undefined{return s?.kind==='League'&&s.round>1?stagePlace(s,clubId):undefined;}
