/**
 * Port funcional: crates/systems/src/cash.rs (Caixa).
 * Contas em BigInt para preservar i64 Rust, sem perda por Number.MAX_SAFE_INTEGER.
 * Dependências: entradas financeiras da carreira e relógio injetado.
 * Efeitos: `cashTick` acrescenta retratos diários/mensais; cálculo de fluxo é puro.
 * Consumidores: telas financeiras, orçamento e evolução de temporada.
 * Testes: tests/m20_systems.test.ts.
 */
export const INCOME_LINES=5, EXPENSE_LINES=6, CASH_LINES=11, OTHER_LINE=4, MAX_DAYS=400;
export type CashValues=readonly bigint[];
export interface CashFinance {
 incomeType5:bigint;incomeTransfers:bigint;incomeType3:bigint;incomeType6:bigint;incomeType9:bigint;
 expenseTransfers:bigint;expenseType7:bigint;expenseSalaries:bigint;expenseType4:bigint;expenseType8:bigint;expenseOther:bigint;
}
export interface CashMonth {month:number;season:number;club:string;cash:bigint;values:CashValues;}
export interface CashFlow {month:number;season:number;partial:boolean;values:bigint[];}
export interface CashBook {months:Map<number,CashMonth>;days:Map<number,bigint>;}
export interface CashClock {fields(time:number):{year:number;month:number;day:number;daysInMonth:number};}
/** Ordem canônica de 5 receitas e 6 despesas. */
export function cashTotals(f:CashFinance):bigint[] {
 return [f.incomeType5,f.incomeTransfers,f.incomeType3,f.incomeType6,f.incomeType9,
         f.expenseTransfers,f.expenseType7,f.expenseSalaries,f.expenseType4,f.expenseType8,f.expenseOther];
}
/** Converte relógio para AAAAMMDD, seguindo o mês zero-based do Clock Rust. */
export function cashDate(clock:CashClock,time:number):number {
 const v=clock.fields(time);return v.year*10000+(v.month+1)*100+v.day;
}
/** `cash_book.months` é BTreeMap: iteração cronológica, não ordem de inserção. */
export function cashFlows(book:CashBook,club:string):CashFlow[] {
 const out:CashFlow[]=[];let before:CashMonth|undefined;
 for(const [,now] of [...book.months].sort(([a],[b])=>a-b)){
  if(now.club!==club){before=undefined;continue;}
  if(now.values.length!==CASH_LINES)throw new Error('Invalid CashMonth values count');
  const partial=before===undefined;
  const vals=now.values.map((value,i)=>!before ? (i===OTHER_LINE?0n:value) :
    (before.season===now.season||i===OTHER_LINE ? value-(before.values[i]??0n):value));
  out.push({month:now.month,season:now.season,partial,values:vals});before=now;
 }
 return out;
}
/** Fluxo de 1 mês: despesas incluem as linhas 5–10, mesmo para mensalidade parcial. */
export function flowIncome(flow:CashFlow):bigint{return flow.values.slice(0,INCOME_LINES).reduce((s,v)=>s+v,0n);}
export function flowExpenses(flow:CashFlow):bigint{return flow.values.slice(INCOME_LINES).reduce((s,v)=>s+v,0n);}
export function seasonTotals(book:CashBook,club:string,season:number,currentSeason:number,currentFinance:CashFinance):bigint[]{
 const list=cashFlows(book,club);
 if(season===currentSeason){
  const vals=cashTotals(currentFinance);vals[OTHER_LINE]=list.filter(f=>f.season===season).reduce((s,f)=>s+(f.values[OTHER_LINE]??0n),0n);return vals;
 }
 const out=Array<bigint>(CASH_LINES).fill(0n);
 for(const f of list.filter(x=>x.season===season))for(let i=0;i<CASH_LINES;i++)out[i]=(out[i]??0n)+(f.values[i]??0n);
 return out;
}
export function hasCashSeason(book:CashBook,club:string,season:number):boolean {
 return cashFlows(book,club).some(f=>f.season===season);
}
/** Conta fração do mês atual com mínimo de meio mês. */
export function monthsElapsed(clock:CashClock,now:number):number {
 const f=clock.fields(now);return Math.max(.5,f.month+f.day/f.daysInMonth);
}
/** 52 salários semanais / 12 meses. `java_round` positivo equivale a floor(x+0.5). */
export function monthlyWages(wages:bigint,monthlySalary:boolean):bigint {
 if(monthlySalary)return wages;
 const n=Number(wages)*52/12;
 if(!Number.isSafeInteger(Math.floor(n+.5)))throw new RangeError('Monthly wages exceed JS precision');
 return BigInt(Math.floor(n+.5));
}
/** Guarda os últimos 400 dias; month map retém somente o retrato mais recente do mês. */
export function cashTick(book:CashBook,club:string,season:number,finances:CashFinance,cash:bigint,
 clock:CashClock,now:number):void {
 const day=cashDate(clock,now),month=Math.trunc(day/100);
 book.months.set(month,{month,season,club,cash,values:cashTotals(finances)});
 book.days.set(day,cash);
 while(book.days.size>MAX_DAYS){
  const oldest=[...book.days.keys()].sort((a,b)=>a-b)[0];if(oldest===undefined)break;book.days.delete(oldest);
 }
}
export function emptyCashBook():CashBook{return {months:new Map(),days:new Map()};}
