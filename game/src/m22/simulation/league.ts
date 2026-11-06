/** Fonte: simulation/src/league.rs. Posição, vagas de rebaixamento e mercado do meio do ano.
 * Dados da tabela vêm do consumidor; não cria competições nem altera World. */
export interface LeagueStage22 {clubs:readonly string[];knockout:boolean;division:number;round:number;groupCount:number;}
export function leaguePosition(s:LeagueStage22,club:string):number{return s.knockout?-1:(s.clubs.indexOf(club)<0?-1:s.clubs.indexOf(club)+1);}
/** `mid_season_round`: em grupos calcula rodadas por grupo. */
export function midSeasonRound(s:LeagueStage22):number{const n=s.clubs.length,rounds=s.groupCount===0?(n-1)*2:Math.trunc(n/s.groupCount)*2-1;return s.round>Math.trunc(rounds/2)?Math.trunc(s.round/2):0;}
/** `relegated_places`: índice 1-based da divisão e 0 quando não existe. */
export function leagueRelegationPlaces(s:LeagueStage22,divisions:readonly number[]):number{return divisions[Math.max(0,s.division-1)]??0;}
