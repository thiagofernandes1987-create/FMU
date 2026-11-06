/**
 * Orquestrador da sequência `crates/systems/src/awards/mod.rs`.
 * Inputs: temporada, estado, serviços do World/Módulos injetados.
 * Efeitos: premiações, Hall of Fame, ídolos, estádio, patrocínio, investidores,
 * categorias base, ativos, nessa ordem. Evita execução duplicada por ano.
 * Limite: marca ano ANTES das chamadas (comportamento Rust); falhas downstream
 * exigem transação do caller e não podem ser tratadas como release transacional.
 */
export interface SeasonEndLifecycleState {season:number;lastAnnounced?:number;}
export interface SeasonEndHooks {
 hasBallonDor():boolean;rankCoaches():void;registerAwards(replace:true):void;
 applyEffects():void;updateHallOfFame():void;registerClubSeasons(replace:true):void;
 superMundialSeasonEnd():void;updateClubIdols():void;stadiumsSeasonEnd():void;
 masterSponsorSeasonEnd():void;investorSeasonEnd():void;sponsorSlotsSeasonEnd():void;
 youthLeagueSeasonEnd():void;assetsSeasonEnd():void;
}
export const AWARDS_EFFECT_ORDER=['rankCoaches','registerAwards','applyEffects','updateHallOfFame','registerClubSeasons',
 'superMundialSeasonEnd','updateClubIdols','stadiumsSeasonEnd','masterSponsorSeasonEnd','investorSeasonEnd',
 'sponsorSlotsSeasonEnd','youthLeagueSeasonEnd','assetsSeasonEnd'] as const;
/** `BolaDeOuro.fimDeTemporada`: a marcação anual impede repetição na mesma execução. */
export function seasonEndAwards(state:SeasonEndLifecycleState,h:SeasonEndHooks):boolean {
 if(state.season===state.lastAnnounced)return false;
 state.lastAnnounced=state.season;
 if(!h.hasBallonDor())return false;
 h.rankCoaches();h.registerAwards(true);h.applyEffects();h.updateHallOfFame();h.registerClubSeasons(true);
 h.superMundialSeasonEnd();h.updateClubIdols();h.stadiumsSeasonEnd();
 h.masterSponsorSeasonEnd();h.investorSeasonEnd();h.sponsorSlotsSeasonEnd();h.youthLeagueSeasonEnd();h.assetsSeasonEnd();
 return true;
}
/** Efeitos de prêmios: 1º Bola de Ouro torna-se world-class; podium e vencedores viram stars. */
export interface AwardEffectsPlayer {id:string;star:boolean;worldClass:boolean;}
export interface AwardEffectsCoach {reputation:number;}
export function applyAwardEffects(ballon:string[],winners:string[],players:Record<string,AwardEffectsPlayer>,coach?:AwardEffectsCoach):void {
 if(ballon.length){const p=players[ballon[0]!];if(!p)throw Error('Missing Ballon dOr player');p.worldClass=true;}
 for(const id of [...ballon.slice(0,3),...winners]){const p=players[id];if(!p)throw Error('Missing award player '+id);p.star=true;}
 if(coach)coach.reputation=Math.min(5,coach.reputation+1);
}
