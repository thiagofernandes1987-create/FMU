/** M21 — crates/simulation/src/human/contract.rs: negociação e assinatura de jogador.
 * 4 durações, percentuais e i32 wrapping preservados. Requer hojeMillis do clock. */
export const CONTRACT_DURATIONS=[180,365,730,1095] as const;
const CUT=[1,3,5,12],RAISE=[10,12,15,5];
export interface ContractState{marketValue:number;salary:number;price:number;contractUntil:number;}
export type ContractAnswer={type:'Signed'}|{type:'Asks';amount:number}|{type:'OverLimit';amount:number}|{type:'Nothing'};
function validDuration(d:number):void{if(!Number.isInteger(d)||d<0||d>3)throw new RangeError('Invalid duration');}
function javaRound(x:number):number{return Math.floor(x+.5);}
export function salaryLimit(p:ContractState):number{return javaRound(p.marketValue*.25)|0;}
/** `contract_days_left` trunca dias até vencer, teto inferior zero. */
export function leastAccepted(p:ContractState,today:number,d:number):number{
 validDuration(d);const left=Math.max(0,Math.trunc((p.contractUntil-today)/86400000));
 const delta=Math.trunc(Math.imul(p.salary,left<60?CUT[d]!:RAISE[d]!)/100);
 return (left<60?p.salary-delta:p.salary+delta)|0;
}
export function signContract(p:ContractState,salary:number,d:number):void{
 validDuration(d);const until=p.contractUntil+CONTRACT_DURATIONS[d]!*86400000;
 if(!Number.isSafeInteger(until))throw new RangeError('Contract expiration overflow');
 p.price=p.marketValue;p.contractUntil=until;p.salary=salary|0;
}
export function offerContract(p:ContractState,today:number,salary:number,d:number):ContractAnswer{
 validDuration(d);const limit=salaryLimit(p);
 if(salary>0&&salary<limit){const min=leastAccepted(p,today,d);
  if(salary>=min){signContract(p,salary,d);return {type:'Signed'};}
  return {type:'Asks',amount:Math.min(min,limit)};
 }
 return salary>=limit?{type:'OverLimit',amount:limit}:{type:'Nothing'};
}
