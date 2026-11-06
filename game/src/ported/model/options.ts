/** M21 — crates/model/src/options.rs (est.Options).
 * Fonte completa do schema/defaults e apply para campos canônicos Game.
 * Não inclui estado de widgets nem serialização `options.bcf` binária. */
export interface GameOptions{
 plays_state:boolean;plays_regionals:boolean;default_state_groups:boolean;
 plays_international_clubs:boolean;plays_all_national_teams:boolean;monthly_salary:boolean;
 individual_skills:boolean;international_in_first_year:boolean;default_international_groups:boolean;
 show_international:boolean[];autosave:number;speed:number;speed_non_human:number;
 show_ai_penalties:number;show_coach_changes:number;show_substitutions_window:number;
 contract_end_warning:number;auto_renew_contracts:boolean;use_scoreboard_color:boolean;
 scoreboard_color:number;use_sounds:boolean;bold_home:boolean;use_list_colors:boolean;
 show_states_grouped:boolean;ignore_leagues:boolean;ignore_state:boolean;
 use_real_cup_groups:boolean;regionals_all:boolean[];regionals_invitation:boolean;
 regionals_without_humans:number;new_cup_format:boolean;theme_color:number;
 show_auctions:boolean;
}
/** Conjunto exato de inicializadores Java do arquivo Rust. */
export function defaultGameOptions():GameOptions{
 return {
 plays_state:true,plays_regionals:true,default_state_groups:true,
 plays_international_clubs:true,plays_all_national_teams:true,monthly_salary:true,
 individual_skills:true,international_in_first_year:true,default_international_groups:false,
 show_international:[true,true,false,false,false,false,true,true,true,true,true,true,true,true,true,false,true,true,true,true,true],
 autosave:0,speed:4,speed_non_human:4,show_ai_penalties:0,show_coach_changes:1,
 show_substitutions_window:1,contract_end_warning:0,auto_renew_contracts:true,
 use_scoreboard_color:true,scoreboard_color:0,use_sounds:true,bold_home:true,
 use_list_colors:false,show_states_grouped:false,ignore_leagues:true,ignore_state:true,
 use_real_cup_groups:false,regionals_all:Array(4).fill(true),regionals_invitation:false,
 regionals_without_humans:0,new_cup_format:true,theme_color:0,show_auctions:false};
}
/** `GameOptions::apply`: o Rust copia somente 27 dos 34 campos para Game.
 * Omitidos (preferências de nova carreira) permanecem fora do destino. */
const APPLIED_KEYS = [
 'show_international','international_in_first_year','default_international_groups',
 'plays_international_clubs','plays_all_national_teams','plays_state','plays_regionals',
 'monthly_salary','individual_skills','ignore_state','default_state_groups','autosave',
 'speed','speed_non_human','show_ai_penalties','show_coach_changes',
 'show_substitutions_window','contract_end_warning','ignore_leagues',
 'auto_renew_contracts','use_scoreboard_color','scoreboard_color','use_sounds',
 'use_list_colors','bold_home','show_states_grouped','use_real_cup_groups',
 'regionals_all','show_auctions'
] as const satisfies readonly (keyof GameOptions)[];
export function applyGameOptions(options:GameOptions,target:Partial<GameOptions>):void{
 for(const key of APPLIED_KEYS){const v=options[key];Object.assign(target,{[key]:Array.isArray(v)?[...v]:v});}
}
