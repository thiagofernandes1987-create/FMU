/** M21 — crates/simulation/src/clubs.rs: histórico de clubes e classificação.
 * Efeitos: adiciona registros de competição/fase, pontos e all-time. */
export interface ClubRecord{competitionRecords:CompetitionRecord[];stageRecords:StageRecord[];allTime:number[][];}
export interface CompetitionRecord{season:number;kind:number;subkind:number;division:number;games:number;wins:number;losses:number;goalsFor:number;goalsAgainst:number;}
export interface StageRecord{stageId:string;points:number;games:number;wins:number;losses:number;goalsFor:number;goalsAgainst:number;}
export interface MatchRecord{home?:string;away?:string;homeGoals:number;awayGoals:number;competition?:string;}
export interface CompetitionRef{id:string;kind:number;subkind:number;division:number;class:'NationalLeague'|'StateChampionship'|'Other';}
export function newClubRecord():ClubRecord{return {competitionRecords:[],stageRecords:[],allTime:Array.from({length:15},()=>[0,0,0])};}
export function stageNumbers(club:ClubRecord,stageId:string):readonly number[]{
 const r=club.stageRecords.find(x=>x.stageId===stageId);
 return r?[r.points,r.games,r.wins,r.games-r.wins-r.losses,r.losses,r.goalsFor,r.goalsAgainst,r.goalsFor-r.goalsAgainst]:Array(8).fill(0);
}
export function ensureCompetitionRecord(club:ClubRecord,c:CompetitionRef,year:number,subkind:number):CompetitionRecord{
 let r=club.competitionRecords.find(x=>x.season===year&&x.kind===c.kind&&x.subkind===subkind);
 if(!r){r={season:year,kind:c.kind,subkind,division:c.class==='Other'?-1:c.division,
  games:0,wins:0,losses:0,goalsFor:0,goalsAgainst:0};club.competitionRecords.push(r);}
 return r;
}
/** `club_match_record`: não registra amistoso sem competição; cobra placar regulamentar. */
export function recordClubGame(club:ClubRecord,clubId:string,m:MatchRecord,c:CompetitionRef|undefined,
 year:number,stage?:{knockout:boolean;phaseCode:number}):void {
 if(!m.competition)return;if(!c||c.id!==m.competition)throw new Error('Missing competition');
 const home=m.home===clubId,away=m.away===clubId;
 const gf=home?m.homeGoals:away?m.awayGoals:0,ga=home?m.awayGoals:away?m.homeGoals:0;
 const r=ensureCompetitionRecord(club,c,year,stage?.knockout&&stage.phaseCode===1098?1098:c.subkind);
 r.games++;r.goalsFor+=gf;r.goalsAgainst+=ga;if(gf>ga)r.wins++;else if(gf<ga)r.losses++;
 if(c.kind>=0&&c.kind<15){const row=club.allTime[c.kind]!;
  row[0]!+=(gf>ga?3:gf===ga?1:0);row[1]!+=gf;row[2]!+=ga;}
}
export function recordStageGame(club:ClubRecord,clubId:string,m:MatchRecord,stageId:string):void{
 const home=m.home===clubId,away=m.away===clubId;
 const gf=home?m.homeGoals:away?m.awayGoals:0,ga=home?m.awayGoals:away?m.homeGoals:0;
 let r=club.stageRecords.find(x=>x.stageId===stageId);
 if(!r){r={stageId,points:0,games:0,wins:0,losses:0,goalsFor:0,goalsAgainst:0};club.stageRecords.push(r);}
 r.games++;r.goalsFor+=gf;r.goalsAgainst+=ga;
 if(gf>ga){r.wins++;r.points+=3;}else if(gf<ga)r.losses++;else r.points++;
}
/** `ah.p`: classifica em campeão, topo, meio, risco, rebaixado. */
export function tableBand(position:number,size:number,relegated:number,kind:number):readonly [number,number,number]{
 if(position<1||kind!==1&&kind!==3)return [0,0,-1];
 const top=kind===3?2:4,margin=size<20?2:4;
 const band=position===1?1:position>size-relegated?5:position<=top?2:position>size-(relegated+margin)?4:3;
 return [position,band,0];
}
