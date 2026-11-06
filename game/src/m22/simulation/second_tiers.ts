/** Fonte: simulation/src/second_tiers.rs. Códigos e composição de grupos continentais.
 * A simulação dos jogos não é refeita; entradas de vencedores já têm IDs estáveis. */
export type ContinentalTier22='Europa'|'Conference';
export function secondTierCodes22(tier:ContinentalTier22):readonly [number,number]{return tier==='Europa'?[6006,6005]:[12006,12005];}
export function flattenTies22(ties:readonly (readonly string[])[]):string[]{return ties.flatMap(x=>x);}
export function groupPlaces22(groups:readonly (readonly string[])[],place:number):string[]{return groups.map(group=>{const id=group[place];if(id===undefined)throw RangeError('Missing group place');return id;});}
