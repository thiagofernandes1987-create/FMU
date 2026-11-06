/**
 * Port funcional: crates/systems/src/investor.rs — aquisição e aportes de investidor.
 * Fonte: investidor do Brasfoot Next, gatilho anual de 15%, fevereiro–novembro,
 * aporte anual e avaliação da diretoria com duas temporadas ruins consecutivas.
 * Dependências: dinheiro, relógio, RNG e eventos injetados para evitar efeitos ocultos.
 * `investorTick` modifica InvestorState, enquanto pagamentos ocorrem por callbacks.
 * Limite: não implementa `Economia::sell_human_club` nem tela — exige adaptadores.
 */
import {ModConfig} from './config';
export const INVESTOR_CHANCE=15, INVESTOR_MILLION=1_000_000;
export interface InvestorOffer {day:number;investor:string;now:number;yearly:number;}
export interface InvestorState {
 club?:string;complaints:number;yearPaid:number;yearDrawn:number;yearJudged:number;
 offer?:InvestorOffer;shown?:InvestorOffer;loaded:boolean;testRequest:boolean;
}
export interface OwnerClub {id:string;reputation:number;hasOwner:boolean;ownerFunding:number;ownerSince:number;}
export interface InvestorRandom {nextIntBounded(bound:number):number;nextDouble():number;}
export interface InvestorContext {
 state:InvestorState;club?:OwnerClub;now:number;year:number;saveName?:string;
 config:ModConfig;rng:InvestorRandom;newOwnerName:()=>string;
 sellClub:(club:OwnerClub,ownerName:string,now:number,yearly:number)=>void;
 income:(club:OwnerClub,amount:number,kind:9)=>void;
 fanEvent:(change:number,kind:'NewOwner'|'OwnerGaveUp',name?:string)=>void;
 ownerLeaves:(club:OwnerClub)=>void;
}
const javaRound=(v:number)=>Math.floor(v+.5);
const utcDate=(time:number):number=>{const d=new Date(time);return d.getUTCFullYear()*10000+(d.getUTCMonth()+1)*100+d.getUTCDate();};
export function emptyInvestorState():InvestorState{return {complaints:0,yearPaid:0,yearDrawn:0,yearJudged:0,loaded:false,testRequest:false};}
/** `load_investor`: dados existentes nunca são reescritos por padrão. */
export function loadInvestor(ctx:InvestorContext):boolean {
 if(ctx.saveName===undefined||ctx.state.loaded)return false;
 ctx.state.loaded=true;
 const x=ctx.state;return !x.club&&!x.complaints&&!x.yearPaid&&!x.yearDrawn&&!x.yearJudged&&!x.offer&&!x.shown;
}
/** `investor_offer`: fator `.5 + .12*reputation`, sorteios 201 e 81. */
export function investorOffer(ctx:InvestorContext,day:number):InvestorOffer {
 const club=ctx.club;if(!club)throw new Error('No human club for investor');
 const factor=.5+.12*Math.max(0,Math.min(6,club.reputation));
 const investor=ctx.newOwnerName();
 const now=javaRound((100+ctx.rng.nextIntBounded(201))*INVESTOR_MILLION*factor);
 const yearly=javaRound((40+ctx.rng.nextIntBounded(81))*INVESTOR_MILLION*factor);
 return {day,investor,now,yearly};
}
/** `schedule_investor`: escolhe dia inclusivo entre 1 fevereiro e 30 novembro. */
export function scheduleInvestor(ctx:InvestorContext):void {
 const start=Math.max(ctx.now,Date.UTC(ctx.year,1,1)),end=Date.UTC(ctx.year,10,30);
 if(start>end)return;
 const span=Math.trunc((end-start)/86_400_000);
 const additional=Math.trunc(ctx.rng.nextDouble()*(span+1));
 const day=utcDate(start+additional*86_400_000);
 ctx.state.offer=investorOffer(ctx,Math.max(utcDate(ctx.now),day));
}
/** `pay_owner_injection`: primeiro ano não recebe aporte recorrente. */
export function payOwnerInjection(ctx:InvestorContext):boolean {
 const club=ctx.club;if(!club||club.ownerFunding<=0||club.ownerSince>=ctx.year)return false;
 const value=ctx.state.complaints===1?javaRound(club.ownerFunding*.6):club.ownerFunding;
 ctx.income(club,Math.min(2147483647,value),9);return true;
}
/** `investor_tick`: carregamento, aporte, sorteio e abertura de proposta. */
export function investorTick(ctx:InvestorContext):void {
 const club=ctx.club;if(!club||!ctx.config.on('Investor'))return;
 const first=loadInvestor(ctx),state=ctx.state;
 if(state.club!==club.id){state.club=club.id;state.complaints=0;}
 if(first)state.yearPaid=ctx.year;
 if(club.hasOwner&&state.yearPaid<ctx.year){state.yearPaid=ctx.year;payOwnerInjection(ctx);}
 if(state.yearDrawn<ctx.year){
  state.yearDrawn=ctx.year;state.offer=undefined;
  if(!club.hasOwner&&ctx.rng.nextIntBounded(100)<INVESTOR_CHANCE)scheduleInvestor(ctx);
 }
 if(state.testRequest){state.testRequest=false;state.offer=investorOffer(ctx,utcDate(ctx.now));}
 if(state.offer&&utcDate(ctx.now)>=state.offer.day&&!state.shown){
  const offer=state.offer;state.offer=undefined;if(!club.hasOwner)state.shown=offer;
 }
}
export function requestInvestorOffer(ctx:InvestorContext):void {ctx.state.testRequest=true;}
/** `accept_investor`: só move proposta depois de verificar clube sem dono. */
export function acceptInvestor(ctx:InvestorContext):boolean {
 const offer=ctx.state.shown;if(!offer)return false;
 ctx.state.shown=undefined;
 const club=ctx.club;if(!club||club.hasOwner)return false;
 ctx.sellClub(club,offer.investor,offer.now,offer.yearly);
 loadInvestor(ctx);ctx.state.yearPaid=ctx.year;ctx.state.complaints=0;ctx.state.club=club.id;
 ctx.fanEvent(4,'NewOwner',offer.investor);return true;
}
export function refuseInvestor(ctx:InvestorContext):void {ctx.state.shown=undefined;}
export interface InvestorCampaign {position:number;expected:number;title:boolean;}
/** `judge_owner`: retorno true apenas na segunda temporada muito abaixo da meta. */
export function judgeOwner(ctx:InvestorContext,season:number,campaign:InvestorCampaign|undefined):boolean {
 const club=ctx.club;if(!club||!campaign||club.ownerSince>=season||ctx.state.yearJudged>=season)return false;
 ctx.state.yearJudged=season;
 if(campaign.title||campaign.position<=campaign.expected)ctx.state.complaints=0;
 else if(campaign.position>campaign.expected+2){
  ctx.state.complaints++;if(ctx.state.complaints>=2){ctx.state.complaints=0;return true;}
 }
 return false;
}
export function investorSeasonEnd(ctx:InvestorContext,season:number,campaign:InvestorCampaign|undefined):boolean {
 const club=ctx.club;if(!club||!club.hasOwner||!ctx.config.on('Investor'))return false;
 if(judgeOwner(ctx,season,campaign)){ctx.ownerLeaves(club);ctx.fanEvent(-6,'OwnerGaveUp');return true;}
 return false;
}
