/**
 * Port de crates/simulation/src/cup.rs, Brasil: fases 2129–2629.
 * Entradas: dados canônicos dos campeonatos, clubes, RNG injetado.
 * Efeitos: escreve vencedores ordenados/sorteados e nova rodada; sem lançamentos.
 * Dependências: lookup de clubes; o agendamento das partidas pertence à engine.
 */
import {ClubId,ClubResolver,Rng,byLevelReputation,unique} from '../types';
export interface CupRound {clubs:ClubId[];winners:ClubId[];phase:number;twoLegged:boolean;formatCode:number;}
export interface CupState {rounds:CupRound[];skippedClubs:ClubId[];round:number;leg:number;}
export class NationalCupPort {
 constructor(readonly state:CupState,readonly clubs:ClubResolver,readonly rng:Rng){}
 private winners(previous:number):ClubId[]{const r=this.state.rounds[previous];if(!r||previous<0)throw Error('Invalid cup round');return r.winners;}
 private append(ids:ClubId[],phase:number,twoLegged:boolean,formatCode:number):CupRound {
  if(!unique(ids))throw Error('Duplicate team in cup round');
  const r={clubs:[...ids],winners:[],phase,twoLegged,formatCode};
  this.state.rounds.push(r);this.state.round++;this.state.leg=1;return r;
 }
 /** Rust cup_next_phase: dispatch de códigos. */
 nextPhase(format:number,previous:number):CupRound|undefined {
  switch(format){case 2129:return this.second(previous);case 2229:return this.round32(previous);
   case 2329:return this.draw(previous,3,2429);case 2429:return this.draw(previous,4,2529);
   case 2529:return this.draw(previous,5,2629);case 2629:return this.draw(previous,6,2729);default:return undefined;}
 }
 /** Cup second round: 40 vencedores, 20 fortes contra 20 fracos, fracos primeiro. */
 second(previous:number):CupRound {
  const old=this.winners(previous);if(old.length<40)throw Error('Cup phase needs 40 winners');
  const sorted=[...old].sort((a,b)=>byLevelReputation(this.clubs.getClub(a),this.clubs.getClub(b)));
  const top=sorted.slice(0,20),bottom=sorted.slice(20,40);this.rng.shuffle(top);this.rng.shuffle(bottom);
  const pairs:ClubId[]=[];for(let i=0;i<20;i++)pairs.push(bottom[i]!,top[i]!);
  old.splice(0,old.length,...sorted);return this.append(pairs,1,false,2229);
 }
 /** 20 classificados e 12 que saltaram a fase; jogo de ida e volta. */
 round32(previous:number):CupRound|undefined {
  const participants=[...this.winners(previous),...this.state.skippedClubs];
  if(participants.length!==32)return undefined;
  participants.sort((a,b)=>byLevelReputation(this.clubs.getClub(a),this.clubs.getClub(b)));
  const top=participants.slice(0,16),bottom=participants.slice(16);this.rng.shuffle(top);this.rng.shuffle(bottom);
  const pairs:ClubId[]=[];for(let i=0;i<16;i++)pairs.push(top[i]!,bottom[i]!);
  return this.append(pairs,2,true,2329);
 }
 /** Sorteio aberto entre os vencedores da fase anterior. */
 draw(previous:number,phase:number,formatCode:number):CupRound {
  const winners=this.winners(previous),clubs=[...winners];this.rng.shuffle(clubs);
  winners.splice(0,winners.length,...clubs);return this.append(clubs,phase,true,formatCode);
 }
}
