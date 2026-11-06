/** Fonte: model/src/clock.rs. Calendário civil UTC de apoio (fuso local Rust é uma dependência externa).
 * Operações puras com milissegundos Unix. O port NÃO substitui Clock do jogo em fusos com DST. */
export function isLeapYear(year:number):boolean{return year%4===0&&(year%100!==0||year%400===0);}
/** `Clock::days_in_month` com mês 0-based Java; Rust lança para mês inválido. */
export function daysInMonth(year:number,month:number):number{
 if(!Number.isInteger(year)||!Number.isInteger(month)||month<0||month>11)throw RangeError('Month 0..11 required');
 return [31,isLeapYear(year)?29:28,31,30,31,30,31,31,30,31,30,31][month]!;
}
/** `Clock::days_of_year` devolve dia 1-based, ano-mês-dia. */
export function daysOfYear(year:number):{ordinal:number;year:number;month:number;day:number}[]{
 const out:ReturnType<typeof daysOfYear>=[];let ordinal=0;
 for(let month=0;month<12;month++)for(let day=1;day<=daysInMonth(year,month);day++)out.push({ordinal:++ordinal,year,month,day});
 return out;
}
/** Preserva horário do instante, ajusta apenas ano/mês/dia; variante UTC do date_at. */
export function dateAtUTC(millis:number,year:number,month:number,day:number):number{
 const d=new Date(millis),x=new Date(0);x.setUTCFullYear(year,month,day);x.setUTCHours(d.getUTCHours(),d.getUTCMinutes(),d.getUTCSeconds(),d.getUTCMilliseconds());
 return x.getTime();
}
