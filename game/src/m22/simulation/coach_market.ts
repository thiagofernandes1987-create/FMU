/** Fonte: simulation/src/coach_market.rs::unemployed_coach. Filtro de faixa reputacional.
 * Somente candidatos disponíveis; ordenação/sorteio realizados por callback de RNG externo. */
export interface CoachMarketCandidate22{id:string;country:number;previousCountry:number;reputation:number;human:boolean;club?:string;}
export function unemployedCoaches22(coaches:readonly CoachMarketCandidate22[],country:number,reputation:number,tier:-1|0|1|2):CoachMarketCandidate22[]{
 const [min,max]=tier===-1?[0,5]:tier===0?[reputation,reputation]:tier===1?[reputation-1,reputation]:[reputation-2,reputation+1];
 return coaches.filter(c=>!c.human&&!c.club&&(c.country===country||c.previousCountry===country)&&c.reputation>=min&&c.reputation<=max);
}
