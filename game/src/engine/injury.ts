/**
 * Port funcional: crates/engine/src/injury.rs.
 * Os três primeiros draws têm a mesma ordem do Rust; o quarto draw de mensagem
 * é solicitado só para técnico humano e lesões >=8 dias.
 * Dependências: RNG injetado, estado do jogador, inbox e recordSeasonEvent.
 * Efeitos: strength de veterano, injuredUntil, mensagem, estatística de lesão.
 * A data usa milissegundos (modelo Rust), sem data local presumida.
 */
import {EngineMessage,MessageInbox,sendEngineMessage} from './messages';
import {PlayerStats,EVENT_KIND,recordSeasonEvent} from './events';
export interface InjurablePlayer {
 id:string;name:string;age:number;fitness:number;strength:number;injuredUntil:number;
 humanCoachInbox?:MessageInbox;stats:PlayerStats;
}
export interface InjuryRandom {freshInt(bound:number):number;}
export interface InjuryResult {days:number;injuredUntil:number;message?:EngineMessage;strength:number;}
function draw(rng:InjuryRandom,bound:number):number{
 const v=rng.freshInt(bound);
 if(!Number.isInteger(v)||v<0||v>=bound)throw new RangeError('Invalid injury RNG');
 return v;
}
/** `F.p`: determina duração por idade, condicionamento e azar raro. */
export function injurePlayer(p:InjurablePlayer,clubId:string,season:number,today:number,rng:InjuryRandom):InjuryResult {
 let days=0;const base=draw(rng,14),long=5+draw(rng,20);
 if(p.fitness<10)days+=5;else if(p.fitness<50)days++;
 if(p.age<=20)days=base;
 else if(p.age<=25)days+=base+1;
 else if(p.age<=30)days+=base+2;
 else if(p.age<=35)days+=base+3;
 else if(p.age<=45)days+=base+long;
 else days+=base+10+long;
 if(p.age>=35)p.strength=Math.max(1,p.strength-5);
 const luck=draw(rng,100);if(luck===1)days+=70;else if(luck<4)days+=40;else if(luck<10)days+=20;
 let message:EngineMessage|undefined;
 if(p.humanCoachInbox&&days>=8){
  const [from,span]=days<15?[23,3]:days<22?[26,2]:days<29?[28,2]:days<43?[30,4]:days<55?[34,2]:days<70?[36,4]:[40,4];
  message=sendEngineMessage(p.humanCoachInbox,today,3,from+draw(rng,span),p.name,'');
 }
 if(days>0)p.injuredUntil=today+days*86_400_000;
 recordSeasonEvent(p.stats,season,clubId,EVENT_KIND.INJURY,0);
 return {days,injuredUntil:p.injuredUntil,strength:p.strength,message};
}
