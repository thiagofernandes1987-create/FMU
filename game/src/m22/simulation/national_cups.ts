/** M22 partial port simulation/src/national_cups.rs::four_pots_order and 4 cup configurations.
 * Input groups count and shuffle callback; output seeded pot order.
 * Source uses shuffled blocks 0,2,1,3 per group, no mutation of country state. */
export interface NationalCupSpec22{confederation:number;picks:number;teams:number;groups:number;bestThirds:boolean;hosts:readonly number[]}
export const NATIONAL_CUPS22:Readonly<Record<string,NationalCupSpec22>>={
 africa:{confederation:2,picks:23,teams:24,groups:6,bestThirds:true,hosts:[36,50,81,190,57,141,1,5,129,10]},
 asia:{confederation:3,picks:23,teams:24,groups:6,bestThirds:true,hosts:[43,107,59,14,98,174,39,49,99,199]},
 oceania:{confederation:5,picks:7,teams:8,groups:2,bestThirds:false,hosts:[143,148,93,184,143,148,93,184,143,148]},
 gold:{confederation:4,picks:16,teams:16,groups:4,bestThirds:false,hosts:[131,68,38,51,53,131,68,139,131,68]}
};
export function fourPotsOrder22(groups:number,shuffle:(pot:number[])=>void):number[] {
 if(!Number.isInteger(groups)||groups<1||groups>200)throw Error('Invalid pot groups');
 const pots=Array.from({length:4},(_,p)=>Array.from({length:groups},(_,i)=>p*groups+i));
 for(const pot of pots)shuffle(pot);
 const order:number[]=[];for(let i=0;i<groups;i++)for(const j of [0,2,1,3])order.push(pots[j]![i]!);
 return order;
}
