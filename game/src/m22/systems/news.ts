/** Fonte: systems/src/news.rs::monthly_tick. Relógio de cobranças mensais.
 * Dependências: seis callbacks injetados; há cobranças parciais se callback falhar. */
export interface MonthlyNews22{lastMonth?:number;hasHumanClub:boolean;}
export function monthlyTick22(state:MonthlyNews22,year:number,month0:number,charges:readonly (()=>void)[]):number{
 if(!state.hasHumanClub)return 0;
 const current=year*100+month0+1,last=state.lastMonth;
 if(last===undefined){state.lastMonth=current;return 0;}if(last===current)return 0;
 const monthIndex=(n:number)=>Math.trunc(n/100)*12+n%100-1;
 const count=Math.max(1,Math.min(12,monthIndex(current)-monthIndex(last)));state.lastMonth=current;
 for(let i=0;i<count;i++)for(const charge of charges)charge();return count;
}
