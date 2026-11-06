/** crates/app/src/screens/offer.rs: fields/state and `thousands()` decimal parser.
 * Not a rendered dialog or complete match of offer negotiation. */
export type OfferState={playerId:string;amount:string;feedback?:string;sendNow:boolean};
export function newOfferState(playerId:string):OfferState{return {playerId,amount:'',sendNow:false};}
export function typeOffer(state:OfferState,text:string,send:boolean):OfferState {return {...state,amount:text,feedback:undefined,sendNow:send};}
/** Rust appends '000' then parses i32, rejects negatives/overflows. */
export function parseOfferThousands(text:string):number|undefined{
 const value=text+'000';if(!/^[+-]?\d+$/.test(value))return undefined;
 const number=Number(value);return Number.isInteger(number)&&number>=0&&number<=2147483647?number:undefined;
}
