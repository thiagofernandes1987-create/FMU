/** M21 — crates/simulation/src/human/finances.rs: dívida de emergência do clube.
 * Efeitos: altera dívida e chama income/payment rubrica -1; sem saldo escondido.
 * Dependência: consumidor fornece operações financeiras explícitas (World). */
export interface EmergencyFinances{division:number;cash:number;bankLoan:number;bankInterest:number;}
export interface EmergencyAccounting {income(amount:number,category:-1):void;payment(amount:number,category:-1):void;}
const LIMITS=[1_000_000,5_000_000,3_000_000,2_000_000,1_500_000];
export function emergencyLimit(division:number):number{return LIMITS[division>=1&&division<=4?division:0]!;}
/** `C.eP`: Rust usa cast f32 antes de truncar i32. */
export function updateEmergencyInterest(fin:EmergencyFinances):void{
 fin.bankInterest=fin.bankLoan>0?Math.trunc(Math.fround(fin.bankLoan*3/100)):0;
}
export function borrowEmergency(fin:EmergencyFinances,accounting:EmergencyAccounting):boolean{
 if(fin.bankLoan>=emergencyLimit(fin.division))return false;
 accounting.income(500000,-1);fin.bankLoan+=500000;fin.cash+=500000;
 updateEmergencyInterest(fin);return true;
}
export function repayEmergency(fin:EmergencyFinances,accounting:EmergencyAccounting):boolean{
 if(fin.bankLoan<=0||fin.cash<500000)return false;
 accounting.payment(500000,-1);fin.bankLoan-=500000;fin.cash-=500000;
 updateEmergencyInterest(fin);return true;
}
