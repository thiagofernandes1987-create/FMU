/** Minimal Rust-compatible subset of model/world.rs and model/saved.rs.
 * Unknown serde fields remain in the original object when structuredClone'd.
 * IDs reference arena indices, never mutable positions in the lineup.
 */
export interface Player {name:string;age:number;fitness:number;started_recently:boolean;salary:number;club:number|null;injured_until:number;[key:string]:unknown;}
export interface Finances {expense_salaries:bigint;bank_interest:number;expense_type4:number;income_type5?:number;[key:string]:unknown;}
export interface Club {name:string;id:number;human:boolean;lineup_set:boolean;cash:bigint;squad:number[];youth_squad:number[];finances:Finances;[key:string]:unknown;}
export interface Match {home:number|null;away:number|null;home_goals:number;away_goals:number;played:boolean;income?:number;competition:number|null;stage:number|null;[key:string]:unknown;}
export interface Day {date:number;matches:number[];stages:number[];done:boolean;kind:number;tasks_before:string[];tasks_after:string[];[key:string]:unknown;}
export interface Competition {kind:number;league:number|null;relegated?:number;[key:string]:unknown;}
export interface Stage {class:'League'|'Knockout';clubs:number[];round:number;knockout?:number|null;group_count?:number;division?:number;country_ref?:number|null;state_league?:number|null;[key:string]:unknown;}
export interface HeadToHead {games:number;club1:number;club2:number;goals1:number;goals2:number;wins1:number;wins2:number;best_win1_kind:number;best_win1_season:number;best_win1_for:number;best_win1_against:number;best_win2_kind:number;best_win2_season:number;best_win2_for:number;best_win2_against:number;}
export interface Game {season:number;day:number;season_over:boolean;head_to_head?:HeadToHead[];days:Day[];clubs:number[];players:number[];youth_players:number[];human_clubs:number[];stages?:number[];[key:string]:unknown;}
export interface World {game:Game;players:Player[];clubs:Club[];matches:Match[];competitions:Competition[];stages:Stage[];countries?:{divisions:number[]}[];state_leagues?:{divisions:number[]}[];[key:string]:unknown;}
export class WorldInvariantError extends Error {constructor(public readonly problems:string[]){super(problems.slice(0,5).join('; '));this.name='WorldInvariantError';}}
const pos=(v:number,n:number)=>Number.isSafeInteger(v)&&v>=0&&v<n;
export function validateWorld(world:World):void {
 const errors:string[]=[];
 const err=(m:string)=>{if(errors.length<40)errors.push(m);};
 if(!world||typeof world!=='object'||!world.game)throw new WorldInvariantError(['Missing World/Game']);
 for(const key of ['players','clubs','matches','competitions','stages'] as const){if(!Array.isArray(world[key]))err(`Missing arena ${key}`);}
 if(errors.length)throw new WorldInvariantError(errors);
 const g=world.game;
 if(!Number.isInteger(g.season)||g.season<1)err('Invalid season');
 if(!Array.isArray(g.days))err('game.days must be array');
 else if(g.days.length&& !pos(g.day,g.days.length))err('game.day invalid');
 for(const [group,ids,n] of [['game.clubs',g.clubs,world.clubs.length],['game.players',g.players,world.players.length],['game.youth_players',g.youth_players,world.players.length],['game.human_clubs',g.human_clubs,world.clubs.length]] as const){
  if(!Array.isArray(ids)){err(`${group} missing`);continue;}
  for(const id of ids)if(!pos(id,n))err(`${group} invalid ref ${id}`);
 }
 if(new Set(world.clubs.map(c=>c.id)).size!==world.clubs.length)err('Duplicate Club.id');
 if(g.head_to_head){const ids=new Set(world.clubs.map(c=>c.id));
  for(const [i,r] of g.head_to_head.entries()){
   if(!ids.has(r.club1)||!ids.has(r.club2)||r.club1===r.club2)err(`Invalid H2H club ids at ${i}`);
   if(!Number.isSafeInteger(r.games)||r.games<1)err(`Invalid H2H games at ${i}`);
  }
 }
 world.clubs.forEach((c,ci)=>{
  if(typeof c.cash!=='bigint')err(`Club ${ci} cash must be bigint`);
  if(!Array.isArray(c.squad)||!Array.isArray(c.youth_squad)){err(`Club ${ci} missing squads`);return;}
  const all=[...c.squad,...c.youth_squad];if(new Set(all).size!==all.length)err(`Club ${ci} duplicate player`);
  for(const id of all)if(!pos(id,world.players.length))err(`Club ${ci} invalid player ${id}`);
 });
 world.players.forEach((p,pi)=>{
  if(p.club!==null&&!pos(p.club,world.clubs.length))err(`Player ${pi} invalid club`);
  if(!Number.isInteger(p.fitness)||p.fitness<0||p.fitness>100)err(`Player ${pi} fitness out of range`);
 });
 world.matches.forEach((m,i)=>{if(m.home!==null&&!pos(m.home,world.clubs.length))err(`Match ${i} invalid home`);
  if(m.away!==null&&!pos(m.away,world.clubs.length))err(`Match ${i} invalid away`);
  if(m.competition!==null&&!pos(m.competition,world.competitions.length))err(`Match ${i} invalid competition`);
  if(m.stage!==null&&!pos(m.stage,world.stages.length))err(`Match ${i} invalid stage`);
  if(!Number.isSafeInteger(m.home_goals)||m.home_goals<0||!Number.isSafeInteger(m.away_goals)||m.away_goals<0)err(`Match ${i} invalid goals`);
 });
 g.days?.forEach((d,i)=>{for(const m of d.matches)if(!pos(m,world.matches.length))err(`Day ${i} invalid match ${m}`);
  for(const s of d.stages)if(!pos(s,world.stages.length))err(`Day ${i} invalid stage ${s}`);
  if(!Number.isSafeInteger(d.date))err(`Day ${i} invalid date`);
 });
 if(errors.length)throw new WorldInvariantError(errors);
}
/** Checks index consistency, not all semantic conditions of Rust Runtime. */
export function worldIdentityIntegrity(world:World):{checked:number;errors:string[]} {
 const errors:string[]=[];let checked=0;
 world.clubs.forEach((club,clubId)=>{
  for(const p of [...club.squad,...club.youth_squad]){checked++;
   if(world.players[p]?.club!==clubId)errors.push(`Club ${clubId} roster player ${p} belongs to ${world.players[p]?.club}`);
  }
 });
 return {checked,errors};
}
/** `Player::recover_between_matches()` actual Rust age/fatigue bins. */
export function recoverPlayer(player:Player,human:boolean):void {
 const age=player.age;
 const amount=player.started_recently
   ? human?(age<=20?13:age<=25?24:age<=31?37:age<=36?40:30)
     :(age<=20?20:age<=25?30:age<=31?50:age<=36?52:42)
   :(age<20?30:age<26?30:age<33?35:age<45?35:30);
 player.fitness=Math.min(100,Math.max(0,player.fitness+amount));
}
export function clubWages(world:World,clubId:number):bigint {
 const club=world.clubs[clubId];if(!club)throw new RangeError('unknown club');
 return [...club.squad,...club.youth_squad].reduce((sum,p)=>sum+BigInt(world.players[p]!.salary),0n);
}
export function clubExpense(world:World,clubId:number,amount:bigint):void {
 if(amount<0n)throw new RangeError('negative expense');const club=world.clubs[clubId];if(!club)throw new RangeError('unknown club');
 club.cash-=amount;if(club.human)club.finances.expense_salaries+=amount;
}
export function clubPayment(world:World,clubId:number,amount:number,kind:number):void {
 if(!Number.isSafeInteger(amount)||amount<0||amount>2147483647)throw new RangeError('invalid i32 payment');
 const club=world.clubs[clubId];if(!club)throw new RangeError('unknown club');
 club.cash-=BigInt(amount);if(club.human){if(kind===4)club.finances.expense_type4+=amount;}
}