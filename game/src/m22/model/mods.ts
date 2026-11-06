/** M22 partial port model/src/mods.rs::YouthLeagueStats::average and credit stages.
 * Inputs saved scalar DTO; outputs derived rating, no hidden World dependencies. */
export interface YouthLeagueStats22 {games:number;rating_sum:number;goals:number;assists:number}
export function youthLeagueAverage(stats:YouthLeagueStats22):number {
 if(!Number.isFinite(stats.rating_sum)||!Number.isInteger(stats.games))throw Error('Invalid youth stats');
 return stats.games>0?stats.rating_sum/stats.games:0;
}
/** Serialized mod-state keys used for schema safety; not full ModState parser. */
export const MOD_STATE_SECTIONS=[
 'economy','awards','windows','news','staff','academy','fans','master_sponsor','sponsor_slots',
 'investor','assets','stadiums','loans','satellites','credit','super_mundial','youth_league','scouting','cash_book','articles'
] as const;
export function availableModSections(value:Record<string,unknown>):string[]{return MOD_STATE_SECTIONS.filter(k=>Object.hasOwn(value,k));}
