/** Fonte: simulation/src/stages.rs::StageOptions::default e new_league_stage.
 * Preflight e DTO; partidas/grupos criados pelo agendador externo. */
export interface StageOptions22 {teams:number;twoRounds:boolean;groups:number;gamesWithinGroup:boolean;knockoutTeams:number;twoLeggedKnockout:boolean[];tiebreak:number;formatCode:number;skipTwoDates:boolean;roundCount:number;}
export function defaultStageOptions22():StageOptions22{return {teams:0,twoRounds:true,groups:0,gamesWithinGroup:true,knockoutTeams:0,twoLeggedKnockout:Array(7).fill(true),tiebreak:0,formatCode:-1,skipTwoDates:false,roundCount:0};}
export function selectedLeagueClubs22(options:StageOptions22,clubs:readonly string[],offset:number):string[]{
 if(options.knockoutTeams===1020||options.teams===68)throw Error('Unsupported original league format');
 if(offset<0||offset+options.teams>clubs.length)throw RangeError('Insufficient league clubs');return clubs.slice(offset,offset+options.teams);
}
