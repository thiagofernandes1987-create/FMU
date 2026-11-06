/** Contratos explícitos de domínio que não dependem de arena Rust, HTML ou conta privada. */
export type ClubId=string;
export type CompetitionId=string;
export type PlayerId=string;
export type CoachId=string;
export interface Rng {shuffle<T>(values:T[]):void;}
export interface NumericClub {id:ClubId;level:number;reputation:number;country:number;tiebreakNumber?:number;}
export interface ClubResolver {getClub(id:ClubId):NumericClub;}
/** Converte comparadores Rust `sort_by` sem invertê-los acidentalmente. */
export function byLevelReputation(a:NumericClub,b:NumericClub):number {
  return b.level-a.level||b.reputation-a.reputation||(b.tiebreakNumber??0)-(a.tiebreakNumber??0);
}
export function assertInteger(value:number,label:string,min=-2147483648,max=2147483647):void {
 if(!Number.isInteger(value)||value<min||value>max)throw new RangeError(`${label}: integer outside accepted range`);
}
export function unique<T>(x:readonly T[]):boolean{return new Set(x).size===x.length;}
