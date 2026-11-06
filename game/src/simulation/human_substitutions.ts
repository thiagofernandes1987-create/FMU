/**
 * Port direto de crates/simulation/src/human/substitutions.rs.
 * 37 posições por time, 25 em campo, reservas 26..36.
 * Requisito externo: humanSubstitution valida regras de engine/limites de trocas.
 */
import {PlayerId,ClubId} from '../types';
export const MATCH_PLACES=37,FIRST_MATCH_BENCH=26;
export interface SubstitutionEvent {done:boolean;kind:'substitution'|'other';club:ClubId;player?:PlayerId;otherPlayer?:PlayerId;}
export interface MatchForGrid {id:string;home:ClubId;away:ClubId;homeHuman:boolean;awayHuman:boolean;
 homeStarters:PlayerId[];awayStarters:PlayerId[];homePlayed:PlayerId[];awayPlayed:PlayerId[];
 homeBench:PlayerId[];awayBench:PlayerId[];homeListFl:PlayerId[];awayListFm:PlayerId[];events:SubstitutionEvent[];}
export interface MatchGrid {gameMatch:string;side:0|1;places:(PlayerId|undefined)[];}
export interface SubstituteOps {getSlot(playerId:PlayerId):number;setSlot(playerId:PlayerId,slot:number):void;
 humanSubstitution(match:string,side:0|1,leaving:PlayerId,coming:PlayerId,half:number,minute:number):boolean;}
/** `cD.dd`: titulares mais substituições confirmadas, preserva ordem. */
export function onPitchNow(g:MatchForGrid,side:0|1):PlayerId[]{
 const club=side===0?g.home:g.away,list=[...(side===0?g.homeStarters:g.awayStarters)];
 for(const e of g.events)if(e.done&&e.kind==='substitution'&&e.club===club){
  if(e.player){const i=list.indexOf(e.player);if(i>=0)list.splice(i,1);}
  if(e.otherPlayer)list.push(e.otherPlayer);
 }return list;
}
/** `cD.oY`: human club → played/bench; IA → starters + substitutions. */
export function matchGrid(g:MatchForGrid,side:0|1,ops:Pick<SubstituteOps,'getSlot'>):MatchGrid {
 const human=g.homeHuman||g.awayHuman;
 const pitch=human?[...(side===0?g.homePlayed:g.awayPlayed)]:onPitchNow(g,side);
 const bench=human?[...(side===0?g.homeBench:g.awayBench)]:[
  ...(side===0?g.homeBench:g.awayBench),...(side===0?g.homeListFl:g.awayListFm)];
 const places:(PlayerId|undefined)[]=Array(MATCH_PLACES).fill(undefined);
 for(const p of pitch){const slot=ops.getSlot(p);if(slot>=1&&slot<=25)places[slot]=p;}
 let next=FIRST_MATCH_BENCH;for(const p of bench)if(next<MATCH_PLACES&&!pitch.includes(p))places[next++]=p;
 return {gameMatch:g.id,side,places};
}
/** `cD.V`: exclui posição 1 (goleiro) do primeiro setor. */
export function formation(grid:MatchGrid):[number,number,number] {
 const row:[number,number,number]=[-1,0,0];
 grid.places.forEach((p,i)=>{if(p!==undefined){if(i<=9)row[0]++;else if(i<=17)row[1]++;else if(i<=25)row[2]++;}});
 return row;
}
/** `cD.H/K`: swap em campo; troca banco/campo somente depois da aprovação da engine. */
export function moveInMatch(grid:MatchGrid,from:number,to:number,half:number,minute:number,halfTime:boolean,ops:SubstituteOps):boolean {
 if(from<=0||to<=0||from>=MATCH_PLACES||to>=MATCH_PLACES)return false;
 const shown=(i:number)=>grid.places[i]!==undefined;
 let swap=false,substitute=false;
 if(from>1&&from<=25&&to<=25)swap=true;
 else if(from===1&&to<25)swap=shown(from)&&shown(to);
 else if(from<=25&&to>25)substitute=shown(from)&&shown(to);
 else if(from>25&&to<=25)substitute=shown(from)&&shown(to);
 if(substitute){
  const pitch=Math.min(from,to),bench=Math.max(from,to),leaving=grid.places[pitch],coming=grid.places[bench];
  if(leaving===undefined||coming===undefined)return false;
  const ok=ops.humanSubstitution(grid.gameMatch,grid.side,leaving,coming,half,halfTime?1:minute);
  if(ok){grid.places[pitch]=coming;grid.places[bench]=undefined;}return ok;
 }
 if(swap){[grid.places[from],grid.places[to]]=[grid.places[to],grid.places[from]];
  for(const i of [from,to]){const p=grid.places[i];if(p!==undefined)ops.setSlot(p,i);}return true;
 }return false;
}
