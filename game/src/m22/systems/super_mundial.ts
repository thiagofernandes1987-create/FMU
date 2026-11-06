/** Fonte: systems/src/super_mundial.rs. Periodicidade quadrienal do Super Mundial.
 * Dependências: ano do calendário; sem sorteio de clubes ou organização dos jogos. */
export function superMundialEdition22(year:number):boolean{return year>=2025&&(year-2025)%4===0;}
export function nextSuperMundial22(year:number):number{if(year<=2025)return 2025;return 2025+4*Math.ceil((year-2025)/4);}
