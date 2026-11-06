/** M22 partial port: persistence/src/migrations.rs, CBOR-to-JSON shape migrations.
 * Inputs: decoded map arrays; outputs cloned migrated value. Uses existing model/save_numbers semantics.
 * Side effects: none, no native CBOR parser; preserves unknown keys and rows. */
export type MigrationWorld={game:{players?:number[];youth_players?:number[];transfers?:Array<{player?:number;player_number?:number;player_list?:number}>;[k:string]:unknown};players:Array<Record<string,unknown>>;[k:string]:unknown};
export function addSaveNumbers(world:MigrationWorld):MigrationWorld {
 const w=JSON.parse(JSON.stringify(world)) as MigrationWorld;
 const map=new Map<number,readonly [number,number]>();let number=0;
 for(const [list,ids] of [[1,w.game.players??[]],[2,w.game.youth_players??[]]] as const){for(const index of ids){if(index>=0&&index<w.players.length)map.set(index,[number,list]);number++;}}
 for(let index=0;index<w.players.length;index++){
  const item=w.players[index]!;const [n,l]=map.get(index)??[-1,-1];item.save_number=n;item.save_list=l;
 }
 for(const t of w.game.transfers??[]){const [n,l]=map.get(t.player??-1)??[-1,-1];t.player_number=n;t.player_list=l;}
 return w;
}
/** v3: actual GAME rename table copied from Rust. Keeps old unknown fields. */
export const GAME_RENAMES:Readonly<Record<string,string>>={
 value_bl:'world_cup_season',value_bm:'euro_season',value_bn:'copa_america_season',value_bo:'africa_cup_season',
 value_bp:'asian_cup_season',value_bq:'oceania_cup_season',value_br:'gold_cup_season',value_iz:'finalissima_season',
 value_ja:'nations_league_m_season',value_jb:'nations_league_n_season',value_bg:'next_club_id',
 qualifiers_n:'south_american_qualifiers',qualifiers_i:'african_qualifiers',qualifiers_playoff:'asian_qualifiers',
 qualifiers_m:'oceania_qualifiers',qualifiers_k:'concacaf_qualifiers'};
export function renameTournamentFields<T extends Record<string,unknown>>(game:T):Record<string,unknown> {
 const r={...game};for(const [a,b] of Object.entries(GAME_RENAMES))if(Object.hasOwn(r,a)){(r as Record<string,unknown>)[b]=r[a];delete (r as Record<string,unknown>)[a];}return r;
}
