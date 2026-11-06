/** Tradução de `crates/simulation/src/human/mod.rs` / NoChanges: comportamento sem decisões. */
import {ClubId,CoachId,CompetitionId,PlayerId} from '../types';
export interface HumanDecisions {penaltyTaker?(match:string,club:ClubId):PlayerId|undefined;
 shootoutOrder?(match:string,club:ClubId,players:PlayerId[]):PlayerId[];
 substitutions?(match:string,halfTime:boolean):void;title?(club:ClubId,competition:CompetitionId):void;
 jobOffer?(coach:CoachId,clubs:readonly ClubId[]):ClubId|undefined;
 nationalTeamOffer?(coach:CoachId,clubs:readonly ClubId[]):ClubId|undefined;}
/** Nunca altera a escalação nem aceita propostas; mantém a ordem de pênaltis original. */
export const noChanges:Required<HumanDecisions>={penaltyTaker:()=>undefined,shootoutOrder:(_m,_c,p)=>p,
 substitutions:()=>{},title:()=>{},jobOffer:()=>undefined,nationalTeamOffer:()=>undefined};
export function askHuman<T>(user:HumanDecisions|undefined,fn:(handler:Required<HumanDecisions>)=>T):T {
 return fn({...noChanges,...user});
}
