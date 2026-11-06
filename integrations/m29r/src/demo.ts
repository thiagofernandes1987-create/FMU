/** Standalone DEMO fixture and explicitly non-Rust match engine for reproducible QA.
 * 10 fictional teams, circle-schedule double-round robin, 90 games per season.
 * NOT used silently by advanceWorld; injected only by tests/demo CLI.
 */
import {World,Player,Club,Match,Day,Stage} from './world';
import {RandomSource} from './rng';
import {Hooks} from './advance';
import {recordHeadToHead,recordGateIncome} from './records';
const DAY=86400000;
export function fixtures(clubs:number[],start:number):{days:Day[];matches:Match[]} {
 if(clubs.length<4||clubs.length%2!==0||new Set(clubs).size!==clubs.length)throw Error('Requires even unique clubs >=4');
 const matches:Match[]=[],days:Day[]=[],rot=[...clubs],n=clubs.length;
 for(let round=0;round<n-1;round++){
  const games:number[]=[];
  for(let i=0;i<n/2;i++){
   let a=rot[i]!,b=rot[n-1-i]!;
   if((round+i)%2===1)[a,b]=[b,a];
   games.push(matches.length);matches.push({home:a,away:b,home_goals:0,away_goals:0,played:false,competition:0,stage:0});
  }
  days.push({date:start+round*DAY,matches:games,stages:[0],done:false,kind:1,tasks_before:[],tasks_after:[]});
  const reverse=games.map(id=>{const m=matches[id]!;matches.push({home:m.away,away:m.home,home_goals:0,away_goals:0,played:false,competition:0,stage:0});return matches.length-1;});
  days.push({date:start+(round+n-1)*DAY,matches:reverse,stages:[0],done:false,kind:1,tasks_before:[],tasks_after:[]});
  rot.splice(1,0,rot.pop()!);
 }
 return {matches,days:days.sort((a,b)=>a.date-b.date)};
}
export function demoWorld(n=10):World {
 const players:Player[]=[],clubs:Club[]=[];
 for(let c=0;c<n;c++){
  const squad:number[]=[];
  for(let p=0;p<18;p++){const id=players.length;squad.push(id);
   players.push({name:`Player ${c}-${p}`,age:18+(p%18),fitness:70,started_recently:false,salary:1000+(p*50),club:c,injured_until:0});
  }
  clubs.push({name:`Demo ${c+1}`,id:100+c,human:false,lineup_set:false,cash:25000000n,squad,youth_squad:[],finances:{bank_interest:0,expense_type4:0,expense_salaries:0n}});
 }
 const pack=fixtures(clubs.map((_,i)=>i),Date.UTC(2026,0,1));
 const stage:Stage={class:'League',clubs:clubs.map((_,i)=>i),round:0};
 return {game:{season:1,day:0,season_over:false,days:pack.days,clubs:stage.clubs,players:players.map((_,i)=>i),youth_players:[],human_clubs:[]},
  players,clubs,matches:pack.matches,competitions:[{kind:1,league:0}],stages:[stage]};
}
/** All hooks are controlled, deterministic and PURE to satisfy transaction rollback.
 * This is NOT the authentic Rust engine, whose code remains to be ported.
 */
export function demoHooks():Hooks {
 return {
  pickAILineup:(w,c)=>{w.clubs[c]!.lineup_set=true;},
  playMatch:(w,id,rng)=>{
   const game=w.matches[id]!,home=w.clubs[game.home!]!,away=w.clubs[game.away!]!;
   const bias=home.squad.length-away.squad.length;
   return {homeGoals:Math.min(6,Math.max(0,rng.freshInt(4)+(bias>0?1:0))),awayGoals:rng.freshInt(4)};
  },
  afterMatch:(w,id)=>{
   const m=w.matches[id]!;if(!m.played)throw Error('afterMatch called before match played');
   recordHeadToHead(w,id);recordGateIncome(w,id);
   // The rest of Rust afterMatch (player ratings, coach mood, season records)
   // remains an injected dependency and is NOT claimed as ported.
  },
  afterStage:(w,id)=>{w.stages[id]!.round++;},
  endSeason:(w)=>{(w.game as any).lastChampion=table(w)[0]?.club??null;},
  newSeason:(w)=>{
   const next=w.game.season+1;
   const pack=fixtures(w.clubs.map((_,i)=>i),Date.UTC(2026+next-1,0,1));
   w.matches=pack.matches;w.game.days=pack.days;w.game.day=0;w.game.season=next;w.game.season_over=false;
   w.stages[0]!.round=0;
  }
 };
}
export function table(w:World):{club:number;points:number;gd:number;gf:number}[] {
 const rows=w.clubs.map((_,id)=>({club:id,points:0,gd:0,gf:0}));
 for(const m of w.matches)if(m.played){const h=rows[m.home!]!,a=rows[m.away!]!;
  h.gf+=m.home_goals;a.gf+=m.away_goals;
  h.gd+=m.home_goals-m.away_goals;a.gd+=m.away_goals-m.home_goals;
  if(m.home_goals>m.away_goals)h.points+=3;else if(m.home_goals<m.away_goals)a.points+=3;else{h.points++;a.points++;}
 }
 return rows.sort((a,b)=>b.points-a.points||b.gd-a.gd||b.gf-a.gf||a.club-b.club);
}
