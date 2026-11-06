/**
 * Port funcional: crates/systems/src/staff.rs.
 * Contratos: três cargos × três candidatos; níveis 1..5; comissão segue técnico.
 * RNG Java injetado para reproduzir sequência; pagamentos não debitam o clube
 * sem callback explícito (a aplicação deve manter transação financeira).
 * Efeitos: contratar/demitir altera `StaffState` após validação; pagamento via hook.
 */
import {ModConfig} from './config';
export const MAX_STAFF_LEVEL=5,STAFF_FIRST_NAMES=30,STAFF_SURNAMES=30,STAFF_PROFILES=6;
export const STAFF_ROLES=['Analyst','Assistant','FitnessCoach'] as const;
export type StaffRole=typeof STAFF_ROLES[number];
export interface StaffMember {role:StaffRole;name:readonly [number,number];level:number;salary:bigint;profile:number;since:number;}
export interface StaffState {candidatesMonth:number;candidates:StaffMember[];hired:StaffMember[];}
export interface StaffRandom {nextIntBounded(max:number):number;nextDouble():number;}
const SALARY=[0,15000,35000,70000,130000,220000] as const;
const javaRound=(n:number)=>Math.floor(n+.5);
export function minimumStaffReputation(level:number):number {return Math.max(0,level-2);}
export function staffWages(state:StaffState):bigint{return state.hired.reduce((sum,x)=>sum+x.salary,0n);}
export function staffLevel(state:StaffState,config:ModConfig,role:StaffRole):number {
 return config.on('Staff') ? (state.hired.find(x=>x.role===role)?.level??0):MAX_STAFF_LEVEL;
}
/** Sorteios por cargo e faixa, exatamente na ordem do código Rust. */
export function drawStaffCandidates(state:StaffState,month:number,reputation:number,rng:StaffRandom):StaffMember[]{
 const scale=.6+.2*Math.max(0,Math.min(6,reputation));const candidates:StaffMember[]=[];
 for(const role of STAFF_ROLES)for(let tier=0;tier<3;tier++){
  const name:[number,number]=[rng.nextIntBounded(30),rng.nextIntBounded(30)];
  const base=tier===0?1:tier===1?2+rng.nextIntBounded(2):3+rng.nextIntBounded(3);
  const better=rng.nextIntBounded(100)<15*Math.max(0,reputation-2);
  const level=Math.min(5,Math.max(1,base+(better?1:0)));
  const salary=BigInt(javaRound(SALARY[level]! *scale*(.85+rng.nextDouble()*.3)/1000)*1000);
  const profile=rng.nextIntBounded(6);
  candidates.push({role,name,level,salary,profile,since:0});
 }
 state.candidatesMonth=month;state.candidates=candidates;return candidates.map(x=>({...x,name:[...x.name] as [number,number]}));
}
export function staffCandidates(state:StaffState,month:number,reputation:number,rng:StaffRandom):StaffMember[]{
 if(!state.candidates.length||month!==state.candidatesMonth)drawStaffCandidates(state,month,reputation,rng);
 return state.candidates.map(x=>({...x,name:[...x.name] as [number,number]}));
}
export type StaffHireResult={ok:true}|{ok:false;reason:'Unavailable'|'Reputation';minimum?:number};
/** Recontratação substitui profissional do mesmo cargo, sem taxa de rescisão. */
export function hireStaff(state:StaffState,candidate:number,clubReputation:number,year:number):StaffHireResult {
 const member=state.candidates[candidate];if(!member)return {ok:false,reason:'Unavailable'};
 const minimum=minimumStaffReputation(member.level);
 if(clubReputation<minimum)return {ok:false,reason:'Reputation',minimum};
 state.candidates.splice(candidate,1);
 state.hired=state.hired.filter(m=>m.role!==member.role);
 state.hired.push({...member,since:year});state.hired.sort((a,b)=>STAFF_ROLES.indexOf(a.role)-STAFF_ROLES.indexOf(b.role));
 return {ok:true};
}
export function fireStaff(state:StaffState,role:StaffRole):void{state.hired=state.hired.filter(m=>m.role!==role);}
/** Chama desembolso real apenas com sistema ligado, clube humano e valores >0. */
export function payStaffMonth(state:StaffState,config:ModConfig,club:string|undefined,pay:(club:string,value:number,kind:0)=>void):void {
 const bill=staffWages(state);
 if(club&&bill>0n&&config.on('Staff'))pay(club,Number(bill>2147483647n?2147483647n:bill),0);
}
export function emptyStaffState():StaffState{return {candidatesMonth:0,candidates:[],hired:[]};}
