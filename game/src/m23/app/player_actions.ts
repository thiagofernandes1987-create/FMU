/** Rust crates/app/src/screens/player_actions.rs: retirement, selling,
 * loan-listing actions and time-dependent release fee. UI dialogs not ported. */
export function canRetire(age:number):boolean {return age>32;}
export function releaseFeePercent(days:number):number{return days<=0?0:days<=30?12:days<=60?20:days<=90?22:days<=180?25:days<=722?30:35;}
export interface PlayerMenuState {listedForSale:boolean;onLoan:boolean;listedForLoan:boolean;age:number;}
export function playerMenuOptions(s:PlayerMenuState):{action:string;enabled:boolean}[]{return [
 {action:'Contract',enabled:true},{action:'Sell',enabled:!s.listedForSale},{action:'Retire',enabled:canRetire(s.age)},
 {action:'History',enabled:true},{action:'ToggleLoan',enabled:!s.onLoan},
 ];}
export function toggleLoanListing(s:PlayerMenuState):PlayerMenuState{return {...s,listedForLoan:!s.listedForLoan};}
