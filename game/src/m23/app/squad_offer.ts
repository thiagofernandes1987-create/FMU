/** Rust crates/app/src/screens/squad_offer.rs: dismiss offers where the player
 * no longer belongs to a human club; FIFO retained. Does not accept offers. */
export interface PendingSquadOffer {playerId:string;buyerId:string;amount:number;}
export function nextHumanSquadOffer(offers:PendingSquadOffer[],humanPlayer:(id:string)=>boolean):PendingSquadOffer|undefined{
 while(offers.length>0&&!humanPlayer(offers[0]!.playerId))offers.shift();return offers[0];
}
