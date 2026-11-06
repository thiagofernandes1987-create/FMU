/** Fonte: systems/src/awards/season.rs. Chaves persistentes e ponderação de gols.
 * Dependências: jogador e calendário do World; nenhuma mutação. */
export function seasonPlayerKey22(name:string,country:number,birthYear:number):string{return `${name}|${country}|${birthYear}`;}
export function weightedGoals22(goals:number,leagueWeight:number):number{return goals*leagueWeight;}
export function goldenBoyEligible22(age:number):boolean{return age<=21;}
