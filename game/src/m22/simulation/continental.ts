/** M22 partial port simulation/src/continental.rs::Tie.two/four/separate_countries.
 * Inputs ties and sorted pots with country-of callbacks; mutates work copies only.
 * The full Libertadores/Champions League scheduler remains unported. */
export type ClubCountry22={id:string;country:number};
export function makeContinentalTie22(pots:readonly (readonly ClubCountry22[])[]):ClubCountry22[] {
 if(!pots.length)throw Error('No continental pots');
 const selected:ClubCountry22[]=[];
 for(const pot of pots){if(!pot.length)throw Error('Empty continental pot');
   const pick=pot.find(c=>!selected.some(s=>s.country===c.country))??pot[0]!;selected.push(pick);}
 return selected;
}
/** Swaps first repeated country in a tie with same slot from another non-colliding tie. */
export function separateContinentalCountries22(ties:readonly (readonly ClubCountry22[])[]):ClubCountry22[][] {
 const result=ties.map(t=>[...t]);
 const collisions: Array<[number,number]>=[];
 for(let t=0;t<result.length;t++)for(let i=0;i<result[t]!.length;i++){
  const c=result[t]![i]!;if(result[t]!.some((other,j)=>j!==i&&other.country===c.country)){collisions.push([t,i]);break;}
 }
 for(const [t,i] of collisions){const country=result[t]![i]!.country;
  for(let u=0;u<result.length;u++){
   if(t===u||i>=result[u]!.length)continue;
   const candidate=result[u]![i]!;
   if(!result[u]!.some(q=>q.country===country)&&!result[t]!.some(q=>q.country===candidate.country)){
    const old=result[t]![i]!;result[t]![i]=candidate;result[u]![i]=old;break;
   }
  }
 }
 return result;
}
