/** Rust crates/app/src/screens/teams.rs: literal state codes and reputation
 * keys; pure state/country selectors for the team management screen. */
export const BRAZILIAN_STATE_CODES=['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'] as const;
export const REPUTATION_KEYS=Array.from({length:6},(_,i)=>`teams-reputation-${i}`);
export function teamsReputationKey(rep:number):string{return REPUTATION_KEYS[rep]??'';}
export function viewedClubId(current:string,selected?:string):string{return selected??current;}
