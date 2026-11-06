/**
 * M26 — adaptadores diagnósticos dos exemplos Rust de `simulation`:
 * - examples/days_to_season_end.rs: contagem até o fim, com limite de avanço;
 * - examples/compare_ratings.rs: divergências de notas lado a lado;
 * - examples/inspect_competitions.rs: calendário e divisão a partir de DTO tipado.
 * DEPENDÊNCIAS: DemoCareer M24 (não World Rust).
 * EFEITOS: somente `countDaysToDemoSeasonEnd` cria cópias por rodada; nada no save original.
 * A entrada é o sandbox fictício. Sem leitura de `.s22` e sem paridade de jogo.
 */
import {DemoCareer,advanceDemoRound,roundsInSeason,standings} from '../../m24/web/career_demo';
export interface RatingItem {id:string;name:string;lastRating:number;strength:number;slot?:number;}
export interface RatingDifference {index:number;id:string;name:string;rust:number;reference:number;strength:number;slot?:number;}
/** Inspiração do `compare_ratings.rs`: compara por ordem e limita output a 30. */
export function comparePlayerRatings(simulated:readonly RatingItem[],reference:readonly RatingItem[],max=30):RatingDifference[] {
 if(!Number.isInteger(max)||max<0||max>1000)throw Error('Invalid rating comparison limit');
 const result:RatingDifference[]=[];
 for(let i=0;i<Math.min(simulated.length,reference.length);i++){
  const a=simulated[i]!,b=reference[i]!;
  if(a.id!==b.id)throw Error(`Player order mismatch at index ${i}`);
  if(a.lastRating!==b.lastRating){result.push({index:i,id:a.id,name:a.name,rust:a.lastRating,reference:b.lastRating,strength:a.strength,slot:a.slot});if(result.length===max)break;}
 }
 return max===0?[]:result;
}
export interface DemoSeasonProgress {remainingRounds:number;matchesRemaining:number;alreadyPlayed:number;isFinished:boolean;season:number;}
/** `days_to_season_end.rs`: ticks até terminar, sem mutar a fonte. */
export function countDaysToDemoSeasonEnd(start:DemoCareer,maxSteps=200):DemoSeasonProgress {
 if(!Number.isInteger(maxSteps)||maxSteps<0||maxSteps>10000)throw Error('Invalid maxDays');
 let current=start,steps=0;
 while(current.round<=roundsInSeason(current)&&steps<maxSteps){current=advanceDemoRound(current);steps++;}
 const remaining=Math.max(0,roundsInSeason(current)-current.round+1);
 return {remainingRounds:remaining,matchesRemaining:current.fixtures.filter(m=>!m.played).length,
  alreadyPlayed:current.fixtures.filter(m=>m.played).length,isFinished:remaining===0,season:current.season};
}
export interface DemoCompetitionInspection {
 season:number;competitionKind:'League';stage:'double-round-robin';clubIds:string[];round:number;
 playedMatches:number;remainingMatches:number;leader:string|undefined;promotions:number;relegations:number;
}
/** `inspect_competitions.rs`: impressão de campos compatíveis que a Demo tem. */
export function inspectDemoCompetition(career:DemoCareer):DemoCompetitionInspection {
 const table=standings(career);
 return {season:career.season,competitionKind:'League',stage:'double-round-robin',
 clubIds:career.clubs.map(c=>c.id),round:career.round,playedMatches:career.fixtures.filter(f=>f.played).length,
 remainingMatches:career.fixtures.filter(f=>!f.played).length,leader:table[0]?.clubId,
 promotions:table.filter(r=>r.band==='promotion').length,relegations:table.filter(r=>r.band==='relegation').length};
}
