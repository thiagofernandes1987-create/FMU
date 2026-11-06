/**
 * Port de crates/simulation/src/season.rs: melhores jogadores e seleção da liga.
 * Dependências: classes de países/confederação e classificação fornecidos pelo caller.
 * Efeitos: marca estrelas e worldClass; registra premiação e zera contador callUps.
 * Não controla mudança de calendário nem persistência do World do Rust.
 */
export interface SeasonRated {player?:string;valueAc:number;average:number;ratedGames:number;}
export interface SeasonLeague {id:string;ratings:SeasonRated[];selections:{season:number;players:string[];clubs:(string|undefined)[]}[];bestPlayers:string[];}
export interface SeasonPlayer {id:string;age:number;star:boolean;worldClass:boolean;club?:string;}
export interface SeasonClub {id:string;country:number;}
export interface SeasonWorld {season:number;leagues:{id:string;divIndex:number;minimumRatedGames:number}[];
 leagueById:Record<string,SeasonLeague>;players:Record<string,SeasonPlayer>;clubs:Record<string,SeasonClub>;
 calls:Record<string,number>;confederation:(country:number)=>number;}
export const SEASON_TEAM_SLOTS=[0,1,2,2,5,6,6,3,3,4,4] as const;
/** Rust java_double_compare: NaN acima de números, e -0.0 abaixo de +0.0. */
export function javaDoubleCompare(a:number,b:number):number {
 if(Number.isNaN(a))return Number.isNaN(b)?0:1;if(Number.isNaN(b))return -1;
 if(Object.is(a,-0)&&Object.is(b,0))return -1;
 if(Object.is(a,0)&&Object.is(b,-0))return 1;
 return a<b?-1:a>b?1:0;
}
/** Rust season_awards: ratings ordenados, 11 slots sem duplicar jogadores. */
export function seasonAwards(w:SeasonWorld,leagueId:string,divisionIndex:number,minimum:number):void {
 const league=w.leagueById[leagueId];if(!league)throw Error('Missing league for seasonal awards');
 league.ratings.sort((a,b)=>a.average!==b.average?javaDoubleCompare(b.average,a.average):
  a.ratedGames!==b.ratedGames?javaDoubleCompare(b.ratedGames,a.ratedGames):0);
 const selection={season:w.season,players:[] as string[],clubs:[] as (string|undefined)[]};
 for(const slot of SEASON_TEAM_SLOTS){
  const p=league.ratings.find(r=>r.valueAc===slot&&r.ratedGames>=minimum&&r.player!==undefined&&!selection.players.includes(r.player));
  if(p?.player){selection.players.push(p.player);const player=w.players[p.player];if(!player)throw Error('Missing rated player');selection.clubs.push(player.club);}
 }
 const best=league.ratings.find(r=>r.ratedGames>=minimum&&r.player!==undefined)?.player;
 league.selections.push(selection);
 if(best){league.bestPlayers.push(best);if(divisionIndex===0){const p=w.players[best];if(!p)throw Error('Missing best player');p.star=true;}}
}
/** Rust F.fd: cada prêmio de melhor jogador em diferentes ligas aumenta contador. */
export function countBestPlayerAward(w:SeasonWorld,id:string):void {
 const count=w.calls[id]=(w.calls[id]??0)+1;
 const p=w.players[id];if(!p)throw Error('Missing best player');
 if(p.worldClass||count<2||p.age>=35||!p.club)return;
 const country=w.clubs[p.club]?.country;if(country===undefined)throw Error('Missing player club country');
 const conf=w.confederation(country),earns=conf===0?([1,65,97].includes(country)||[104,72,154].includes(country)&&count>=3):country===29&&count>=4;
 if(earns)p.worldClass=true;
}
/** Rust end_season: premiações de todas as divisões, envelhecimento e contagem de primeiros. */
export function endSeason(w:SeasonWorld):void {
 for(const l of w.leagues)seasonAwards(w,l.id,l.divIndex,l.minimumRatedGames);
 for(const p of Object.values(w.players)){if(p.worldClass&&p.age>34)p.worldClass=false;w.calls[p.id]=0;}
 for(const l of w.leagues.filter(x=>x.divIndex===0))for(const id of w.leagueById[l.id]?.bestPlayers??[])countBestPlayerAward(w,id);
}
