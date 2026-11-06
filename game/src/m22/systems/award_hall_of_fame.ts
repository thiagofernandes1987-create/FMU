/** Fonte: systems/src/awards/hall_of_fame.rs. Elegibilidade de ídolos e pontuação.
 * Dependências: histórico e prêmios computados externamente. */
export interface HallCareer22{key:string;games:number;goals:number;rating:number;retired:boolean;}
export function hallIsLegend22(c:HallCareer22,hasAwards:boolean):boolean{return hasAwards||c.goals>=150||c.games>=500&&c.rating>=7;}
export function hallWorthTracking22(c:HallCareer22,hasAwards:boolean):boolean{return hasAwards||c.goals>=50||c.games>=300;}
export function hallGreatness22(c:HallCareer22,awardPoints:number):number{return c.goals/10+c.games/50+awardPoints;}
