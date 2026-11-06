/** Rust crates/app/src/screens/stadium.rs::StadiumState::new.
 * `default_prices` is injected from the engine; no invented ticket algorithm. */
export interface StadiumView {automaticPrices:boolean;ticketPrices:readonly number[];}
export interface StadiumViewState {prices:[number,number,number,number];auto:boolean;}
export function stadiumViewState(stadium:StadiumView|undefined,engineDefaultPrices:()=>readonly number[],maxPrice:readonly number[]):StadiumViewState{
 if(!stadium)return {prices:[0,0,0,0],auto:true};
 const shown=stadium.automaticPrices?engineDefaultPrices():stadium.ticketPrices;
 if(maxPrice.length<4||shown.length<4)throw new RangeError('Missing ticket prices');
 return {prices:[0,1,2,3].map(i=>Math.max(1,Math.min(maxPrice[i]!,shown[i]!))) as [number,number,number,number],auto:stadium.automaticPrices};
}
