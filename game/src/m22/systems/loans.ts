/** Fonte: systems/src/loans.rs. Localização de empréstimo e métricas da temporada.
 * Taxa 10%, multa dobro da taxa; transferências e confiança dependem do World. */
export function loanOf22(loans:readonly {player?:string}[],id:string):number|undefined{
 const i=loans.findIndex(x=>x.player===id);return i>=0?i:undefined;
}
export function loanSeasonNumbers22(stats:readonly {season:number;games:number;goals:number;ratingSum:number;ratedGames:number}[],season:number):readonly [number,number,number]{
 const all=stats.filter(s=>s.season===season);const games=all.reduce((a,b)=>a+b.games,0),goals=all.reduce((a,b)=>a+b.goals,0);
 const rated=all.reduce((a,b)=>a+b.ratedGames,0),sum=all.reduce((a,b)=>a+b.ratingSum,0);
 return [games,goals,rated>0?sum/rated:0];
}
export function loanFee22(marketValue:number,satelliteNetwork:boolean):number{return satelliteNetwork?0:Math.floor(marketValue*.1+.5);}
export function loanAgainstOwnerFine22(fee:number):number{return fee*2;}
