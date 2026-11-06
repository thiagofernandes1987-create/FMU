/**
 * Conexão verificável das tabelas imutáveis do Rust simulation/fixture_tables.rs
 * com os IDs persistentes do FMU. A quantidade de partidas e mando vem da fonte,
 * não de gerador round-robin aproximado. Nenhuma mutação no elenco fornecido.
 */
import {THREE_ONE_ROUND,THREE_TWO_ROUNDS,FOUR_WORLD_CUP,FIVE,SIX_TWO_ROUNDS,NINE,ELEVEN,TWENTY_FIVE} from './generated/fixture_tables';
export type ScheduledGame={round:number;home:string;away:string};
export function fixtureTable(size:number,homeAndAway=false):readonly (readonly (readonly [number,number])[])[]{
 if(size===3)return homeAndAway?THREE_TWO_ROUNDS:THREE_ONE_ROUND;
 if(size===4)return FOUR_WORLD_CUP;
 if(size===5)return FIVE;
 if(size===6)return SIX_TWO_ROUNDS;
 if(size===9)return NINE;
 if(size===11)return ELEVEN;
 if(size===25)return TWENTY_FIVE;
 throw new RangeError('No canonical Rust fixture table for '+size+' clubs');
}
export function scheduleFixedFixtures(clubIds:readonly string[],homeAndAway=false):ScheduledGame[]{
 const table=fixtureTable(clubIds.length,homeAndAway);
 if(new Set(clubIds).size!==clubIds.length)throw new Error('Duplicate club ID');
 const out:ScheduledGame[]=[];
 for(let round=0;round<table.length;round++){
  const used=new Set<number>();
  for(const [home,away] of table[round]??[]){
   if(home===away||home<0||away<0||home>=clubIds.length||away>=clubIds.length||used.has(home)||used.has(away))
    throw new Error('Invalid canonical fixture pairing');
   used.add(home);used.add(away);
   out.push({round:round+1,home:clubIds[home]!,away:clubIds[away]!});
  }
 }
 return out;
}
