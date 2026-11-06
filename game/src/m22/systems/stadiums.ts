/** Fonte: systems/src/stadiums.rs::legends, stadium_name. Elegibilidade de ídolos.
 * Dependências: histórico de jogos/gols/títulos e boletins da premiação; sem UI nem renomeação. */
export interface StadiumIdol22{id:string;name:string;games:number;goals:number;awards:number;ballonDor:number;active:boolean;}
/** `legends`: ≥300 jogos, ≥150 gols ou Bola de Ouro+120 jogos. */
export function stadiumLegends22(idols:readonly StadiumIdol22[]):({idol:StadiumIdol22;greatness:number})[]{
 return idols.filter(x=>!x.active&&(x.games>=300||x.goals>=150||x.ballonDor>=1&&x.games>=120))
  .map(idol=>({idol,greatness:idol.games+1.5*idol.goals+60*idol.awards+150*idol.ballonDor}))
  .sort((a,b)=>b.greatness-a.greatness);
}
