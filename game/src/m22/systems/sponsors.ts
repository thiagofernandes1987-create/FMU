/** Fonte: systems/src/sponsors.rs. Patrocínio máster, multas e cotas anuais.
 * Entradas: salários/reputação/peso da liga/torcida; sem lançamentos de caixa. */
export function masterSponsorBase22(yearlyWages:number,reputation:number,leagueWeight:number,fanConfidence:number):number{
 return yearlyWages*(0.15+0.05*Math.max(1,reputation))*(leagueWeight/1.5)*(0.7+0.6*fanConfidence/100);
}
/** `early_end_fine`: 25% do valor anual × anos restantes, arredondado no padrão Java. */
export function sponsorEarlyFine22(yearly:number,years:number):number{return Math.floor(yearly*years*.25+.5);}
/** `slots_yearly`: soma contratos ativos; não inclui propostas pendentes. */
export function sponsorSlotsYearly22(deals:readonly {yearly:number}[]):number{return deals.reduce((s,d)=>s+d.yearly,0);}
