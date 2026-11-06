/** M21 — crates/simulation/src/human/stadium.rs.
 * Preço das 4 áreas, prazo de obra e início com lançamento em rubrica 7.
 * Preservado o bug Rust: anos >=2 sempre usam o segundo teto. */
const LIMITS=[[18000,80000,9000,700],[20000,100000,10000,800]] as const;
const PRICES=[[80,160,240,500,700],[120,380,640,700,1400],[300,600,750,800,1200],[1500,3500,4000,6000,6400]] as const;
const BRACKETS=[[1000,2500,3500,10000,18000],[5000,15000,30000,60000,80000],[1000,2000,3000,5000,9000],[100,200,500,600,700]] as const;
export type Seats=[number,number,number,number];
export interface StadiumQuote{cost:number;until:number;seats:Seats;}
export function stadiumCeilings(season:number):Seats{return [...LIMITS[season>=2?1:0]] as Seats;}
export function stadiumSectorCost(sector:number,current:number,add:number):number{
 if(!Number.isInteger(sector)||sector<0||sector>3)throw new RangeError('Invalid stadium sector');
 const bracket=BRACKETS[sector]!.findIndex(v=>current+add<=v);
 return Math.imul(PRICES[sector]![bracket<0?4:bracket]!,add);
}
export function stadiumWorkDays(seats:number):number{return seats<1000?15:seats<10000?20:seats<30000?30:40;}
/** Clock recebe o dia do World e devolve `dateNow`/`addDays` mantendo a hora local. */
export function stadiumQuote(current:readonly number[],add:Seats,startDay:number,addDays:(now:number,days:number)=>number):StadiumQuote|undefined{
 const total=add.reduce((x,y)=>x+y,0);if(total===0)return undefined;
 let cost=100000;for(let i=0;i<4;i++)cost=(cost+stadiumSectorCost(i,current[i]??0,add[i]!))|0;
 return {cost,until:addDays(startDay,stadiumWorkDays(total)),seats:[...add]};
}
export interface StadiumFinance{stadiumId?:string;cash:number;works:{stadiumId:string;until:number;seats:Seats}[];}
export function startStadiumWork(f:StadiumFinance,quote:StadiumQuote,payment:(amount:number,category:7)=>void):boolean{
 if(!f.stadiumId||f.cash<quote.cost)return false;
 payment(quote.cost,7);
 f.works.push({stadiumId:f.stadiumId,until:quote.until,seats:[...quote.seats]});f.cash-=quote.cost;
 return true;
}
