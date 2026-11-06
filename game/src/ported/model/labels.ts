/** M21 — crates/model/src/labels.rs: representação de nomes de competições.
 * Origem: World::stage_label/competition_label. Não calcula texto localizado;
 * retorna partes sem concatenar strings da UI, como o Rust. */
export const CUT_WORDS=['Campeonato do','Campeonato de','Campeonato da','Campeonato'] as const;
export type StageDivision={type:'None'}|{type:'Number';number:number}|{type:'Named';name:string};
export interface StageLabel{name:string;division:StageDivision;leagueOf?:number;}
export interface LabelStage {name:string;leagueName:string;divisionName:string;division:number;kindCode:number;country?:number;}
export function stageLabel(s:LabelStage):StageLabel {
 let name=s.leagueName||s.name;
 for(const word of CUT_WORDS)name=name.split(word).join('');
 const division:StageDivision=s.divisionName?{type:'Named',name:s.divisionName}:
  s.division>0&&s.kindCode!==1?{type:'Number',number:s.division}:{type:'None'};
 return {name,division,...(!s.leagueName&&!s.name&&s.country!==undefined?{leagueOf:s.country}:{})};
}
export type CompetitionLabel=
 |{type:'Saved';name:string}|{type:'Stage';stage:StageLabel}
 |{type:'SuperCup';country:number}|{type:'League';country:number;division:number}
 |{type:'Cup';country:number}|{type:'ClubWorldCup'|'Intercontinental'|'FriendlyTournament'|'SuperMundial'|'Unnamed'};
export interface LabelCompetition {
 name:string;class:'NationalLeague'|'IntercontinentalCup'|'FriendlyTournament'|'NationalSuperCup'|'NationalCup'|'Other';
 kind:number;country:number;countryRef?:number;division:number;league?:LabelStage;
}
export interface MundialFlags {tournamentNamed:boolean;renamed:boolean;}
export function competitionLabel(c:LabelCompetition,m:MundialFlags):CompetitionLabel {
 if(c.class==='NationalLeague'&&c.league)return {type:'Stage',stage:stageLabel(c.league)};
 if(c.class==='FriendlyTournament'&&(m.tournamentNamed||c.name==='Super Mundial de Clubes'))return {type:'SuperMundial'};
 if(c.class==='IntercontinentalCup'&&!c.name)return {type:m.renamed?'Intercontinental':'ClubWorldCup'};
 if(c.name)return {type:'Saved',name:c.name};
 if(c.class==='FriendlyTournament')return {type:'FriendlyTournament'};
 const country=c.class==='NationalSuperCup'?c.country:c.countryRef??-1;
 switch(c.class){case 'NationalSuperCup':return {type:'SuperCup',country};
  case 'NationalLeague':return {type:'League',country,division:c.division};
  case 'NationalCup':return {type:'Cup',country};default:return {type:'Unnamed'};}
}
