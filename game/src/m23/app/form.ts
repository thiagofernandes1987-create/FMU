/** Rust crates/app/src/screens/form.rs: money field input step and i64 bounds.
 * Provides parsing/stepper behavior only; egui layout remains pending. */
export const FORM_WIDTH=420;
export function moneyStepper(text:string,step:bigint,delta:-1|1,min:bigint,max:bigint):string{
 let value:bigint;try{value=BigInt(text.trim());}catch{value=min;}
 const next=value+BigInt(delta)*step;return (next<min?min:next>max?max:next).toString();
}
