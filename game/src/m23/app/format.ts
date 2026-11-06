/** Rust crates/app/src/format.rs: money/compact_money/date/rating/thousands/decimal.
 * I/O: integers or timestamps -> text keys/numbers; no mutation, no UI;
 * caller supplies translator to preserve original i18n vocabulary. */
export interface FMUTranslator {text(key:string,args?:Record<string,string>):string;}
const DEFAULT:{[key:string]:string}={'money-unit-thousand':'mil','money-unit-million-one':'milhão','money-unit-million':'milhões','money-unit-billion-one':'bilhão','money-unit-billion':'bilhões','thousands-separator':'.','decimal-separator':','};
export const ptTranslator:FMUTranslator={text:(k,args)=>k==='money-amount'?`${args?.number??''} ${args?.unit??''}`:DEFAULT[k]??k};
function unit(t:FMUTranslator,n:string,key:string):string{return t.text('money-amount',{number:n,unit:t.text(key)});}
/** `best.C.c`: monetário extenso; i64 mínimo permanece representável como bigint. */
export function money(t:FMUTranslator,value:bigint|number):string{
 const v=BigInt(value);if(v<0n)return '-'+money(t,-v);
 const s=v.toString();if(v===0n)return unit(t,'0','money-unit-thousand');
 if(v<=999n)return s;
 if(v<=999999n)return unit(t,s.slice(0,-3),'money-unit-thousand');
 if(v>99999999999n)return compactMoney(t,v);
 let size=1,kind='money-unit-million',rest='';
 if(v<=1999999n){size=1;kind='money-unit-million-one';rest=s.slice(1,4);}
 else if(v<=9999999n){size=1;rest=s.slice(1,4);}
 else if(v<=99999999n){size=2;rest=s.slice(2,5);}
 else if(v<=999999999n){size=3;rest=s.slice(3,6);}
 else if(v<=1999999999n){size=1;kind='money-unit-billion-one';rest=s.slice(1,4);}
 else if(v<=9999999999n){size=1;kind='money-unit-billion';rest=s.slice(1,4);}
 else {size=2;kind='money-unit-billion';rest=s.slice(2,5);}
 const tail=rest==='000'?'':rest.startsWith('00')?unit(t,rest.slice(2),'money-unit-thousand'):
   rest.startsWith('0')?unit(t,rest.slice(1),'money-unit-thousand'):
   unit(t,rest,v<=999999999n?'money-unit-thousand':'money-unit-million');
 return `${unit(t,s.slice(0,size),kind)} ${tail}`;
}
/** `best.C.a`: usa recursão por milhar do Rust e nunca lê estado global. */
export function compactMoney(t:FMUTranslator,value:bigint|number):string{
 let v=Number(value),unitIdx=0;
 if(!Number.isFinite(v))throw new RangeError('Invalid money');
 for(let i=0;i<9;i++){
  v=Math.trunc(v/100)/10;const whole=(v*10)%10===0;
  if(v<1000){const n=!(v>99.9)&&!whole&&(whole||!(v>9.99))?String(v):String(Math.trunc(v));return n+t.text(`money-compact-${unitIdx}`);}
  unitIdx++;
 }
 throw new RangeError('Money unit overflow');
}
export function shortDate(t:FMUTranslator,year:number,monthZero:number,day:number):string {return t.text('date-short',{day:String(day).padStart(2,'0'),month:String(monthZero+1).padStart(2,'0'),year:String(year)});}
export function mediumDate(t:FMUTranslator,year:number,monthZero:number,day:number):string{return t.text('date-medium',{day:String(day),month:t.text(`month-short-${monthZero}`),year:String(year)});}
export function isoMediumDate(t:FMUTranslator,s:string):string{const m=/^(\d+)-(\d+)-(\d+)$/.exec(s);if(!m)return s;const y=Number(m[1]),mo=Number(m[2]),d=Number(m[3]);return mo>=1&&mo<=12?mediumDate(t,y,mo-1,d):s;}
export function ratingText(t:FMUTranslator,n:number,places:1|2):string{if(places===2&&n===10)return'10';return n.toFixed(places).replace('.',t.text('decimal-separator'));}
export function thousandsText(t:FMUTranslator,v:bigint|number):string{const s=BigInt(v).toString();const neg=s.startsWith('-');const digits=neg?s.slice(1):s;return(neg?'-':'')+digits.replace(/\B(?=(\d{3})+(?!\d))/g,t.text('thousands-separator'));}
export function decimalText(t:FMUTranslator,v:number,places:number):string{if(!Number.isFinite(v)||places<0||places>12)throw new RangeError('Invalid decimal');const factor=10**places;const rounded=Math.floor(Math.abs(v)*factor+0.5)/factor*Math.sign(v);return rounded.toFixed(places).replace('.',t.text('decimal-separator'));}
