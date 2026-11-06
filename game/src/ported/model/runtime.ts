/** M21 — crates/model/src/runtime.rs: estado transitório de partidas.
 * Nada é salvo em `.bfn`; `resetStats` substitui F.fo e `addGoal` incrementa
 * simultaneamente tentativas e gols conforme o Rust. */
export interface PlayerMatchStats{shots:number;shotsSaved:number;countPf:number;countPg:number;goals:number;ownGoals:number;countPi:number;yellowCards:number;redCards:number;assists:number;countPl:number;}
export function emptyPlayerStats():PlayerMatchStats{return {shots:0,shotsSaved:0,countPf:0,countPg:0,goals:0,ownGoals:0,countPi:0,yellowCards:0,redCards:0,assists:0,countPl:0};}
export function addMatchGoal(stats:PlayerMatchStats):void{stats.goals++;stats.shots++;}
export interface RoundRating{player:number;rating:number;slot:number;tiebreak:number;}
export interface Sacking{coach:number;successor?:number;club:number;reason:number;}
export interface MinutePools{pools:(number[]|undefined)[];}
export interface TransientRuntime{
 youthIntake:number[];matchStats:Map<number,PlayerMatchStats>;matchCards:Map<number,number>;
 callUps:Map<number,number>;minutePools:MinutePools;enginesInPlay:number[];
 roundRatings:Map<number,RoundRating[]>;sackings:Sacking[];venues:Map<number,unknown>;
 countryRankings:Map<number,number[]>;stadiumsBySize?:number[];
 nationalGrounds:Map<number,number[]>;tableStage?:number;traceSeeds:boolean;
}
export function newTransientRuntime():TransientRuntime{return {youthIntake:[],matchStats:new Map(),matchCards:new Map(),callUps:new Map(),
 minutePools:{pools:Array(5).fill(undefined)},enginesInPlay:[],roundRatings:new Map(),sackings:[],venues:new Map(),
 countryRankings:new Map(),nationalGrounds:new Map(),traceSeeds:false};}
/** `Runtime::stats`: lazy, e `reset_stats` antes do jogo. */
export function playerStats(rt:TransientRuntime,playerId:number):PlayerMatchStats{
 let s=rt.matchStats.get(playerId);if(!s){s=emptyPlayerStats();rt.matchStats.set(playerId,s);}return s;
}
export function resetPlayerStats(rt:TransientRuntime,playerId:number):void{rt.matchStats.set(playerId,emptyPlayerStats());}
