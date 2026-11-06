/** Rust crates/app/src/screens/leaders.rs `sorted` and career/season rows.
 * Stable sort: goals/assists descending, games ascending, preserve input order. */
export interface LeaderRow {name:string;clubId?:string;count:number;games:number;}
export const LEADERS_SHOWN=401;
export function topLeaders(rows:readonly LeaderRow[],limit=LEADERS_SHOWN):LeaderRow[]{return [...rows].sort((a,b)=>b.count-a.count||a.games-b.games).slice(0,limit);}
export function careerScorers(active:readonly {name:string;clubId?:string;goals:number;games:number}[],retired:readonly {name:string;goals:number;games:number}[]):LeaderRow[]{
 return topLeaders([...active.filter(x=>x.goals>0).map(x=>({name:x.name,clubId:x.clubId,count:x.goals,games:x.games})),...retired.map(x=>({name:x.name,count:x.goals,games:x.games}))]);
}
export function seasonAssists(rows:readonly {name:string;clubId?:string;country?:number;assists:number;games:number}[],country?:number):LeaderRow[]{
 return topLeaders(rows.filter(x=>x.assists>0&&(country===undefined||x.country===country)).map(x=>({name:x.name,clubId:x.clubId,count:x.assists,games:x.games})));
}
