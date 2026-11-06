/** Rust crates/app/src/screens/assets.rs: exact stadium sectors, ticket limits
 * and four-tab asset state. Engine must supply recommended ticket prices. */
import {stadiumViewState,StadiumView,StadiumViewState} from './stadium';
export const ASSET_SECTORS=['assets-sector-general','assets-sector-stand','assets-sector-chairs','assets-sector-box'] as const;
export const ASSET_MAX_TICKET=[200,300,500,1000] as const;
export const ASSET_TABS=['assets-tab-stadium','assets-tab-infra','assets-tab-marketing','assets-tab-ranking'] as const;
export function assetTab(current:number,selected:number):number{return Math.min(ASSET_TABS.length-1,Math.max(0,selected));}
export function assetTicketState(stadium:StadiumView|undefined,enginePrice:()=>readonly number[]):StadiumViewState{return stadiumViewState(stadium,enginePrice,ASSET_MAX_TICKET);}
