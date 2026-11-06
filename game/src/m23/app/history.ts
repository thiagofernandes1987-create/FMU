/** Rust crates/app/src/screens/history.rs: all transfers in reverse history
 * order (including zero-fee deals), with date and player/club fallback. */
export interface HistoryTransfer {day:number;month:number;year:number;playerName?:string;playerNumber:number;from:number;to:number;fee:number;}
export function transferHistory(transfers:readonly HistoryTransfer[],clubNames:Readonly<Record<number,string>>):{date:string;player:string;from:string;to:string;fee:number}[]{
 return [...transfers].reverse().map(t=>({date:`${String(t.day).padStart(2,'0')}/${String(t.month).padStart(2,'0')}/${t.year}`,
  player:t.playerName??String(t.playerNumber),from:clubNames[t.from]??'--',to:clubNames[t.to]??'--',fee:t.fee}));
}
