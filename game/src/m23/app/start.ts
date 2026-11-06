/** Rust crates/app/src/screens/start.rs::new/start: lists saved careers and
 * original saves; import/open are injected, never run silently. */
export interface SavedCareerMeta {path:string;club:string;coach:string;season:number;date:string;}
export interface StartView {careers:SavedCareerMeta[];originalSaves:string[];path:string;error?:string;}
export function newStartView(careers:readonly SavedCareerMeta[],originalSaves:readonly string[]):StartView{return {careers:[...careers],originalSaves:[...originalSaves],path:''};}
export function selectSavedCareer(s:StartView,index:number):string|undefined{return s.careers[index]?.path;}
