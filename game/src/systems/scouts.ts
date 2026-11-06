/**
 * Port funcional: crates/systems/src/scouts.rs — scouting e relatórios.
 * Dependências externas: valor do atleta por posição e função de pagamento.
 * Invariantes: 3 scouts no máximo, 14 dias para concluir, 50k × reputação.
 * RNG: erro por hash Java estável da chave; nenhuma aleatoriedade global.
 * Mutação limitada a ScoutState; callback de cobrança só após preflight.
 * Testes: tests/m20_systems.test.ts.
 */
export const MAX_SCOUTS=3, SCOUT_DURATION_MS=14*86_400_000, SCOUT_MARGIN=5;
export interface ScoutPlayer {
 id:string;key:string;name:string;club?:string;nationalTeam:boolean;
 position:number;age:number;marketValue:number;star:boolean;worldClass:boolean;
}
export interface ScoutObservation {key:string;done:boolean;since:number;}
export interface ScoutState {observations:ScoutObservation[];}
export interface ScoutContext {
 players:readonly ScoutPlayer[];myClub?:string;reputation:number;now:number;state:ScoutState;
 /** A fonte `best_value` da engine; o importador não deve supor `strength`. */
 bestValue:(id:string)=>number;
 modValue:(id:string,slot:number)=>number;
 bestKind:(id:string)=>number;
 payment:(amount:number)=>void;
}
function javaHash(s:string):number {let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(h,31)+s.charCodeAt(i))|0;return h;}
const modulo=(a:number,b:number)=>((a%b)+b)%b;
export function isWatched(ctx:ScoutContext,p:ScoutPlayer):boolean {
 return ctx.state.observations.some(o=>o.key===p.key&&o.done);
}
export function isBeingWatched(ctx:ScoutContext,p:ScoutPlayer):boolean {
 return ctx.state.observations.some(o=>o.key===p.key&&!o.done);
}
export function scoutsPending(ctx:ScoutContext):number{return ctx.state.observations.filter(o=>!o.done).length;}
/** Margem conhecida: 0 para jogador do clube ou observado; 2 para estrelas; 5 demais. */
export function scoutMargin(ctx:ScoutContext,p:ScoutPlayer):number {
 if((p.club!==undefined&&p.club===ctx.myClub)||isWatched(ctx,p))return 0;
 return p.worldClass||p.star?2:SCOUT_MARGIN;
}
export function scoutError(ctx:ScoutContext,p:ScoutPlayer):number {
 const m=scoutMargin(ctx,p);return m===0?0:modulo(javaHash(p.key),2*m+1)-m;
}
export function scoutEstimate(ctx:ScoutContext,p:ScoutPlayer):number {return ctx.bestValue(p.id)+scoutError(ctx,p);}
export function scoutEstimateIn(ctx:ScoutContext,p:ScoutPlayer,slot:number):number {
 return ctx.modValue(p.id,slot)+scoutError(ctx,p);
}
export function scoutRange(ctx:ScoutContext,p:ScoutPlayer,estimate:number):readonly [number,number]{
 const m=scoutMargin(ctx,p);return m===0?[estimate,estimate]:[Math.max(1,estimate-m),Math.min(99,estimate+m)];
}
export function scoutCost(ctx:ScoutContext):number{return 50_000*Math.max(1,ctx.reputation);}
export interface ScoutFinding {player:string;estimate:number;range:readonly [number,number];kind:number;watched:boolean;beingWatched:boolean;}
/** Filtra jogadores pertencentes a clubes, nunca convocações de seleções. Até 300. */
export function searchScouts(ctx:ScoutContext,position:number,maxAge:number,minValue:number,maxPrice:number):ScoutFinding[]{
 const items:ScoutFinding[]=[];
 for(const p of ctx.players){
  if(!p.club||p.nationalTeam||(position>=0&&p.position!==position)||p.age>maxAge||(maxPrice>0&&p.marketValue>maxPrice))continue;
  const estimate=scoutEstimate(ctx,p);if(estimate<minValue)continue;
  items.push({player:p.id,estimate,range:scoutRange(ctx,p,estimate),kind:ctx.bestKind(p.id),watched:isWatched(ctx,p),beingWatched:isBeingWatched(ctx,p)});
 }
 return items.sort((a,b)=>b.estimate-a.estimate).slice(0,300);
}
export type ScoutSendError='NoClub'|'AlreadyKnown'|'AlreadyWatching'|'AllBusy'|'NoCash';
/** Ordem de recusa do Rust; pagamento executado antes de agendar observação. */
export function sendScout(ctx:ScoutContext,playerId:string,clubCash:number):ScoutSendError|undefined {
 if(!ctx.myClub)return 'NoClub';
 const p=ctx.players.find(x=>x.id===playerId);if(!p)throw new Error('Unknown player');
 if(scoutMargin(ctx,p)===0)return 'AlreadyKnown';
 if(isBeingWatched(ctx,p))return 'AlreadyWatching';
 if(scoutsPending(ctx)>=MAX_SCOUTS)return 'AllBusy';
 const cost=scoutCost(ctx);if(clubCash<cost)return 'NoCash';
 ctx.payment(cost);
 const o=ctx.state.observations.find(o=>o.key===p.key);
 if(o){o.done=false;o.since=ctx.now;}
 else ctx.state.observations.push({key:p.key,since:ctx.now,done:false});
 return undefined;
}
/** Completa observações no dia 14; retorna número de relatórios, sem postar notícias. */
export function scoutsTick(ctx:ScoutContext,calendarHasDays:boolean):number {
 if(!calendarHasDays)return 0;
 let done=0;for(const o of ctx.state.observations){
  if(!o.done&&ctx.now-o.since>=SCOUT_DURATION_MS){o.done=true;done++;}
 }
 return done;
}
export function reportScoutSlot(ctx:ScoutContext,p:ScoutPlayer,typicalSlots:readonly number[]):number{
 const slot=typicalSlots[ctx.bestKind(p.id)];if(slot===undefined)throw new RangeError('Invalid scout kind');return slot;
}
