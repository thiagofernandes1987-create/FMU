/** Rust crates/app/src/screens/team_of_round.rs: country/division selection,
 * period indexes, last available year or round; no egui rendering. */
export interface SelectionLeague {competitionId:string;clubs:string[];rounds:number;years:number;}
export interface SelectionCountry {divisions:SelectionLeague[];}
export interface TeamOfRoundSelection {year:boolean;country:number;division:number;period?:number;}
export function defaultTeamOfRound(countries:readonly SelectionCountry[],clubId:string,year:boolean):TeamOfRoundSelection {
 let selected={year,country:0,division:0,period:undefined as number|undefined};
 for(let i=0;i<countries.length;i++)for(let d=0;d<countries[i]!.divisions.length;d++){
  const lg=countries[i]!.divisions[d]!;if(lg.clubs.includes(clubId)){selected={...selected,country:i,division:d};}
 }
 return pickLastTeamPeriod(selected,countries);
}
export function pickLastTeamPeriod(s:TeamOfRoundSelection,countries:readonly SelectionCountry[]):TeamOfRoundSelection {
 const lg=countries[s.country]?.divisions[s.division];const n=lg?(s.year?lg.years:lg.rounds):0;return {...s,period:n>0?n-1:undefined};
}
