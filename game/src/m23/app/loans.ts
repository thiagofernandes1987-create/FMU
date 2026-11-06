/** Rust crates/app/src/screens/loans.rs: borrowed/lent row selector.
 * I/O: canonical player ownership, loan records. No UI; no ledger mutations. */
export const BORROWED_MAX=4,LENT_MAX=10;
export interface LoanViewRecord {playerId?:string;ownerId?:string;until:number;}
export interface LoanViewRow {playerId:string;clubId?:string;until:number;}
export function loanRows(clubId:string, loans:readonly LoanViewRecord[],playingAt:Readonly<Record<string,string|undefined>>):{borrowed:LoanViewRow[];lent:LoanViewRow[]}{
 const borrowed:LoanViewRow[]=[],lent:LoanViewRow[]=[];
 for(const l of loans){if(!l.playerId)continue;const at=playingAt[l.playerId];
  if(at===clubId)borrowed.push({playerId:l.playerId,clubId:l.ownerId,until:l.until});
  else if(l.ownerId===clubId)lent.push({playerId:l.playerId,clubId:at,until:l.until});}
 return {borrowed,lent};
}
