/** FMU M23 — DTOs utilizados pelos seletores de telas (não são widgets).
 * Os consumidores devem fornecer IDs reais e dados canônicos do World.
 * Este módulo é infraestrutura TS, não conta como arquivo Rust convertido. */
export type Id=string;
export interface PlayerRow {id:Id;name:string;clubId?:Id;position:number;side?:number;strength:number;age:number;marketValue:number;salary?:number;goals?:number;assists?:number;games?:number;loan?:boolean;listedForLoan?:boolean;listedForSale?:boolean;reputation?:number;contractUntil?:number;}
export interface ClubRow {id:Id;name:string;country:number;reputation:number;rankingPoints:number[];allTimeRecord:number[][];coachId?:Id;}
export interface MatchRow {id:Id;home:Id;away:Id;date:number;season:number;kind:number;homeGoals?:number;awayGoals?:number;played?:boolean;}
export interface LeagueRow {id:Id;country:number;division:number;clubs:Id[];}
export function assertNonnegativeNumber(value:number,name:string):void {if(!Number.isFinite(value)||value<0)throw new RangeError('Invalid '+name);}
export function stableRank<T>(xs:readonly T[],compare:(a:T,b:T)=>number):T[]{return [...xs].sort(compare);}
