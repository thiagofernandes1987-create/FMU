/** Exact RGB role constants and position colors from Rust crates/app/src/theme.rs.
 * No font bytes are packaged; actual visual rendering requires separate QA. */
export type RGB=readonly[number,number,number];
export const THEME_COLORS={background:'#121a2b',outer:'#0b111e',panel:'#172136',header:'#0f1625',border:'#26324a',text:'#dce2ec',muted:'#8e9ab3',accent:'#3b82f6',selection:'#274a86',rowAlt:'#1b263e'} as const;
/** Rust position_color: 0 GK, 1/2 defense, 3 midfield, all others attack. */
export function themePositionColor(position:number):RGB{
 return position===0?[0xd9,0x9a,0x1e]:position===1||position===2?[0x2f,0x6f,0xd6]:position===3?[0x1f,0x9d,0x63]:[0xd0,0x45,0x4a];
}
