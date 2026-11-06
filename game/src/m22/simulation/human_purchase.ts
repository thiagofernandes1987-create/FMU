/** Fonte: simulation/src/human/purchase.rs. Disposição a transferir e resposta de preço.
 * Dependências: país/confederação e quantidades de atletas, injetadas. Sem mutação de caixa. */
const ENOUGH=[3,4,4,5,4],SCARCE=[1.5,1.5,1.5,1.5,2,1],SHORT=[1,1,1,1,1.5,2],PREMIUM=[.5,.2,.2,.2,.5,1],DISCOUNT=[15,20,20,10,10,2];
export type Willingness22={code:0|1|2;salary:number};
/** `willingness`: comprador confederação 0 aceita; ramo original da Libertadores. */
export function transferWillingness(x:{buyerConfed:number;buyerRep:number;buyerDivision:number;sellerConfed:number;sellerRep:number;salary:number}):Willingness22{
 if(x.buyerConfed===0)return {code:0,salary:0};
 if(x.sellerConfed===0&&x.sellerRep>=4){
  if(x.buyerRep>=4||x.buyerDivision===1)return {code:0,salary:0};
  if(x.buyerRep>=3)return {code:2,salary:Math.imul(x.salary,2)};
 }else if((x.sellerRep>=3&&x.buyerRep>=3)||(x.sellerRep===3&&(x.buyerRep===1||x.buyerRep===2))||x.sellerRep<=2)return {code:0,salary:0};
 return {code:1,salary:0};
}
export type HumanPurchaseAnswer22={type:'Accepted'|'Refused'|'Unwilling'|'WantsSalary'|'Counter';price?:number;salary?:number};
/** `offer`: atenção ao overflow i32 e à precedência da vontade do atleta. */
export function humanPurchaseOffer(x:{position:number;count:number;value:number;strength:number;age:number;amount:number;buyerCash:number;willingness:Willingness22}):HumanPurchaseAnswer22{
 const i=x.position;if(!Number.isInteger(i)||i<0||i>=5)throw RangeError('Invalid position');
 const round=(rate:number)=>Math.floor(x.value*rate+.5)|0;
 const price=x.count>=ENOUGH[i]!?x.strength>=30&&x.age<=35?(x.value+round(PREMIUM[i]!))|0:(x.value-Math.trunc(Math.imul(x.value,DISCOUNT[i]!)/100))|0:
 x.count===1?(x.value+round(SCARCE[i]!))|0:(x.value+round(SHORT[i]!))|0;
 if(x.amount>=price)return x.willingness.code===1?{type:'Unwilling'}:x.willingness.code===2?{type:'WantsSalary',salary:x.willingness.salary}:{type:'Accepted'};
 if(x.buyerCash>=price&&x.willingness.code!==1)return {type:'Counter',price,...(x.willingness.code===2?{salary:x.willingness.salary}:{})};
 return {type:'Refused'};
}
