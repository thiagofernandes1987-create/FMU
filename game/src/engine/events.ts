/**
 * Port funcional: crates/engine/src/events.rs.
 * Responsabilidade: estatísticas por competição e temporada de um jogador.
 * Efeito: cria records lazy e aplica cartões, gols, assistências, rating, jogos.
 * Dependências: DTOs com IDs persistentes, não IDs de arena do Rust.
 * Nota: assistências só são contadas com competição e atleta fora da base.
 */
export const EVENT_KIND={GAME:0,GOAL:1,YELLOW:2,SECOND_YELLOW:3,RED:4,INJURY:5,ASSIST:8,RATING:100} as const;
export interface CompetitionStats {
 competitionId?:string;games:number;goals:number;yellowCards:number;redCards:number;assists:number;
 competitionNumber:number;ratingSum:number;ratedGames:number;
}
export interface SeasonStats {
 season:number;clubId:string;games:number;goals:number;yellowCards:number;redCards:number;
 assists:number;injuries:number;ratingSum:number;ratedGames:number;
}
export interface PlayerStats {id:string;youth:boolean;seasonStats:SeasonStats[];competitionStats:CompetitionStats[];}
export function competitionStats(p:PlayerStats,competitionId?:string):CompetitionStats{
 let s=p.competitionStats.find(s=>s.competitionId===competitionId);
 if(!s){s={competitionId,competitionNumber:-1,games:0,goals:0,yellowCards:0,redCards:0,assists:0,ratingSum:0,ratedGames:0};p.competitionStats.push(s);}
 return s;
}
export function seasonStats(p:PlayerStats,season:number,clubId:string):SeasonStats {
 let s=p.seasonStats.find(x=>x.season===season&&x.clubId===clubId);
 if(!s){s={season,clubId,games:0,goals:0,yellowCards:0,redCards:0,assists:0,injuries:0,ratingSum:0,ratedGames:0};p.seasonStats.push(s);}
 return s;
}
/** Inclui jogos e nota média; não altera competição em cartões/lesões. */
export function recordSeasonEvent(p:PlayerStats,season:number,clubId:string,kind:number,value:number,competitionId?:string):void {
 const s=seasonStats(p,season,clubId);
 switch(kind){
  case EVENT_KIND.GAME:s.games++;break;
  case EVENT_KIND.GOAL:s.goals++;break;
  case EVENT_KIND.YELLOW:s.yellowCards++;break;
  case EVENT_KIND.RED:s.redCards++;break;
  case EVENT_KIND.SECOND_YELLOW:s.yellowCards++;s.redCards++;break;
  case EVENT_KIND.INJURY:s.injuries++;break;
  case EVENT_KIND.ASSIST:
   if(competitionId!==undefined&&!p.youth){s.assists++;competitionStats(p,competitionId).assists++;}
   break;
  case EVENT_KIND.RATING:s.ratingSum+=value;s.ratedGames++;break;
 }
}
/** `record_assist`: sem clube, nenhuma mutação. */
export function recordAssist(p:PlayerStats,season:number,clubId:string|undefined,competitionId?:string):void{
 if(clubId!==undefined)recordSeasonEvent(p,season,clubId,EVENT_KIND.ASSIST,0,competitionId);
}
