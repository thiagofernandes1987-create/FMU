/** Rust crates/app/src/screens/search.rs::reset/filter: persists results when clearing
 * controls and handles seven individual attributes versus overall strength. */
export type Range=readonly[number,number];
export interface SearchViewState {name:string;position?:number;side?:number;strength:Range;age:Range;attributes:Range[];valueBand?:number;trait1?:number;trait2?:number;nationality?:number;playingIn?:number;star:boolean;worldClass:boolean;forSale:boolean;forLoan:boolean;results?:string[];selected?:string;sort?:[string,boolean];}
export function emptySearch():SearchViewState{return {name:'',strength:[1,100],age:[16,45],attributes:Array.from({length:7},()=>[1,100] as Range),star:false,worldClass:false,forSale:false,forLoan:false};}
export function resetSearch(s:SearchViewState):SearchViewState{return {...emptySearch(),results:s.results?[...s.results]:undefined,selected:s.selected};}
export function searchFilter(s:SearchViewState,individualSkills:boolean):Record<string,unknown>{
 const out:Record<string,unknown>={name:s.name,position:s.position,side:s.side,valueBand:s.valueBand,trait1:s.trait1,trait2:s.trait2,nationality:s.nationality,playingIn:s.playingIn,star:s.star,worldClass:s.worldClass,forLoan:s.forLoan,forSale:s.forSale};
 if(individualSkills)out.attributes=s.attributes.map(([a,b])=>a>1||b<100?[a,b]:undefined);
 else if(s.strength[0]!==1||s.strength[1]!==100)out.strength=[...s.strength];
 if(s.age[0]!==16||s.age[1]!==45)out.age=[s.age[0],s.age[1]===45?100:s.age[1]];
 return out;
}
