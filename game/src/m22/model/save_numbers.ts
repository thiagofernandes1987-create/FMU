/** Fonte: model/src/save_numbers.rs. IDs serializados de atletas, competições e transferências.
 * Entradas: listas ordenadas do save; efeitos: retornos imutáveis; não grava `.bfn`. */
export const MAIN_SAVE_LIST=1,YOUTH_SAVE_LIST=2;
export interface NumberedPlayer{id:string;number:number;list:number;}
/** `number_players_for_save`: numera primeiro lista principal e depois juventude em sequência única. */
export function numberPlayersForSave(main:readonly string[],youth:readonly string[]):NumberedPlayer[]{
 return [...main.map((id,i)=>({id,number:i,list:MAIN_SAVE_LIST})),...youth.map((id,i)=>({id,number:main.length+i,list:YOUTH_SAVE_LIST}))];
}
/** `relink_transfers`: primeiro atleta de cada `(list,number)` vence; inexistentes → null. */
export function relinkTransfers(players:readonly NumberedPlayer[],transfers:readonly {list:number;number:number}[]):(string|null)[]{
 const lookup=new Map<string,string>();for(const p of players){const key=`${p.list}:${p.number}`;if(p.number>=0&&!lookup.has(key))lookup.set(key,p.id);}
 return transfers.map(t=>lookup.get(`${t.list}:${t.number}`)??null);
}
/** `calendar_competitions`: ordem de primeira ocorrência, sem duplicatas. */
export function calendarCompetitionIds(days:readonly {competitions:readonly string[]}[]):string[]{
 const seen=new Set<string>(),out:string[]=[];
 for(const day of days)for(const id of day.competitions)if(!seen.has(id)){seen.add(id);out.push(id);}
 return out;
}
