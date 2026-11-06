/** Rust crates/app/src/screens/menu.rs::page; computes centered inner column
 * from available width, leaving a 16px margin at either side. EgUI not drawn. */
export type MenuGlyph='Ball'|'Play'|'Folder'|'Import'|'File'|'Power'|'Layers'|'Help';
export function menuColumn(fullWidth:number,requested:number):{width:number;left:number}{
 if(!Number.isFinite(fullWidth)||!Number.isFinite(requested)||fullWidth<32||requested<0)throw new RangeError('Invalid menu dimensions');
 const width=Math.min(requested,fullWidth-32);return {width,left:(fullWidth-width)/2};
}
