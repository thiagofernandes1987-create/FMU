/**
 * Port funcional: crates/systems/src/fans.rs — torcida, sócios, ídolos e acontecimentos.
 * Dependências: clube humano, salários, fator patrimonial; chamadas financeiras injetadas.
 * Modifica apenas `FansState` e coach.fanSupport, até 10 motivos com registro diário.
 * `fansTick` compara snapshots de elenco e categoria de base; não infere identidades.
 * Testes: tests/m20_systems.test.ts.
 */
import {ModConfig} from './config';
export const MAX_FAN_REASONS=10;
export type FanEvent=
 |{kind:'AcademyPromotion'|'WorldStarSigned'|'ImpactSigning'|'TopPlayerLeft';player:string}
 |{kind:'IdolSold';player:string;club:string}
 |{kind:'NewOwner';investor:string}
 |{kind:'OwnerGaveUp'};
export interface FanReason {day:number;change:number;why:FanEvent;}
export interface FanState {squad:Record<string,number>;academy:string[];reasons:FanReason[];loaded:boolean;}
export interface FanPlayer {key:string;name:string;strength:number;worldClass:boolean;club?:string;clubName?:string;onLoan:boolean;academyCeiling?:number;}
export interface FanContext {
 coach?:{fanSupport:number};clubId?:string;wages:bigint;membersFactor:number;now:number;
 players:readonly FanPlayer[];squad:readonly string[];academy:readonly string[];idolKeys:ReadonlySet<string>;
 state:FanState;config:ModConfig;
}
const javaRound=(value:number):number=>Math.floor(value+.5);
export function fanConfidence(ctx:FanContext):number{return ctx.coach?.fanSupport??60;}
/** `wages * 0.06 * confidence/50.0`; retorna valor monetário arredondado no fim. */
export function monthlyMembership(ctx:FanContext):bigint {
 if(!ctx.coach||!ctx.clubId)return 0n;
 return BigInt(javaRound(Number(ctx.wages)*.06*fanConfidence(ctx)/50*ctx.membersFactor));
}
export function emptyFansState():FanState{return {squad:{},academy:[],reasons:[],loaded:false};}
/** `fans_change`: clamp 0..100, preserva os 10 motivos mais recentes. */
export function changeFans(ctx:FanContext,change:number,why:FanEvent):void {
 if(!ctx.coach)return;
 ctx.coach.fanSupport=Math.max(0,Math.min(100,ctx.coach.fanSupport+change));
 ctx.state.reasons.push({day:ctx.now,change,why});
 while(ctx.state.reasons.length>MAX_FAN_REASONS)ctx.state.reasons.shift();
}
/** `fans_event`: evento externo ativa sistema e registra humor sem inferir outro efeito. */
export function fanEvent(ctx:FanContext,change:number,why:FanEvent):void {
 if(!ctx.coach||!ctx.config.on('Fans'))return;
 ctx.state.loaded=true;changeFans(ctx,change,why);
}
/** `fans_tick`: entrada e saída de estrelas, ídolos e promessas com snapshots. */
export function fansTick(ctx:FanContext):number {
 if(!ctx.coach||!ctx.clubId||!ctx.config.on('Fans'))return 0;
 const first=!ctx.state.loaded;ctx.state.loaded=true;
 const byKey=new Map(ctx.players.map(p=>[p.key,p]));
 const current:Record<string,number>={};
 for(const key of ctx.squad){const p=byKey.get(key);if(!p)throw new Error('Missing fan squad player: '+key);current[key]=p.strength;}
 const before=ctx.state.squad;
 let events=0;
 if(!first){
  const strengths=Object.values(before).sort((a,b)=>b-a);
  const average=strengths.slice(0,11).reduce((s,v)=>s+v,0)/Math.max(1,Math.min(strengths.length,11));
  const third=strengths.length>=3?strengths[2]!:999;
  for(const key of ctx.squad){
   if(Object.prototype.hasOwnProperty.call(before,key))continue;
   const p=byKey.get(key)!;
   if(ctx.state.academy.includes(key)){
    if((p.academyCeiling??-1)>=75){changeFans(ctx,2,{kind:'AcademyPromotion',player:p.name});events++;}
   }else if(p.worldClass){changeFans(ctx,7,{kind:'WorldStarSigned',player:p.name});events++;}
   else if(p.strength>=average+3){changeFans(ctx,4,{kind:'ImpactSigning',player:p.name});events++;}
  }
  for(const [key,strength] of Object.entries(before)){
   if(Object.hasOwn(current,key))continue;
   const p=byKey.get(key);
   if(!p||!p.club||p.club===ctx.clubId||p.onLoan)continue;
   if(ctx.idolKeys.has(key)){changeFans(ctx,-7,{kind:'IdolSold',player:p.name,club:p.clubName??p.club});events++;}
   else if(strength>=third){changeFans(ctx,-5,{kind:'TopPlayerLeft',player:p.name});events++;}
  }
 }
 ctx.state.squad=current;ctx.state.academy=[...ctx.academy];return events;
}
/** O produtor de renda escolhe rubrica 6, equivalente a `world.club_income(..,6)`. */
export function payFansMonth(ctx:FanContext,pay:(club:string,value:number,kind:6)=>void):void {
 if(!ctx.config.on('Fans')||!ctx.clubId)return;
 const members=monthlyMembership(ctx);pay(ctx.clubId,Number(members>2147483647n?2147483647n:members),6);
}
