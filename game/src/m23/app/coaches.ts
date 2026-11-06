/** Rust crates/app/src/screens/coaches.rs: coaches filter by country and
 * rank by reputation, using previous country for unemployed coaches. */
export interface CoachView {id:string;country:number;clubCountry?:number;reputation:number;name:string;}
export function coachCountry(c:CoachView):number{return c.clubCountry??c.country;}
export function listedCoaches(coaches:readonly CoachView[],country?:number,mode:0|1=0):CoachView[]{const r=coaches.filter(c=>country===undefined||coachCountry(c)===country);return mode===1?r.sort((a,b)=>b.reputation-a.reputation):r;}
export function coachReputationKey(rep:number):string{return rep>=0&&rep<6?`teams-reputation-${rep}`:'';}
