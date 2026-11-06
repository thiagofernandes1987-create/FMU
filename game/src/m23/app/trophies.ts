/** Rust crates/app/src/screens/trophies.rs::year. Year label for trophies
 * uses startYear -1 + season; the complete painter remains pending. */
export function trophyYear(startYear:number,season:number):number{return startYear-1+season;}
export function groupTrophyCount<T extends {competitionKind:number}>(rows:readonly T[]):Map<number,number>{
 const count=new Map<number,number>();for(const r of rows)count.set(r.competitionKind,(count.get(r.competitionKind)??0)+1);return count;
}
