/**
 * Direct ports of selected pure logic from simulation/src/matchday.rs and
 * simulation/src/league.rs. Does not replace all coach/player/record/income
 * functions used by Rust afterMatch. Partial parity is explicitly reported.
 */
import {World,HeadToHead,clubPayment} from './world';
export function newHeadToHead(club1:number,club2:number,goals1:number,goals2:number,kind:number,season:number):HeadToHead {
 const t:HeadToHead={games:1,club1,club2,goals1,goals2,wins1:0,wins2:0,
  best_win1_kind:-1,best_win1_season:0,best_win1_for:0,best_win1_against:0,
  best_win2_kind:-1,best_win2_season:0,best_win2_for:0,best_win2_against:0};
 if(goals1>goals2){t.wins1++;t.best_win1_kind=kind;t.best_win1_season=season;t.best_win1_for=goals1;t.best_win1_against=goals2;}
 else if(goals2>goals1){t.wins2++;t.best_win2_kind=kind;t.best_win2_season=season;
  // Rust new_head_to_head: retains goals1/goals2 orientation even for wins2.
  t.best_win2_for=goals1;t.best_win2_against=goals2;
 }
 return t;
}
/** Preserve original Rust's peculiar second-division gap comparator. */
export function updateHeadToHead(t:HeadToHead,homeId:number,hg:number,ag:number,kind:number,season:number):void {
 if(homeId!==t.club1&&homeId!==t.club2)throw Error('H2H home not a participant');
 const best=(side:1|2,scored:number,conceded:number)=>{
  if(side===1){const old=t.best_win1_for-t.best_win1_against,gap=scored-conceded;
   if(gap>old||(gap===old&&scored>=t.best_win1_for)){
    t.best_win1_season=season;t.best_win1_kind=kind;t.best_win1_for=scored;t.best_win1_against=conceded;
   }
  }else{
   const old=t.best_win2_for-t.best_win1_against,gap=scored-conceded;
   if(gap>old||(gap===old&&scored>=t.best_win2_for)){
    t.best_win2_season=season;t.best_win2_kind=kind;t.best_win2_for=scored;t.best_win2_against=conceded;
   }
  }
 };
 t.games++;
 if(homeId===t.club1){t.goals1+=hg;t.goals2+=ag;
  if(hg>ag){t.wins1++;best(1,hg,ag);}else if(ag>hg){t.wins2++;best(2,ag,hg);}
 }else{t.goals1+=ag;t.goals2+=hg;
  if(hg>ag){t.wins2++;best(2,hg,ag);}else if(ag>hg){t.wins1++;best(1,ag,hg);}
 }
}
export function recordHeadToHead(w:World,matchId:number):HeadToHead {
 const m=w.matches[matchId];if(!m||m.home===null||m.away===null)throw Error('H2H requires club pair');
 if(m.home===m.away)throw Error('H2H cannot play itself');
 const id1=w.clubs[m.home]!.id,id2=w.clubs[m.away]!.id;
 const kind=m.competition===null?-1:w.competitions[m.competition]!.kind,season=w.game.season;
 const records=w.game.head_to_head??(w.game.head_to_head=[]);
 const index=records.findLastIndex(t=>t.club1===id1&&t.club2===id2||t.club2===id1&&t.club1===id2);
 if(index<0){const x=newHeadToHead(id1,id2,m.home_goals,m.away_goals,kind,season);records.push(x);return x;}
 const x=records[index]!;updateHeadToHead(x,id1,m.home_goals,m.away_goals,kind,season);return x;
}
/** Rust `I.hf()` gate income; no accounting if neutral kind 7/5. */
export function recordGateIncome(w:World,matchId:number):void {
 const m=w.matches[matchId];if(!m||m.home===null)throw Error('Gate requires home');
 const kind=m.competition===null?-1:w.competitions[m.competition]!.kind;
 const home=w.clubs[m.home]!;
 if(home.human&&kind!==7&&kind!==5){const amount=m.income??0;
  if(!Number.isSafeInteger(amount)||amount<0||amount>2147483647)throw Error('Invalid gate income');
  home.cash+=BigInt(amount);home.finances.income_type5=(home.finances.income_type5??0)+amount;
 }
}
/** Port `league::position_in` without mutating table. */
export function positionIn(w:World,stageId:number,clubId:number):number {
 const stage=w.stages[stageId];if(!stage)throw RangeError('stage id');
 if(stage.knockout!==undefined&&stage.knockout!==null)return -1;
 const index=stage.clubs.indexOf(clubId);return index<0?-1:index+1;
}
/** `league::mid_season_round` reproduces original condition (never opens market). */
export function midSeasonRound(w:World,stageId:number):number {
 const s=w.stages[stageId];if(!s)throw RangeError('stage id');
 const n=s.clubs.length,g=s.group_count??0,rounds=g===0?(n-1)*2:(n/g)*2-1;
 return s.round>rounds/2?Math.trunc(s.round/2):0;
}
/** `league::relegated_places` with state/country division lookup. */
export function relegatedPlaces(w:World,stageId:number):number {
 const s=w.stages[stageId];if(!s)throw RangeError('stage id');
 const div=Math.max(0,(s.division??1)-1);
 const indexes=s.state_league!==undefined&&s.state_league!==null?w.state_leagues?.[s.state_league]?.divisions:
   s.country_ref!==undefined&&s.country_ref!==null?w.countries?.[s.country_ref]?.divisions:undefined;
 if(!indexes||div>=indexes.length)return 0;
 const c=w.competitions[indexes[div]!];return c?.relegated??0;
}
