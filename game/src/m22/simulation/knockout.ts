/** Fonte: simulation/src/knockout.rs. Determinação de ida/volta e fechamento da fase.
 * Adaptador do estado da chave, sem conceder prêmios nem despachar partidas. */
export interface KnockoutState22 {round:number;lastRound:number;leg:number;twoLeggedRounds:readonly boolean[];phaseCode:number;}
export type KnockoutTransition22={type:'second-leg';nextLeg:2}|{type:'next-round';nextRound:number}|{type:'finished'};
/** `knockout_round` e `next_knockout_round` distinguem phase_code=2029 e última fase. */
export function knockoutTransition(s:KnockoutState22):KnockoutTransition22{
 if(s.leg===1&&s.twoLeggedRounds[s.round])return {type:'second-leg',nextLeg:2};
 if(s.phaseCode===2029||s.round===s.lastRound)return {type:'finished'};
 return {type:'next-round',nextRound:s.round+1};
}
/** `round_prize`: acesso à tabela por deslocamento relativo ao último round. */
export function knockoutPrize(prizes:readonly number[],round:number,lastRound:number):number{return prizes[round+prizes.length-1-lastRound]??0;}
