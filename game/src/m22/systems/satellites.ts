/** Fonte: systems/src/satellites.rs. Parceria/pertencimento e valor de elenco.
 * Dependências: salários e mercado injetados; sem transferências entre redes. */
export function sameDivision22(a:string,b:string,countries:Readonly<Record<string,string>>,divisions:readonly (readonly string[])[]):boolean{
 return a!==b&&countries[a]===countries[b]&&divisions.some(d=>d.includes(a)&&d.includes(b));
}
/** `partnership_fee`: 15% de salários anuais, piso 2M, múltiplos de 100k. */
export function partnershipFee22(monthlyWages:number):number{
 const yearly=Math.max(0,monthlyWages)*12,gross=Math.max(2000000,Math.floor(yearly*.15+.5));return Math.floor(gross/100000+.5)*100000;
}
export function satelliteSquadValue22(values:readonly number[]):number{return values.reduce((a,b)=>a+Math.max(0,b),0);}
