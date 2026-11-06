/** Rust crates/app/src/screens/findings.rs: staff role labels/unlock keys and
 * tactic description key. Rendering and scouting API remain external. */
export type StaffRole='Analyst'|'Assistant'|'FitnessCoach';
export function findingsRoleKey(role:StaffRole):string{return {Analyst:'findings-role-analyst',Assistant:'findings-role-assistant',FitnessCoach:'findings-role-fitness-coach'}[role];}
export function findingsLockKey(role:StaffRole,level:number,what:string):{title:string;args:Record<string,string>;body:string}{return {title:'findings-locked-title',args:{role:findingsRoleKey(role),level:String(level)},body:what};}
export function findingsMeasurementKey(individualSkills:boolean):string{return individualSkills?'findings-measure-pitch':'findings-measure-strength';}
