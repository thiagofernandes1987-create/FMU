/**
 * Port das funções de ranking de crates/systems/src/awards/coaches.rs.
 * Dependências explícitas: tabela ordenada, força do elenco e pontos de títulos.
 * Entrada: rankings e técnicos do World; retorno: campanhas e classificação ordenada.
 * Efeito: puro; NÃO altera equipe nem reputação antes de season_end.
 */
import {ClubId,CoachId} from '../types';
export interface AwardClub {id:ClubId;strengths:number[];nationalTeam:boolean;}
export interface CoachRecord {id:CoachId;clubId?:ClubId;human:boolean;}
export interface LeagueRecord {id:string;label:string;division:number;table:ClubId[];}
export interface CoachCampaign {club:ClubId;league:string;division:number;position:number;expected:number;clubs:number;}
export interface TitleRecord {id:string;kind:string;points:number;}
export interface CoachCandidate {coach:CoachId;club:ClubId;campaign?:CoachCampaign;titles:TitleRecord[];points:number;}
export interface CoachRankingContext {current:boolean;clubs:Record<ClubId,AwardClub>;coaches:CoachRecord[];
 league:LeagueRecord[]; weights:Record<ClubId,number>;
 titles:(club:ClubId)=>TitleRecord[];titlePoints:(club:ClubId)=>number;}
/** `squad_strength`: média dos 16 maiores ratings, com elenco vazio igual a zero. */
export function squadStrength(club:AwardClub):number {
 const values=[...club.strengths].sort((a,b)=>b-a).slice(0,16);
 return values.length?values.reduce((a,b)=>a+b,0)/values.length:0;
}
/** `campanhas`: esperado pela força, efetivo pela ordem da tabela, da 1ª divisão em diante. */
export function coachCampaigns(ctx:CoachRankingContext):Record<string,CoachCampaign> {
 const result:Record<string,CoachCampaign>={};
 for(const league of ctx.league){if(!league.table.length)continue;
  const strengths=Object.fromEntries(league.table.map(id=>{const c=ctx.clubs[id];if(!c)throw Error('Unknown club '+id);return [id,squadStrength(c)];}));
  const strengthOrder=[...league.table].sort((a,b)=>strengths[b]!-strengths[a]!);
  league.table.forEach((club,i)=>result[club]={club,league:league.label,division:league.division,
   position:i+1,expected:strengthOrder.indexOf(club)+1,clubs:league.table.length});
 }return result;
}
/** `ranking`: fórmula fonte Rust, temporadas históricas retornam lista vazia. */
export function rankCoaches(ctx:CoachRankingContext):CoachCandidate[] {
 if(!ctx.current)return [];
 const campaigns=coachCampaigns(ctx);const result:CoachCandidate[]=[];
 for(const coach of ctx.coaches){if(!coach.clubId)continue;const club=ctx.clubs[coach.clubId];
  if(!club)throw Error('Unknown coach club');if(club.nationalTeam)continue;
  const camp=campaigns[coach.clubId],weight=ctx.weights[coach.clubId]??1;
  let points=ctx.titlePoints(coach.clubId);
  if(camp){const factor=camp.division===1?1:0.5;
   points+=Math.min(10,Math.max(0,camp.expected-camp.position))*1.2*weight*factor;
   points+=(camp.clubs-camp.position+1)/camp.clubs*5*weight*factor;
  }
  result.push({coach:coach.id,club:coach.clubId,campaign:camp,titles:ctx.titles(coach.clubId),points});
 }return result.sort((a,b)=>b.points-a.points);
}
