/** Fonte: simulation/src/coaches.rs::coach_match_record. Pontos de carreira do técnico.
 * Entradas: tipo da competição, divisão, placar e mandante; sem mutação. */
export function coachMatchPoints22(kind:number,division:number,scored:number,conceded:number,away:boolean):number{
 let points=0;const awayBonus=away&&kind!==5&&kind!==7?1:0;
 if(scored>conceded){
  points=kind===1?(division===1?4:division===2?3:division===3?2:1):[2,6,8].includes(kind)?4:kind===3?1:kind===4||kind===13?5:kind===5?7:kind===7?8:[9,10,11].includes(kind)?2:kind===12?3:kind===14?6:0;
  return points+awayBonus;
 }
 if(scored<conceded)return 0;
 points=awayBonus;
 return kind===1?(division===1?2:division===2?1:points):[2,9,10,12].includes(kind)?1:[4,5,6,7,8,11,13,14].includes(kind)?2:points;
}
