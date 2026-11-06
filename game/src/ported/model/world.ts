/** M21 — crates/model/src/world.rs (métodos do World das arenas Rust).
 * Nove arenas acessadas por `index`; cálculos da conta e temporização.
 * Adaptação: `WorldState` é DTO mutável, não um decodificador .bfn.
 * As operações financeiras não criam dupla-entrada: reproduzem `best.ah`.
 * Alterações: clubIncome/clubPayment/clubExpense registram rubricas do humano. */
export interface WorldPlayer{salary:number;}
export interface WorldFinances{incomeTransfers:number;incomeType3:number;incomeType5:number;incomeType6:number;incomeType9:number;expenseTransfers:number;expenseType4:number;expenseType7:number;expenseType8:number;expenseOther:number;expenseSalaries:number;}
export interface WorldClub{id:number;cash:number;human:boolean;squad:number[];youthSquad:number[];finances:WorldFinances;}
export interface WorldCountry{nationalTeam?:number;}
export interface WorldCoach{id:number;}
export interface WorldState {game:{season:number;day:number;days:{date:number}[];clubs:number[];countries:number[]};
 players:WorldPlayer[];clubs:WorldClub[];coaches:WorldCoach[];countries:WorldCountry[];}
function at<T>(list:T[],id:number):T{const x=list[id];if(!x)throw new RangeError('Invalid World arena index '+id);return x;}
/** `today_millis`: dia atual; ausência devolve 0. */
export function worldToday(w:WorldState):number{return w.game.days[Math.max(0,w.game.day)]?.date??0;}
export function worldSeason(w:WorldState):number{return w.game.season;}
/** `club_by_game_id`: primeiro game.clubs, depois seleções. */
export function clubByGameId(w:WorldState,gameId:number):number|undefined {
 const c=w.game.clubs.find(id=>at(w.clubs,id).id===gameId);if(c!==undefined)return c;
 return w.game.countries.map(k=>at(w.countries,k).nationalTeam)
  .find(id=>id!==undefined&&at(w.clubs,id).id===gameId);
}
export function coachByGameId(w:WorldState,gameId:number):number|undefined {
 const x=w.coaches.findIndex(c=>c.id===gameId);return x>=0?x:undefined;
}
export function clubWages(w:WorldState,id:number):number {
 const c=at(w.clubs,id);return [...c.squad,...c.youthSquad].reduce((sum,p)=>sum+at(w.players,p).salary,0);
}
/** `club_income`: rubricas 1,3,5,6,9 e caixa; não conta outras entradas de humano. */
export function clubIncome(w:WorldState,id:number,amount:number,kind:number):void{
 const c=at(w.clubs,id);c.cash+=amount;
 if(!c.human)return;
 const f=c.finances;
 if(kind===1)f.incomeTransfers+=amount;
 else if(kind===3)f.incomeType3+=amount;
 else if(kind===5)f.incomeType5+=amount;
 else if(kind===6)f.incomeType6+=amount;
 else if(kind===9)f.incomeType9+=amount;
}
/** `club_payment`: rubricas 1,4,7,8 e despesas outras. */
export function clubPayment(w:WorldState,id:number,amount:number,kind:number):void {
 const c=at(w.clubs,id);c.cash-=amount;
 if(!c.human)return;
 const f=c.finances;
 if(kind===1)f.expenseTransfers+=amount;
 else if(kind===4)f.expenseType4+=amount;
 else if(kind===7)f.expenseType7+=amount;
 else if(kind===8)f.expenseType8+=amount;
 else f.expenseOther+=amount;
}
/** `club_expense`: a rubrica salários, sem confundir com outras despesas. */
export function clubExpense(w:WorldState,id:number,amount:number):void{
 const c=at(w.clubs,id);c.cash-=amount;if(c.human)c.finances.expenseSalaries+=amount;
}
export function emptyWorldFinances():WorldFinances{return {incomeTransfers:0,incomeType3:0,incomeType5:0,
 incomeType6:0,incomeType9:0,expenseTransfers:0,expenseType4:0,expenseType7:0,expenseType8:0,
 expenseOther:0,expenseSalaries:0};}
