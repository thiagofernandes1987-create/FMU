/** Fonte: simulation/src/world_cup_qualifiers.rs::confederation_teams.
 * Port da ordenação por força/valor após filtro da confederação; cadastro externo. */
export interface QualifiedCountry22{id:string;confederation:number;level:number;valueHr:number;hasTeam:boolean;}
export function confederationTeams22(countries:readonly QualifiedCountry22[],confederation:number):string[]{
 return countries.filter(c=>c.confederation===confederation&&c.hasTeam).sort((a,b)=>b.level-a.level||b.valueHr-a.valueHr).map(c=>c.id);
}
