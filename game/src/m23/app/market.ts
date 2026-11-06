/** Rust crates/app/src/screens/market.rs::season_deals: positive transfers for
 * the economy year, stable sort descending by fee and date as dd/mm/yyyy. */
export type TransferView={playerId:string;fromId?:string;toId?:string;fee:number;year:number;month:number;day:number;};
export type MarketDealRow={playerId:string;fromId?:string;toId?:string;fee:number;date:string;};
export function seasonDeals(transfers:readonly TransferView[],economyYear:number):MarketDealRow[]{
 return transfers.filter(t=>t.fee>0&&t.year===economyYear).map(t=>({playerId:t.playerId,fromId:t.fromId,toId:t.toId,fee:t.fee,date:`${t.day}/${t.month}/${t.year}`})).sort((a,b)=>b.fee-a.fee);
}
