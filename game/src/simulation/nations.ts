/** Port do arquivo crates/simulation/src/nations.rs (3 rotas de mata-mata de seleções).
 * Dependências: RNG e criação de fases pelo World; NÃO equivale ao jogo completo.
 */
import {ClubId,CompetitionId,ClubResolver,Rng} from '../types';
export const WORLD_CUP_BRACKET=[0,3,4,7,8,11,12,15,2,1,6,5,10,9,14,13] as const;
export interface NationGroup {clubs:ClubId[];}
export interface NationStage {groups:NationGroup[];knockoutId?:string;}
export interface NationCompetition {id:CompetitionId;kind:number;valueAgy?:number;playoffRound?:string;knockoutAgx?:string;}
export interface NationStageOps {newKnockoutStage(competition:CompetitionId,clubs:readonly ClubId[],mode:'finals'|'relegation'|'worldcup',kind:number):string;
 newKnockoutRound(stageId:string,clubs:readonly ClubId[],phase:number,twoLegged:boolean,kind:number):void;}
export class NationCompetitionsPort {
 constructor(readonly clubs:ClubResolver,readonly rng:Rng,readonly ops:NationStageOps){}
 /** Rust yt() da League A: campeões dos 4 grupos, sede no país do primeiro sorteado. */
 finals(comp:NationCompetition,leagueA:NationStage):string {
  if(leagueA.groups.length<4||leagueA.groups.slice(0,4).some(g=>!g.clubs[0]))throw Error('Missing League A winner');
  const winners=leagueA.groups.slice(0,4).map(g=>g.clubs[0]!);this.rng.shuffle(winners);
  const country=this.clubs.getClub(winners[0]!).country;
  const id=this.ops.newKnockoutStage(comp.id,winners,'finals',comp.kind);this.ops.newKnockoutRound(id,winners,0,false,comp.kind);
  comp.valueAgy=country;comp.playoffRound=id;return id;
 }
 /** Rust BB(): últimos dos quatro grupos C em playoff de rebaixamento. */
 relegation(comp:NationCompetition,leagueC:NationStage):string {
  if(leagueC.groups.length<4||leagueC.groups.slice(0,4).some(g=>g.clubs.length<4))throw Error('Missing League C fourth place');
  const last=leagueC.groups.slice(0,4).map(g=>g.clubs[3]!);this.rng.shuffle(last);
  const id=this.ops.newKnockoutStage(comp.id,last,'relegation',14006);
  this.ops.newKnockoutRound(id,last,1,true,14006);comp.knockoutAgx=id;return id;
 }
 /** Rust Zw: bracket exato para 8 ou 16 grupos, sem sorteio adicional. */
 worldCup(comp:NationCompetition,groups:NationStage):string {
  const top=groups.groups.flatMap(g=>g.clubs.slice(0,2));let drawn:ClubId[]=[];
  if(top.length===16)drawn=WORLD_CUP_BRACKET.map(i=>top[i]!);
  else if(top.length===32)drawn=[...WORLD_CUP_BRACKET.map(i=>top[i]!),...WORLD_CUP_BRACKET.map(i=>top[i+16]!)];
  const id=this.ops.newKnockoutStage(comp.id,drawn,'worldcup',comp.kind);
  this.ops.newKnockoutRound(id,drawn,0,false,comp.kind);groups.knockoutId=id;return id;
 }
}
