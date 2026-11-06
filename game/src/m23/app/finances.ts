/** Rust crates/app/src/screens/finances.rs::wealth/month_name/date_of.
 * Values i64 represented as bigint when large, avoiding JS precision loss. */
export type WealthBand='billionaire'|'very-rich'|'rich'|'stable'|'tight'|'crisis';
export function financesWealth(v:number|bigint):WealthBand{const n=BigInt(v),mi=1000000n;
 return n>=1000n*mi?'billionaire':n>=300n*mi?'very-rich':n>=100n*mi?'rich':n>=30n*mi?'stable':n>=0n?'tight':'crisis';}
export function financesMonthName(month:number):number|undefined{const m=month%100;return m>=1&&m<=12?m:undefined;}
export function financeDateOf(day:number):string{return `${String(day%100).padStart(2,'0')}/${String(Math.trunc(day/100)%100).padStart(2,'0')}/${Math.trunc(day/10000)}`;}
export function signedMoney(value:number|bigint,format:(v:number|bigint)=>string):string{return (BigInt(value)>0n?'+':'')+format(value);}
