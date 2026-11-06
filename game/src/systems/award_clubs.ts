/**
 * Port de crates/systems/src/awards/clubs.rs: temporadas, artilheiros, ídolos.
 * Dependências: DTO World/Season e `playerKey` injetado; sem I/O ou DOM.
 * Efeitos: `registerClubSeasons` e `updateIdols` modificam apenas o livro fornecido.
 * Atenção: histórico usa ID numérico legado do clube (não ClubId string do FMU).
 */
export const TOP_IDOLS=10;
export interface ClubAwardSeason {year:number;club:number;name:string;country:number;league?:string;division:number;
 position:number;clubs:number;titles:unknown[];topScorer?:[string,number];coach?:string;}
export interface Idol {club:number;key:string;name:string;country:number;position:number;games:number;goals:number;}
export interface PlayerSeasonStats {clubId:number;season:number;games:number;goals:number;}
export interface AwardPlayer {id:string;key:string;name:string;country:number;position:number;stats:PlayerSeasonStats[];}
export interface ClubSeasonInput {id:string;gameId:number;name:string;country:number;campaign?:{league:string;division:number;position:number;clubs:number};coach?:string;titles:unknown[];}
export interface ClubAwardState {seasons:ClubAwardSeason[];idols:Idol[];}
/** `artilheiros`: artilheiro por id legado; empate mantém primeiro candidato. */
export function topScorers(players:readonly AwardPlayer[],season:number):Record<number,[string,number]> {
 const out:Record<number,[string,number]>={};
 for(const p of players)for(const s of p.stats)if(s.season===season&&s.goals>(out[s.clubId]?.[1]??0))out[s.clubId]=[p.name,s.goals];
 return out;
}
/** `register`: sobrescrever ou manter histórico anual, sem linhas históricas vazias. */
export function registerClubSeasons(state:ClubAwardState,year:number,current:boolean,replace:boolean,
 clubs:readonly ClubSeasonInput[],players:readonly AwardPlayer[]):void {
 if(!replace&&state.seasons.some(x=>x.year===year))return;
 const scorers=topScorers(players,year),newRows:ClubAwardSeason[]=[];
 for(const c of clubs){const camp=current?c.campaign:undefined;
  const row:ClubAwardSeason={year,club:c.gameId,name:c.name,country:c.country,
   league:camp?.league,division:camp?.division??0,position:camp?.position??0,clubs:camp?.clubs??0,
   titles:c.titles,topScorer:scorers[c.gameId],coach:current?c.coach:undefined};
  if(current||row.titles.length||row.topScorer)newRows.push(row);
 }
 state.seasons=state.seasons.filter(x=>x.year!==year).concat(newRows)
  .sort((a,b)=>a.year-b.year||a.club-b.club);
}
/** `history` e `coach_career`: filtros sem modificar o histórico fonte. */
export function clubHistory(state:ClubAwardState,club:number):ClubAwardSeason[] {
 return state.seasons.filter(x=>x.club===club).sort((a,b)=>b.year-a.year);
}
export function coachCareer(state:ClubAwardState,coach:string):ClubAwardSeason[] {
 return state.seasons.filter(x=>x.coach===coach).sort((a,b)=>b.year-a.year);
}
/** `melhores`: 10 melhores artilheiros + 10 mais escalados não repetidos. */
export function bestIdolIndexes(all:readonly Idol[],indexes:readonly number[]):number[] {
 const byGoals=[...indexes].sort((a,b)=>all[b]!.goals-all[a]!.goals);
 const best=byGoals.slice(0,TOP_IDOLS),byGames=[...byGoals].sort((a,b)=>all[b]!.games-all[a]!.games);
 for(const id of byGames.slice(0,TOP_IDOLS))if(!best.includes(id))best.push(id);
 return best;
}
/** `atualizarIdolos`: totais por jogador/clube, conserva máximos e os melhores 10+10. */
export function updateIdols(state:ClubAwardState,players:readonly AwardPlayer[]):void {
 const all=state.idols.map(i=>({...i}));const index=new Map(all.map((r,i)=>[`${r.club}#${r.key}`,i]));
 for(const p of players){const byClub=new Map<number,[number,number]>();
  for(const s of p.stats){const entry=byClub.get(s.clubId)??[0,0];entry[0]+=s.games;entry[1]+=s.goals;byClub.set(s.clubId,entry);}
  for(const [club,[games,goals]] of byClub){if(!games)continue;
   const tag=`${club}#${p.key}`;let pos=index.get(tag);
   if(pos===undefined){pos=all.length;index.set(tag,pos);all.push({club,key:p.key,name:p.name,country:p.country,
    position:p.position,games,goals});}
   const idol=all[pos]!;idol.club=club;idol.key=p.key;idol.name=p.name;idol.country=p.country;
   idol.position=p.position;idol.games=Math.max(idol.games,games);idol.goals=Math.max(idol.goals,goals);
  }
 }
 const grouped=new Map<number,number[]>();all.forEach((idol,i)=>grouped.set(idol.club,[...(grouped.get(idol.club)??[]),i]));
 state.idols=[...grouped.values()].flatMap(ids=>bestIdolIndexes(all,ids).map(i=>all[i]!));
}
export function idolsByClub(state:ClubAwardState):Record<number,Idol[]> {
 const out:Record<number,Idol[]>={};for(const x of state.idols)(out[x.club]??=[]).push(x);return out;
}
