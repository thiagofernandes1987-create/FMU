/** Rust crates/app/src/screens/modkit.rs: Cell data builder for statistics
 * and textual tables. Egui painting remains pending. */
export interface ModkitCell {text:string;flag?:number;color?:string;bold:boolean;right:boolean;}
export function plainCell(text:string):ModkitCell{return {text,bold:false,right:false};}
export function coloredCell(text:string,color:string):ModkitCell{return {...plainCell(text),color};}
export function strongCell(text:string):ModkitCell{return {...plainCell(text),bold:true};}
export function rightCell(cell:ModkitCell):ModkitCell{return {...cell,right:true};}
export function flaggedCell(text:string,country:number):ModkitCell{return {...plainCell(text),flag:country};}
export const MODKIT_COLORS={gold:'#e8be50',darkGold:'#96731e',green:'#5ac878',lightBlue:'#6eb4f5',red:'#e5484d',soft:'#b8c0cc'} as const;
