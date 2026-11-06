/** Rust crates/app/src/screens/management.rs: seven management tabs and
 * UI state invalidation when changing sections; no staff hiring side effects. */
export const MANAGEMENT_TABS=['management-tab-performance','management-tab-staff','management-tab-director','management-tab-scouts','management-tab-loans','management-tab-sponsorship','management-tab-fans'] as const;
export interface ManagementView {tab:number;analysis?:unknown;candidates?:string[];candidate?:number;targets?:string[];target?:number;}
export function newManagementView():ManagementView{return {tab:0};}
export function selectManagementTab(current:ManagementView,tab:number):ManagementView{
 if(!Number.isInteger(tab)||tab<0||tab>=MANAGEMENT_TABS.length)throw new RangeError('Invalid management tab');
 return {...current,tab,analysis:undefined,candidates:undefined,candidate:undefined,targets:undefined,target:undefined};
}
