/** Fonte: systems/src/economy.rs. Ano da carreira, clubes IA e pesos das ligas.
 * Dependência: listas com IDs estáveis, sem mutação financeira. */
export function economyYear22(startYear:number,season:number):number{return startYear+season-1;}
export interface EconomyClub22{id:string;reputation:number;human:boolean;nationalTeam:boolean;}
export function aiClubs22(clubs:readonly EconomyClub22[],humanClubIds:ReadonlySet<string>):EconomyClub22[]{
 return clubs.filter(c=>!c.nationalTeam&&!c.human&&!humanClubIds.has(c.id));
}
/** `league_weights`: reputação média >=3,35 =>2, >=2,7=>1,5, senão 1. */
export function leagueWeight22(reputations:readonly number[]):number{
 if(!reputations.length)return 1;const average=reputations.reduce((a,b)=>a+b,0)/reputations.length;
 return average>=3.35?2:average>=2.7?1.5:1;
}
