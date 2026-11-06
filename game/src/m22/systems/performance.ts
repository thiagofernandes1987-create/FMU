/** Fonte: systems/src/performance.rs::played_matches. Lista de jogos da carreira.
 * Sem motor de análise de desempenho, somente seleção em ordem do calendário. */
export interface PerformanceMatch22{id:string;home?:string;away?:string;played:boolean;}
export function playedMatches22(days:readonly (readonly PerformanceMatch22[])[],currentDay:number,club:string):PerformanceMatch22[]{
 return days.slice(0,Math.max(0,currentDay)+1).flatMap(day=>day).filter(x=>x.played&&(x.home===club||x.away===club));
}
