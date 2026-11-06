/** Rust crates/app/src/screens/home.rs: default column sort direction and squad listing.
 * Value extraction is supplied from the game world (do not infer hidden player data). */
export const HOME_ASCENDING_COLUMNS=['squad-column-name','squad-column-position','squad-column-side','squad-column-traits','squad-column-age'] as const;
export function homeDefaultDescending(key:string):boolean{return !(HOME_ASCENDING_COLUMNS as readonly string[]).includes(key);}
export function sortedHomeSquad<T>(players:readonly T[],key:string,getValue:(p:T,key:string)=>number|string,descending=homeDefaultDescending(key)):T[]{
 const direction=descending?-1:1;return [...players].sort((a,b)=>{const x=getValue(a,key),y=getValue(b,key);return direction*(typeof x==='string'&&typeof y==='string'?x.localeCompare(y,'pt-BR'):Number(x)-Number(y));});
}
