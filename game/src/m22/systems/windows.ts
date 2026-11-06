/** Fonte: systems/src/windows.rs. Janeiro/Julho/Agosto e pré-temporada tardia.
 * Dependências: data do relógio e intervalo anual; funções puras. */
export type LateWindow22={year:number;first:number;last:number};
export function windowOfDay22(month0:number,year:number,dayOrdinal:number,late?:LateWindow22):0|1|2{
 if(month0===6||month0===7)return 2;if(month0===0)return 1;
 return late?.year===year&&dayOrdinal>=late.first&&dayOrdinal<=late.last?1:0;
}
export function nextOpening22(month0:number,year:number):{type:'July'}|{type:'Preseason';year:number}{return month0+1<7?{type:'July'}:{type:'Preseason',year:year+1};}
