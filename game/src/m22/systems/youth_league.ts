/** Fonte: systems/src/youth_league.rs. Rodadas e classificação da base.
 * Dependências: jogos do campeonato e registro de atletas; não simula os jogos. */
export interface YouthMatch22{round:number;played:boolean;}
export function youthTotalRounds22(matches:readonly YouthMatch22[]):number{return Math.max(0,...matches.map(m=>m.round));}
export function youthRoundsPlayed22(matches:readonly YouthMatch22[]):number{return Math.max(0,...matches.filter(m=>m.played).map(m=>m.round));}
export function youthGamesPlayed22(stats:readonly {key:string;games:number}[],key:string):number{return stats.find(s=>s.key===key)?.games??0;}
/** `goal_difference`: mesmo desempate da tabela. */
export function youthGoalDifference22(forGoals:number,againstGoals:number):number{return forGoals-againstGoals;}
