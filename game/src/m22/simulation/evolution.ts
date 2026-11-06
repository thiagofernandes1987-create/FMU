/** Fonte: simulation/src/evolution.rs::country_ceiling. Limites nacionais de força.
 * Compatível com valores por confederação, sem mutação ou consumo RNG. */
export function countryStrengthCeiling22(confederation:number,country:number):number{
 switch(confederation){
  case 0:return [3,72,104,65,97].includes(country)?95:[154,85].includes(country)?90:[21,162].includes(country)?80:70;
  case 1:return [29,11].includes(country)?90:[195,46,42].includes(country)?80:[151,150].includes(country)?70:60;
  case 2:return [10,129,57].includes(country)?75:[141,169,190].includes(country)?70:60;
  case 3:return [107,49].includes(country)?75:[98,9,59,43].includes(country)?70:60;
  case 4:return country===131?80:country===68?70:country===51?65:55;
  case 5:return country===143?60:45;
  default:return 100;
 }
}
