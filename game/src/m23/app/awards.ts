/** Rust crates/app/src/screens/awards.rs: nominations, ranking, tabs and
 * full integer display. egui ceremony/rendering not included. */
export interface AwardCandidate {id:string;name:string;clubId?:string;rating:number;votes:number;}
export function rankedAwardCandidates(xs:readonly AwardCandidate[]):AwardCandidate[]{return [...xs].sort((a,b)=>b.votes-a.votes||b.rating-a.rating);}
export function awardWhole(value:number):string{return value.toFixed(0);}
export function awardOrdinalKey(n:number):{key:string;args:{n:string}}{return {key:'awards-ceremony-ordinal',args:{n:String(n)}};}
