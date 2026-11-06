/** Rust crates/app/src/screens/training.rs::available.
 * Training available only to a selected club when individualSkills are active. */
export function trainingAvailable(clubId:string|undefined,individualSkills:boolean):boolean {
 return clubId!==undefined&&individualSkills;
}
