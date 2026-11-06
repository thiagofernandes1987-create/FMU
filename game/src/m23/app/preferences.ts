/** Rust crates/app/src/screens/preferences.rs::yes_no/toggle/combo state.
 * Translators and egui painter are UI-only; pure control transitions here. */
export function toggleOption(current:boolean):boolean{return !current;}
export function selectCombo(index:number,numberOfChoices:number):number{if(!Number.isInteger(index)||index<0||index>=numberOfChoices)throw new RangeError('Invalid combo index');return index;}
export function yesNoCode(enabled:boolean):number{return enabled?1:0;}
