/** M22 integration boundary (not a Rust source-file parity claim).
 * Connects independent model, simulation and engine ports into a deterministic pre-match check.
 * Does not replace a full season or native save-game; no side effects on input models. */
import {eligibleForLineup22,LineupAthlete22,sortLineupStrength22} from './engine/lineup';
import {humanWaiting22,DayMatch22,HumanReady22,advanceGameAction22} from './simulation/game';
import {pickWeighted22} from './engine/engine';
import {KryoParseError} from './persistence/kryo_mod';
export interface PreMatchDecision22 {next:'NEW_SEASON'|'WAIT_HUMAN'|'PLAY_MATCH_DAY';eligibleAthleteIds:string[];drawnCandidate?:string}
export function preparePreMatch22(clubs:Readonly<Record<string,HumanReady22>>,matches:readonly DayMatch22[],athletes:readonly LineupAthlete22[],today:number,seasonOver:boolean,random:()=>number):PreMatchDecision22 {
 const waiting=humanWaiting22(matches,clubs);
 const next=advanceGameAction22(seasonOver,waiting);
 const eligible=sortLineupStrength22(athletes.filter(p=>eligibleForLineup22(p,today,true)));
 const idx=eligible.length?pickWeighted22(eligible.map(()=>1),eligible.map(p=>Math.max(p.strength,0)),random):-1;
 return {next,eligibleAthleteIds:eligible.map(x=>x.id),drawnCandidate:idx>=0&&idx<eligible.length?eligible[idx]!.id:undefined};
}
export function validateKryoSubarray22(bytes:Uint8Array,offset:number,length:number):Uint8Array {
 if(offset<0||length<0||offset+length>bytes.length)throw new KryoParseError(offset,'out of bounds');
 return bytes.subarray(offset,offset+length);
}
