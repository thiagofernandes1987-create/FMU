/**
 * M26 — diagnósticos derivados de `crates/systems/examples`:
 * `day_matches.rs`, `compare_season.rs`, `new_game_smoke.rs`.
 * DEPENDÊNCIAS: DemoCareer (nunca `.s22` importado), funções existentes M24.
 * EFEITOS: as funções devolvem resultados imutáveis; o smoke cria uma carreira nova.
 * LIMITES: a Demo não contém `events` originais, jovens Rust, comissão e datas por dia.
 */
import {DemoCareer,DemoFixture,createDemoCareer,advanceDemoRound,nextDemoSeason,roundsInSeason} from '../../m24/web/career_demo';
export interface FixtureInspection {id:string;round:number;home:string;away:string;played:boolean;homeGoals:number|null;awayGoals:number|null;}
/** `day_matches.rs`: usa round demonstrativo, não dia de calendário Rust. */
export function inspectDemoRound(career:DemoCareer,round:number|'current'):FixtureInspection[] {
 const target=round==='current'?career.round:round;
 if(!Number.isInteger(target)||target<1||target>roundsInSeason(career))throw Error('Invalid round');
 return career.fixtures.filter(f=>f.round===target).map(m=>({id:m.id,round:m.round,home:m.home,away:m.away,
  played:m.played,homeGoals:m.homeGoals??null,awayGoals:m.awayGoals??null}));
}
export interface FirstDifference {category:'transfers'|'players'|'freeAgents'|'score'|'season';index:number;left:unknown;right:unknown;}
/** `compare_season.rs`: primeira diferença por categoria, sem ocultar comprimento desigual. */
export function compareDemoCareers(a:DemoCareer,b:DemoCareer):FirstDifference[] {
 const result:FirstDifference[]=[];
 if(a.season!==b.season)result.push({category:'season',index:0,left:a.season,right:b.season});
 const first=(category:FirstDifference['category'],xs:readonly unknown[],ys:readonly unknown[])=>{
  const n=Math.max(xs.length,ys.length);
  for(let i=0;i<n;i++)if(JSON.stringify(xs[i])!==JSON.stringify(ys[i])){
   result.push({category,index:i,left:xs[i]??null,right:ys[i]??null});break;
  }
 };
 first('transfers',a.transfers,b.transfers);
 first('players',a.clubs.flatMap(c=>c.players),b.clubs.flatMap(c=>c.players));
 first('freeAgents',a.freeAgents,b.freeAgents);
 first('score',a.fixtures,b.fixtures);
 return result;
}
/** `new_game_smoke.rs`: executa rounds e anos com semente fixa. Ao contrário
 * do Rust original, conta RODADAS, não dias. Retorna somente métricas auditáveis. */
export function runDemoCareerSmoke(steps:number,seed=2026):{career:DemoCareer;seasons:number;played:number;uniqueFixtures:number;players:number} {
 if(!Number.isSafeInteger(steps)||steps<0||steps>5000)throw Error('Invalid smoke steps');
 let state=createDemoCareer('Auditoria M26','c0',seed),seasons=0,played=0;
 for(let i=0;i<steps;i++){
  if(state.round>roundsInSeason(state)){state=nextDemoSeason(state);seasons++;}
  state=advanceDemoRound(state);played+=state.clubs.length/2;
 }
 return {career:state,seasons,played,uniqueFixtures:new Set(state.fixtures.map(x=>x.id)).size,
  players:state.clubs.reduce((n,c)=>n+c.players.length,0)+state.freeAgents.length};
}
