/** M22 partial port simulation/src/market.rs::squad_counts and buyer eligibility.
 * Input club and player profiles; output squad counts and acceptance; no transactions.
 * Full negotiation, transfer, human approvals and tax ledger are not ported. */
export interface ClubMarket22{squad:readonly string[];leagueClub:boolean;division:number;reputation:number}
export interface MarketPlayer22{id:string;position:number;style:number;strength:number;onLoan:boolean}
export function squadCounts22(club:ClubMarket22,players:Readonly<Record<string,MarketPlayer22>>,withLoans:boolean):[number,number,number,number,number,number] {
 const result:[number,number,number,number,number,number]=[0,0,0,0,0,0];
 for(const id of club.squad){const p=players[id];if(!p)throw Error('Missing market player '+id);
  if(p.position<0||p.position>4||!Number.isInteger(p.position))throw Error('Invalid position');
  if(withLoans||!p.onLoan){result[p.position]!++;if(p.position===3&&p.style===(withLoans?1:0))result[5]++;}
 }return result;
}
export function clubWants22(club:ClubMarket22,p:MarketPlayer22,players:Readonly<Record<string,MarketPlayer22>>,minStrength:number,maxStrength:number,checkSquad:boolean):boolean {
 if(club.squad.length>=35||p.strength<minStrength||p.strength>maxStrength)return false;
 if(checkSquad){const max=[3,5,5,10,5],c=squadCounts22(club,players,false);if(c[p.position]!>max[p.position]!)return false;}
 return true;
}
