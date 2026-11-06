/**
 * Port funcional: crates/simulation/src/fixtures.rs.
 * Responsabilidade: dias livres, escolha de estádio, agenda e horários de mudanças AI.
 * Dependências: World de calendário/estádios injetado e duas fontes de RNG.
 * Efeitos: `newFixture` insere jogo no calendário; `planChanges` consome RNG e
 * armazena horários de tática/substituição. Usa IDs string estáveis em vez de arena.
 * Borda do Rust preservada: stadiumCondition é lida ANTES do local neutro trocar estádio.
 * Verificação: tests/m20_simulation.test.ts.
 */
export interface FixtureDay {kind:number;done:boolean;matches:string[];stages:string[];competitions:string[];}
export interface FixtureStadium {id:string;country:number;capacity:readonly number[];condition:number;}
export interface FixtureClub {id:string;country:number;stadium?:string;}
export interface FixtureStage {id:string;kind:number;lastRound:number;knockoutId?:string;}
export interface FixtureCompetition {
 id:string;kind:number;subkind:number;class:'CopaSudamericana'|'ChampionsLeague'|'Libertadores'|'EuropaLeague'|'ConferenceLeague'|'Other';
 mainStageId?:string;playoffRoundId?:string;
}
export interface FixtureMatch {id:string;stage:string;home:string;away:string;day:number;competition:string;
 stadium?:string;stadiumCondition:number;tacticalChangeMinutes:number[][];substitutionMinutes:number[][];}
export interface FixtureWorld {days:FixtureDay[];matches:FixtureMatch[];clubs:Record<string,FixtureClub>;
 stadiums:Record<string,FixtureStadium>;stages:Record<string,FixtureStage>;competitions:Record<string,FixtureCompetition>;
 /** Country.code -> available country ref. Can omit country without representative. */
 countryRefs:ReadonlySet<number>;season:number;
}
export interface FixtureRandom {
 /** Runtime.rng.shuffle: modifies provided pool. */shuffle(values:number[]):void;
 /** Runtime.rng.new_random().next_int_bounded */nextIntBounded(bound:number):number;
 /** Runtime.rng.fresh_int, used for stadium choice */freshInt(bound:number):number;
}
export interface FixtureRuntime {rng:FixtureRandom;minutePools:Array<number[]|undefined>;
 stadiumsBySize?:string[];nationalGrounds:Record<number,string[]>;}
export function freeFixtureDays(world:FixtureWorld,kind:number,skipTwo:boolean):number[]{
 let skip=skipTwo?2:0;const out:number[]=[];
 for(let i=0;i<world.days.length;i++){
  const d=world.days[i]!;
  if(d.kind===kind&&!d.done){if(skip<=0)out.push(i);if(skip>0)skip--;}
 }
 return out;
}
const range=(from:number,to:number)=>Array.from({length:to-from+1},(_,i)=>from+i);
function draw(rng:FixtureRandom,bound:number,method:'nextIntBounded'|'freshInt'='nextIntBounded'):number{
 const n=rng[method](bound);if(!Number.isInteger(n)||n<0||n>=bound)throw new RangeError('Fixture RNG out of bounds');return n;
}
/** Tradução de `I.hb`: plano 2x3 tático e 2x4 substituições. */
export function planFixtureChanges(runtime:FixtureRuntime):{tactical:number[][];substitutions:number[][]}{
 const pools=runtime.minutePools;
 for(const [i,a,b] of [[0,19,38],[1,5,15],[2,16,35],[3,36,42],[4,43,47]] as const){
  if(!pools[i])pools[i]=range(a,b);
 }
 runtime.rng.shuffle(pools[0]!);
 const first=draw(runtime.rng,100);
 const late=pools[0]!;
 const tactical=[[late[0]!,late[1]!,-1],[late[2]!,late[3]!,-1]];
 const substitutions=[[-1,-1,-1,-1],[-1,-1,-1,-1]];
 if(draw(runtime.rng,100)>30)tactical[0]![2]=late[4]!;
 if(draw(runtime.rng,100)>30)tactical[1]![2]=late[5]!;
 const index=first>90?1:first>50?2:3;
 runtime.rng.shuffle(pools[index]!);
 const list=pools[index]!;
 for(let i=0;i<2;i++)for(let j=0;j<2;j++)substitutions[i]![j]=list[i*2+j]!;
 runtime.rng.shuffle(pools[4]!);
 const last=pools[4]!;
 if(draw(runtime.rng,100)>20)substitutions[0]![2]=last[0]!;
 if(draw(runtime.rng,100)>50)substitutions[0]![3]=last[1]!;
 if(draw(runtime.rng,100)>20)substitutions[1]![2]=last[2]!;
 if(draw(runtime.rng,100)>50)substitutions[1]![3]=last[3]!;
 return {tactical,substitutions};
}
/** `f.cb`: maior capacidade primeiro, com empate estável pela ordem dos clubes. */
export function stadiumsBySize(world:FixtureWorld,runtime:FixtureRuntime):string[]{
 if(!runtime.stadiumsBySize){
  runtime.stadiumsBySize=Object.values(world.clubs).flatMap(c=>c.stadium?[c.stadium]:[])
   .sort((a,b)=>world.stadiums[b]!.capacity.reduce((s,v)=>s+v,0)-world.stadiums[a]!.capacity.reduce((s,v)=>s+v,0));
 }
 return [...runtime.stadiumsBySize];
}
/** Sorteio entre 6 maiores estádios do país ou 2 primeiros. */
export function nationalGround(world:FixtureWorld,runtime:FixtureRuntime,country:number,firstTwo:boolean):string|undefined{
 if(!runtime.nationalGrounds[country])runtime.nationalGrounds[country]=stadiumsBySize(world,runtime)
  .filter(id=>world.stadiums[id]?.country===country).slice(0,6);
 const options=runtime.nationalGrounds[country]!;
 if(!options.length)return undefined;
 return options[draw(runtime.rng,firstTwo?2:options.length,'freshInt')];
}
/** Série de 10 países sede, gira com `(season−1)%10`. */
export function finalHostCountry(competition:FixtureCompetition,season:number):number|undefined{
 const index=((season-1)%10+10)%10;
 const countries:Record<FixtureCompetition['class'],number[]>= {
  CopaSudamericana:[11,29,150,42,46,151,195,26,198,60],
  ChampionsLeague:[192,162,3,104,154,97,72,152,65,52],
  Libertadores:[42,11,29,46,150,195,26,198,60,151],
  EuropaLeague:[152,65,52,31,21,154,3,72,162,97],
  ConferenceLeague:[152,65,52,31,21,154,3,72,162,97],
  Other:[]
 };
 return countries[competition.class][index];
}
export function finalOnNeutralGround(world:FixtureWorld,competition:FixtureCompetition,round:number):boolean{
 const k=competition.class;
 const stageId=['ChampionsLeague','Libertadores','CopaSudamericana'].includes(k)?
  (competition.mainStageId?world.stages[competition.mainStageId]?.knockoutId:undefined):
  ['EuropaLeague','ConferenceLeague'].includes(k)?competition.playoffRoundId:undefined;
 return !!stageId&&world.stages[stageId]?.lastRound===round;
}
/** Registra partida e todos os índices do dia; valida todas as entradas antes da mutação. */
export function newFixture(world:FixtureWorld,runtime:FixtureRuntime,stageId:string,round:number,
 homeId:string,awayId:string,dayIndex:number,competitionId:string,venue?:string):FixtureMatch {
 const stage=world.stages[stageId],home=world.clubs[homeId],away=world.clubs[awayId],day=world.days[dayIndex],comp=world.competitions[competitionId];
 if(!stage||!home||!away||!day||!comp||homeId===awayId)throw new Error('Invalid fixture references');
 let stadium=venue??home.stadium;
 if(stadium&&!world.stadiums[stadium])throw new Error('Unknown stadium');
 const stadiumCondition=stadium?world.stadiums[stadium]!.condition:0;
 if(stage.kind===9){
  if(world.countryRefs.has(home.country))stadium=nationalGround(world,runtime,home.country,false);
 }else if([4,6,12].includes(stage.kind)&&(comp.subkind===0||comp.subkind===1)&&finalOnNeutralGround(world,comp,round)){
  stadium=undefined;
  const country=finalHostCountry(comp,world.season);
  if(country!==undefined&&world.countryRefs.has(country))stadium=nationalGround(world,runtime,country,stage.kind!==6);
 }
 if(comp.kind===5||comp.kind===15)stadium=undefined;
 const {tactical,substitutions}=planFixtureChanges(runtime);
 const id=String(world.matches.length);
 const m:FixtureMatch={id,stage:stageId,home:homeId,away:awayId,day:dayIndex,competition:competitionId,
  stadium,stadiumCondition,tacticalChangeMinutes:tactical,substitutionMinutes:substitutions};
 world.matches.push(m);
 day.matches.push(id);
 if(!day.stages.includes(stageId))day.stages.push(stageId);
 if(!day.competitions.includes(competitionId))day.competitions.push(competitionId);
 return m;
}
