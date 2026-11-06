/** Fonte: simulation/src/titles.rs. Competição internacional, classificação do artilheiro.
 * Sem mutação: entradas vêm de dados reais de competição. */
export function nationalTeamsKind22(kind:number):boolean{return [7,9,13,14].includes(kind);}
export function competitionDivision22(kind:'NationalLeague'|'StateChampionship'|'Other',division:number):number{return kind==='Other'?-1:division;}
export interface TopScorer22{id:string;goals:number;games:number;}
export function topScorer22(scorers:readonly TopScorer22[]):TopScorer22|undefined{return [...scorers].sort((a,b)=>b.goals-a.goals||a.games-b.games)[0];}
