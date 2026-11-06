/** Fonte: simulation/src/human/lineup.rs. Escolha de cobrador, capitão e slots de reservas.
 * Dependências: jogadores classificados por força; port de seleção, não UI de arrastar. */
export interface LineupMember22{id:string;strength:number;status:number;position:number;trait1:number;}
/** `pick_penalty_taker`: primeiro titular com trait9, senão titular de linha. */
export function penaltyTaker22(players:readonly LineupMember22[]):string|undefined{
 const sorted=[...players].sort((a,b)=>b.strength-a.strength);
 return (sorted.find(p=>p.status===1&&p.trait1===9)??sorted.find(p=>p.status===1&&p.position!==0)??sorted.find(p=>p.position!==0))?.id;
}
/** `on_grid`: slots 1..last bench, 0 não corresponde a campo. */
export function onLineupGrid22(grid:readonly (string|undefined)[],id:string,lastBench:number):boolean{
 return grid.slice(1,lastBench+1).includes(id);
}
