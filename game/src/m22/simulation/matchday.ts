/** Fonte: simulation/src/matchday.rs::pick_ai_lineups e today_matches.
 * Retorna plano de times a alinhar, engine/play/sorteios continuam fora do escopo. */
export interface MatchdayFixture22{id:string;home:string;away:string;date:number;played:boolean;}
export function todayMatches22(matches:readonly MatchdayFixture22[],day:number):MatchdayFixture22[]{return matches.filter(m=>m.date===day&&!m.played);}
export function aiLineupPlan22(matches:readonly MatchdayFixture22[],humanClubs:ReadonlySet<string>,lineupSet:ReadonlySet<string>):{match:string;club:string;side:1|2}[]{
 const out:{match:string;club:string;side:1|2}[]=[];
 for(const m of matches)for(const [club,side] of [[m.home,1],[m.away,2]] as const)if(!humanClubs.has(club)&&!lineupSet.has(club))out.push({match:m.id,club,side});
 return out;
}
