/** Rust crates/app/src/screens/controls.rs::tabs/segmented selection.
 * Selected tab changes only if within range and enabled. No egui geometry claim. */
export function nextTabIndex(current:number,clicked:number|undefined,choices:readonly {enabled:boolean}[]):number{
 if(clicked===undefined)return current;
 return clicked>=0&&clicked<choices.length&&choices[clicked]?.enabled?clicked:current;
}
