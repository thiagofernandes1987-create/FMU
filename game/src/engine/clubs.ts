/**
 * Port funcional: crates/engine/src/clubs.rs — líderes designados da equipe.
 * Dependências: jogadores e clubes em DTO com identidades estáveis do FMU.
 * Efeito: corrige IDs de capitão/batedores ao consultar, exceto seleções nacionais
 * que mantêm o designado se ele ainda constar na convocação.
 */
export interface LeadershipClub {
 id:string;squad:readonly string[];nationalTeam:boolean;
 captain?:string;penaltyTaker?:string;freeKickTaker?:string;cornerTaker?:string;
}
export interface OwnershipPlayer {id:string;club?:string;}
/** Fonte `ah.lp`: a seleção nacional é identificada pelo Country.national_team. */
export function isNationalTeam(club:LeadershipClub):boolean{return club.nationalTeam;}
export type LeaderRole='captain'|'penaltyTaker'|'freeKickTaker'|'cornerTaker';
/** `designated`: a consulta faz limpeza da referência que ficou fora do time. */
export function designatedPlayer(club:LeadershipClub,players:Readonly<Record<string,OwnershipPlayer>>,role:LeaderRole):string|undefined {
 const id=club[role];if(!id)return undefined;
 const player=players[id];if(!player)throw new Error('Designated player absent from global player database');
 if(player.club!==club.id&&!(club.nationalTeam&&club.squad.includes(id))){club[role]=undefined;return undefined;}
 return id;
}
export const captain=(club:LeadershipClub,players:Readonly<Record<string,OwnershipPlayer>>)=>designatedPlayer(club,players,'captain');
export const penaltyTaker=(club:LeadershipClub,players:Readonly<Record<string,OwnershipPlayer>>)=>designatedPlayer(club,players,'penaltyTaker');
export const freeKickTaker=(club:LeadershipClub,players:Readonly<Record<string,OwnershipPlayer>>)=>designatedPlayer(club,players,'freeKickTaker');
export const cornerTaker=(club:LeadershipClub,players:Readonly<Record<string,OwnershipPlayer>>)=>designatedPlayer(club,players,'cornerTaker');
