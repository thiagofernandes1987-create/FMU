/** M21 — crates/systems/src/tactics.rs: preparo da próxima tática automática.
 * Dependências: `likelyEleven`, `measure`, `advise`, `setTactic` injetadas da engine.
 * Efeito: grava tática e memo somente uma vez por rival/dia. */
export interface TacticsMatch{home:number;away:number;played:boolean;date:number;}
export interface TacticsClub{id:number;human:boolean;}
export interface PreparedTactic{rival:number;day:number;applied:readonly [number,number,number];predicted:number;}
export interface TacticsWorld {day:number;days:readonly (readonly TacticsMatch[])[];clubs:Readonly<Record<number,TacticsClub>>;}
export interface TacticalServices<T>{likelyEleven(club:number):readonly number[];measure(home:number,away:number,homeEleven:readonly number[],awayEleven:readonly number[]):T;advise(measured:T,side:0|1,analyst:number,seed:number):{best:readonly [number,number,number];predictedRival?:readonly [number,number,number]};setTactic(club:number,tactic:readonly [number,number,number]):void;}
/** `Taticas.automatica`: configuração e assistente com nível >=3. */
export function automaticTactics(auto:boolean,assistantLevel:number):boolean{return auto&&assistantLevel>=3;}
export function nextTacticalMatch(world:TacticsWorld,club:number):{rival:number;home:boolean;date:number}|undefined{
 for(const day of world.days.slice(Math.max(0,world.day)))for(const m of day){
  if(!m.played&&(m.home===club||m.away===club))return {rival:m.home===club?m.away:m.home,home:m.home===club,date:m.date};
 }
 return undefined;
}
/** `Taticas.semente`: 31 * rival game ID + dia Unix; truncamento Rust para zero. */
export function tacticalSeed(id:number,millis:number):number{return 31*id+Math.trunc(millis/86400000);}
export function prepareNextTactic<T>(world:TacticsWorld,me:number,config:{tactics:boolean;autoTactics:boolean;assistantLevel:number;analystLevel:number},
 state:{prepared?:PreparedTactic},services:TacticalServices<T>):PreparedTactic|undefined{
 if(!config.tactics||!automaticTactics(config.autoTactics,config.assistantLevel))return undefined;
 const next=nextTacticalMatch(world,me);if(!next)return undefined;
 const rival=world.clubs[next.rival];if(!rival)throw new Error('Missing rival');
 if(rival.human)return undefined;
 const day=Math.trunc(next.date/86400000);
 if(state.prepared?.rival===rival.id&&state.prepared.day===day)return undefined;
 const a=services.likelyEleven(me),b=services.likelyEleven(next.rival);
 const measured=next.home?services.measure(me,next.rival,a,b):services.measure(next.rival,me,b,a);
 const advice=services.advise(measured,next.home?0:1,config.analystLevel,tacticalSeed(rival.id,next.date));
 services.setTactic(me,advice.best);
 const p:PreparedTactic={rival:rival.id,day,applied:[...advice.best],predicted:advice.predictedRival?.[0]??-1};
 state.prepared=p;return p;
}
