/**
 * Port de `crates/systems/src/awards/history.rs`.
 * Registra Bola de Ouro, Chuteira, Luva, Golden Boy, time ideal e técnico.
 * Entradas: candidatos rankeados de um Season, sem depender de arenas privadas.
 * Efeitos: modifica lista de prêmios; o estado não é salvo automaticamente.
 * Regra: sem replace, a categoria já gravada permanece; ordena ano+tipo.
 */
export const COACH_KEY='tec|';
export type AwardKind='BallonDor'|'GoldenShoe'|'GoldenGlove'|'GoldenBoy'|'TeamOfTheYear'|'CoachOfTheYear';
export const AWARD_KINDS:readonly AwardKind[]=['BallonDor','GoldenShoe','GoldenGlove','GoldenBoy','TeamOfTheYear','CoachOfTheYear'];
export interface AwardCandidate {key:string;name:string;club?:string;country:number;position:number;age:number;
 rating:number;goals:number;assists:number;weightedGoals?:number;slot?:number;}
export interface CoachAwardInput {name:string;club:string;country:number;summary:{campaign?:unknown;titles:unknown[]};}
export interface SeasonAwardsInput {year:number;ballonDor:AwardCandidate[];goldenShoe:AwardCandidate[];
 goldenGlove:AwardCandidate[];goldenBoy:AwardCandidate[];teamOfYear:AwardCandidate[];coach?:CoachAwardInput;}
export interface AwardEntry {year:number;kind:AwardKind;key:string;name:string;club?:string;country:number;position:number;
 age:number;rating:number;goals:number;assists:number;extra?:{type:'weightedGoals'|'slot'|'coach';value:unknown};}
/** `Premios.porJogador`: anos agrupados em ordem de inserção por atleta e categoria. */
export function awardsByPerson(entries:readonly AwardEntry[]):Record<string,Partial<Record<AwardKind,number[]>>> {
 const out:Record<string,Partial<Record<AwardKind,number[]>>>={};
 for(const a of entries){const per=out[a.key]??={};(per[a.kind]??=[]).push(a.year);}return out;
}
/** `Premios.doTipo`: filtra só uma categoria. */
export function awardsOfKind(entries:readonly AwardEntry[],kind:AwardKind):AwardEntry[]{return entries.filter(a=>a.kind===kind);}
function award(c:AwardCandidate,year:number,kind:AwardKind):AwardEntry {
 return {year,kind,key:c.key,name:c.name,club:c.club,country:c.country,position:c.position,
  age:c.age,rating:c.rating,goals:c.goals,assists:c.assists};
}
/** `Premios.registrar`: preserva categorias existentes quando replace=false. */
export function registerSeasonAwards(current:AwardEntry[],input:SeasonAwardsInput,replace:boolean):void {
 const collected:Partial<Record<AwardKind,AwardEntry[]>>={};
 for(const [key,kind] of [['ballonDor','BallonDor'],['goldenShoe','GoldenShoe'],['goldenGlove','GoldenGlove'],['goldenBoy','GoldenBoy']] as const){
  const first=input[key][0];if(first){const entry=award(first,input.year,kind);
   if(kind==='GoldenShoe')entry.extra={type:'weightedGoals',value:first.weightedGoals??first.goals};
   collected[kind]=[entry];}
 }
 const team=input.teamOfYear.map(c=>({...award(c,input.year,'TeamOfTheYear'),extra:{type:'slot' as const,value:c.slot??0}}));
 if(team.length)collected.TeamOfTheYear=team;
 if(input.coach){collected.CoachOfTheYear=[{year:input.year,kind:'CoachOfTheYear',key:COACH_KEY+input.coach.name,
  name:input.coach.name,club:input.coach.club,country:input.coach.country,position:0,age:0,rating:0,
  goals:0,assists:0,extra:{type:'coach',value:input.coach.summary}}];}
 for(const kind of AWARD_KINDS){const group=collected[kind];if(!group?.length)continue;
  const exists=current.some(a=>a.year===input.year&&a.kind===kind);
  if(exists&&!replace)continue;
  for(let i=current.length-1;i>=0;i--)if(current[i]!.year===input.year&&current[i]!.kind===kind)current.splice(i,1);
  current.push(...group);
 }
 current.sort((a,b)=>a.year-b.year||AWARD_KINDS.indexOf(a.kind)-AWARD_KINDS.indexOf(b.kind));
}
