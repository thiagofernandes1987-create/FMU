/**
 * crates/engine/src/tables.rs::percent — último método desta fonte de constantes.
 * Rust converte operands para f32 antes de multiplicar por 100 e usa Java round.
 * Preservamos arredondamento intermediário IEEE754, relevante nos empates.
 */
export function enginePercent(part:number,total:number):number {
 if(!Number.isInteger(part)||!Number.isInteger(total)||total===0)throw new RangeError('Invalid fraction');
 const f32=Math.fround(Math.fround(part/total)*Math.fround(100));
 return Math.floor(f32+.5);
}
