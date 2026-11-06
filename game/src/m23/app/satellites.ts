/** Rust crates/app/src/screens/satellites.rs: financial injection/withdrawal
 * denominations and policy options, with strict membership validation. */
export const SATELLITE_TABS=['satellites-tab-mine','satellites-tab-search','satellites-tab-networks'] as const;
export const SATELLITE_POLICIES=['YoungPlayers','Promotion','Profit'] as const;
export const SATELLITE_INJECTIONS=[5000000,15000000,30000000,60000000,100000000] as const;
export const SATELLITE_WITHDRAWALS=[5000000,15000000,30000000] as const;
export function canSatelliteInject(amount:number):boolean{return (SATELLITE_INJECTIONS as readonly number[]).includes(amount);}
export function canSatelliteWithdraw(amount:number):boolean{return (SATELLITE_WITHDRAWALS as readonly number[]).includes(amount);}
