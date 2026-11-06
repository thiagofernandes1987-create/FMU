/** Rust crates/app/src/screens/club_history.rs::placement (selected rules).
 * DTO is explicit; returns semantic marks + translation key; final i18n external. */
export interface ClubCompetitionRecord {season:number;competitionKind:number;competitionSubkind:number;division:number;roundReached:number;position:number;}
export interface Placement {key:string;marks:{champion:boolean;runnerUp:boolean;eliminated:boolean};args?:Record<string,string>;}
export function clubPlacement(r:ClubCompetitionRecord,worldSeason:number):Placement{
 let marks={champion:false,runnerUp:false,eliminated:false};const res=(key:string,args?:Record<string,string>):Placement=>({key,marks:{...marks},args});
 if(r.competitionKind===9)return res(r.division===1?'placement-qualified':'placement-not-qualified');
 if(r.roundReached>=0){marks.eliminated=true;const code=r.roundReached;
  if(code===1090){marks.eliminated=false;return res('placement-won-playoff');}
  if(code===1091)return res('placement-lost-playoff');
  if(code===1001)return res('placement-group-stage');
  if([4101,4102,4103,6000,6001,6002,6003,6006,6004,6100,4000,4001,4002,4003,4004,12001,12002,12003,12004,12006].includes(code))return res(`placement-code-${code}`);
  if(code===0){if(r.position===1){marks={champion:true,runnerUp:false,eliminated:false};return res('placement-champion');}
   if(r.position===2){marks={champion:false,runnerUp:true,eliminated:false};return res('placement-runner-up');}
   if((r.position===3||r.position===4)&&(r.competitionKind===7||r.competitionKind===14)){
    marks.eliminated=false;return res(r.position===3?'placement-third':'placement-fourth');}}
  return res('');
 }
 if(r.position>0){if(r.position===1){marks.champion=true;return res('placement-champion');}
  if(r.position===2){marks.runnerUp=true;return res('placement-runner-up');}
  if(r.competitionKind===7){marks.eliminated=true;return res('placement-groups-short');}
  return res('placement-position',{place:String(r.position)});
 }
 if(r.season<worldSeason){if(r.competitionKind===1){marks.eliminated=true;return res('placement-first-phase');}
  if(r.competitionKind===14){const letter=['A','A','B','C','D'][r.division];return letter?res('placement-league-letter',{letter}):res('placement-groups');}
  if(r.competitionKind===7){marks.eliminated=true;return res('placement-groups-short');}}
 return res('');
}
