/** M22 partial port engine/src/lineup.rs::available/sort_by_strength/formation_for.
 * Inputs player state and optional match; pure eligibility and sorting functions.
 * Picking the whole 11-player line-up still requires World and formation tables. */
export interface LineupAthlete22{id:string;strength:number;fitness:number;contractUntil:number;injuredUntil:number;suspended:boolean;humanClub:boolean}
export function eligibleForLineup22(p:LineupAthlete22,today:number,competition:boolean,ignoreContract=false):boolean {
 if(p.injuredUntil>today)return false;
 if(competition&&p.suspended)return false;
 if(!ignoreContract&&p.humanClub&&p.contractUntil<today)return false;
 return true;
}
export function sortLineupStrength22(ps:readonly LineupAthlete22[]):LineupAthlete22[] {return [...ps].sort((a,b)=>b.strength-a.strength||b.fitness-a.fitness);}
/** Rust draw is inclusive 0..101; 39..49 maps formation index 5. */
export function lineupFormationDraw22(draw:number):number {
 if(!Number.isInteger(draw))throw Error('Invalid formation draw');
 if(draw<=2)return 1;if(draw<=4)return 2;if(draw<=7)return 3;if(draw<=38)return 4;if(draw<=49)return 5;
 if(draw<=60)return 6;if(draw<=65)return 7;if(draw<=72)return 8;if(draw<=90)return 9;if(draw<=92)return 10;if(draw<=101)return 11;return 4;
}
