/** M21 — crates/model/src/ids.rs: índices de arena em u32. Sem dependências;
 * tipos nominais impedem usar PlayerId como ClubId no TS. */
export type ArenaKind='PlayerId'|'ClubId'|'CoachId'|'StadiumId'|'MatchId'|'CompetitionId'|'StageId'|'CountryId'|'StateLeagueId';
export type ArenaId<K extends ArenaKind> = Readonly<{kind:K,index:number}>;
/** `id!`: u32 validado; a referência serializa para número legível em save. */
export function arenaId<K extends ArenaKind>(kind:K,index:number):ArenaId<K> {
 if(!Number.isInteger(index)||index<0||index>0xffffffff)throw new RangeError('Invalid u32 arena index');
 return Object.freeze({kind,index});
}
export function arenaIndex<K extends ArenaKind>(id:ArenaId<K>,kind:K):number {
 if(id.kind!==kind)throw new Error(`Arena type mismatch ${id.kind} !== ${kind}`);
 return id.index;
}
export const PLAYER_KIND='PlayerId' as const;export const CLUB_KIND='ClubId' as const;
