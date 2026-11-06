/** Fonte: systems/src/market.rs. Peso de força, médias dos titulares e compradores IA.
 * A avaliação verdadeira é fornecida por `bestValue` do motor Rust; sem transações. */
export const MARKET_STARTERS22=[1,2,2,3,3] as const;
export function marketScale22(points:number,individualSkills:boolean):number{return individualSkills?Math.floor(points*.66+.5):points;}
export function marketStartersAverage22(values:readonly number[],position:number):number{
 const n=MARKET_STARTERS22[position];if(!n)throw RangeError('Invalid position');
 const sorted=[...values].sort((a,b)=>b-a);return Array.from({length:n},(_,i)=>sorted[i]??0).reduce((a,b)=>a+b,0)/n;
}
export function marketBuyers22(clubs:readonly {id:string;fortune:number;human:boolean;nationalTeam:boolean;transferBan:boolean;satellitePolicy?:string}[]):string[]{
 return clubs.filter(c=>!c.human&&!c.nationalTeam&&!c.transferBan&&c.satellitePolicy!=='Profit'&&c.fortune>=(c.satellitePolicy==='Promotion'?25000000:60000000))
 .sort((a,b)=>b.fortune-a.fortune).map(x=>x.id);
}
