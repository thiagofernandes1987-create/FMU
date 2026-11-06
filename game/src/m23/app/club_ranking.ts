/** Rust crates/app/src/screens/club_ranking.rs::numbers/listed/kind_shown.
 * All-time columns sum kinds 1..14; ranking scores sort with stable tie order. */
import {ClubRow} from './types';
export function clubRankingNumbers(c:ClubRow,mode:number):[number,number,number]{
 if(mode===0)return [c.reputation,0,0];
 if(mode===1){const out:[number,number,number]=[0,0,0];for(let k=1;k<=14;k++){const v=c.allTimeRecord[k];if(v)for(let i=0;i<3;i++)out[i]=(out[i]??0)+(v[i]??0);}return out;}
 return [c.rankingPoints.slice(1,15).reduce((a,b)=>a+b,0),0,0];
}
export function rankedClubs(clubs:readonly ClubRow[],mode:number,country?:number):{club:ClubRow;stats:[number,number,number]}[]{
 const arr=clubs.filter(c=>country===undefined||c.country===country).map(club=>({club,stats:clubRankingNumbers(club,mode)}));
 return arr.sort((a,b)=>b.stats[0]-a.stats[0]||(mode===1?b.stats[2]-a.stats[2]:0));
}
export function clubCompetitionKindVisible(kind:number,country:number,confederation:number,playsState:boolean,international:boolean):boolean{
 if(kind===3&&(!playsState||country!==29))return false;
 if([4,5,6,8,12].includes(kind)){
  if(!international)return false;
  if((kind===6||kind===8)&&confederation>1)return false;
  if(kind===12&&confederation>0)return false;
 }
 return ![7,9,13,14].includes(kind);
}
