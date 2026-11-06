/** Fonte: simulation/src/national_teams.rs. Ordem de seleção e quantidade mínima de atletas.
 * As equipes nacionais e convocações reais são dependências ainda externas. */
export interface NationalCandidate22 {id:string;country:number;position:number;style:number;strength:number;star:boolean;}
export function nationHasEnoughPlayers22(players:readonly NationalCandidate22[],country:number):boolean{
 const all=players.filter(p=>p.country===country);return all.filter(p=>p.position===0).length>=2&&all.filter(p=>p.position!==0).length>=16;
}
export function sortNationalCandidates22(players:readonly NationalCandidate22[]):NationalCandidate22[]{
 return [...players].sort((a,b)=>a.position-b.position||a.style-b.style||b.strength-a.strength||Number(b.star)-Number(a.star));
}
