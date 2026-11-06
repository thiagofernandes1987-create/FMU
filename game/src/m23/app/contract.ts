/** Rust crates/app/src/screens/contract.rs: contract dialog salary bounds,
 * duration choice and initial salary. Domain offer handling belongs to simulation. */
export const CONTRACT_DURATION_KEYS=['contract-renewal-duration-6-months','contract-renewal-duration-1-year','contract-renewal-duration-2-years','contract-renewal-duration-3-years'] as const;
export const CONTRACT_SALARY_MIN=1n,CONTRACT_SALARY_MAX=100000000n,CONTRACT_SALARY_STEP=1000n;
export interface ContractViewState {playerId:string;duration:number;salary:string;question?:{type:'Refused'|'OverLimit';asked?:number};}
export function newContractView(playerId:string,currentSalary:number):ContractViewState{return {playerId,duration:0,salary:String(currentSalary)};}
export function validContractSalary(text:string):number|undefined{
 if(!/^\d+$/.test(text.trim()))return undefined;const n=BigInt(text.trim());return n>=CONTRACT_SALARY_MIN&&n<=CONTRACT_SALARY_MAX?Number(n):undefined;
}
