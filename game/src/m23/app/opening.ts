/** Rust crates/app/src/screens/opening.rs: opening screen reads latest save;
 * the file system is injected and save sorting is not inferred by this module. */
export interface SaveEntry {path:string;timestamp:number;label:string;}
export type OpeningView={latest?:SaveEntry;error?:string};
export function openingView(sortedSaves:readonly SaveEntry[]):OpeningView{return {latest:sortedSaves[0]};}
