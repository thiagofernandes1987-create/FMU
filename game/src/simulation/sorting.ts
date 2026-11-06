/** Port de crates/simulation/src/sorting.rs — quatro comparadores puros do motor.
 * Decisões de empate devem preservar ordenação estável, nunca ordenar por ID.
 * Dependências: registros de fase e atributos dos clubes/treinadores da arena.
 */
import {NumericClub} from '../types';
export interface StandingNumbers {points:number;wins:number;goalDifference:number;goalsFor:number;}
export interface CoachCounters {points:number;wins:number;games:number;}
/** `h.K`: pontos, vitórias, saldo de gols e gols feitos (decrescente). */
export function compareStandings(a:StandingNumbers,b:StandingNumbers):number {
 return b.points-a.points||b.wins-a.wins||b.goalDifference-a.goalDifference||b.goalsFor-a.goalsFor;
}
/** `h.D`: nível e número de desempate do clube, ambos decrescentes. */
export function compareByLevel(a:NumericClub,b:NumericClub):number {
 return b.level-a.level||(b.tiebreakNumber??0)-(a.tiebreakNumber??0);
}
/** `best.g`: técnicos por pontos, vitórias e menor número de partidas. */
export function compareCoaches(a:CoachCounters,b:CoachCounters):number {
 return b.points-a.points||b.wins-a.wins||a.games-b.games;
}
/** `h.J`: nível, reputação e desempate (decrescentes), estável em empate total. */
export function compareLevelAndReputation(a:NumericClub,b:NumericClub):number {
 return b.level-a.level||b.reputation-a.reputation||(b.tiebreakNumber??0)-(a.tiebreakNumber??0);
}
