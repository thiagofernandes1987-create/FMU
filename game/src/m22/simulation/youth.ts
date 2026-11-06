/** Fonte: simulation/src/youth.rs::generated_player_year e player_year.
 * Regra de aniversário e reset de registros: função pura devolve cópia, RNG externo. */
export interface YouthYearPlayer22 {name:string;age:number;country:number;ratings:unknown[];competitionStats:unknown[];seasonStats:unknown[];careerGames:number;careerGoals:number;}
export function generatedPlayerYear22(p:YouthYearPlayer22,newAge:()=>number,newName:(country:number)=>string):YouthYearPlayer22{
 const result={...p,age:p.age+1,competitionStats:[],ratings:[]};
 if(result.age>35){const age=newAge();if(!Number.isInteger(age)||age<18||age>27)throw RangeError('Invalid age draw');
 result.age=age;result.name=newName(p.country);result.seasonStats=[];result.careerGames=0;result.careerGoals=0;}
 return result;
}
