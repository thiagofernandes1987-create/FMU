/** M21 — crates/engine/src/stadium.rs: preços padrão e bilheteria da partida.
 * Port das fórmulas Rust com injeção explícita da fonte `freshInt`.
 * Efeitos: puro sobre a arena; retorna attendance[4] e income para persistência. */
const DEFAULT_PRICES=[
 [[5,15,20,30],[3,12,15,25]],
 [[3,12,15,30],[10,15,25,80],[7,13,20,70],[5,12,17,40],[3,12,15,30]],
 [[3,12,15,30],[3,12,15,30],[3,12,15,30],[7,13,20,70],[10,15,25,80],[10,15,25,80]],
 [[3,5,12,20],[3,12,15,30],[3,12,15,30],[5,12,20,50],[10,15,25,70],[10,15,25,70]],
 [[30,45,65,200],[20,35,55,150]],[[0,0,0,0]],[[20,25,45,150],[20,25,40,120]],
 [[0,0,0,0]],[[20,25,45,150],[20,25,40,120]]];
const BASE=[[200,500,50,0],[1000,5000,1200,20],[2000,10000,1500,50],
 [4000,20000,2500,300],[4500,30000,3500,400],[5000,40000,5500,500]];
const NOISE=[[10,20,5,0],[100,500,200,10],[300,1000,400,20],[400,1200,500,30],[500,1500,1000,50]];
export interface MatchGateInput {kind:number;subkind:number;knockout:boolean;homeReputation:number;awayReputation:number;division:number;confederation:number;capacity:readonly [number,number,number,number];automaticPrices:boolean;ticketPrices:readonly [number,number,number,number];fanSupport:number;}
export interface GateResult {attendance:[number,number,number,number];income:number;prices:[number,number,number,number];}
const round=(x:number)=>Math.floor(x+.5);
function chosen(matrix:readonly (readonly number[])[],row:number):[number,number,number,number]{const x=matrix[row];if(!x||x.length!==4)throw new RangeError('Invalid gate price table');return [x[0]!,x[1]!,x[2]!,x[3]!];}
/** `v.a`: seleção pelo kind, divisão, reputação e confederação mínima. */
export function defaultTicketPrices(kind:number,division:number,reputation:number,confederation:number):[number,number,number,number]{
 if(kind===10)kind=2;
 if(kind===1||kind===5||kind===7)return chosen(DEFAULT_PRICES[1]!,division);
 if(kind===2||kind===3)return chosen(DEFAULT_PRICES[kind]!,reputation);
 if(kind===4||kind===6||kind===8)return chosen(DEFAULT_PRICES[kind]!,Math.min(confederation,1));
 return [10,25,35,50];
}
/** `v.b`: sorteios por setor, torcida, rival e tipo de competição. */
export function playGate(input:MatchGateInput,freshInt:(bound:number)=>number):GateResult{
 const {kind,subkind,capacity,division,homeReputation,awayReputation}=input;
 if(homeReputation<0||homeReputation>=BASE.length||division<0||division>=NOISE.length)throw new RangeError('Invalid gate reputation/division');
 const priceDefault=defaultTicketPrices(kind,division,homeReputation,input.confederation);
 let crowd=chosen(BASE,homeReputation);
 if(kind===3||kind===10)crowd=crowd.map(v=>round(v*.7)) as GateResult['attendance'];
 if(kind===0)crowd=crowd.map(v=>round(v*.4)) as GateResult['attendance'];
 let share=.3;if(input.knockout)share+=.15;
 if(kind===4||kind===7||kind===9)share+=.3;
 else if(kind===6||kind===8||kind===11)share+=.15;
 for(let i=0;i<4;i++)crowd[i]=crowd[i]!+round(capacity[i]!*share);
 const gap=awayReputation-homeReputation;
 if(Math.abs(gap)>5)throw new RangeError('Reputation gap outside 0..5');
 const factor=[0,.05,.1,.15,.2,.25][Math.abs(gap)]!;
 for(let i=0;i<4;i++)crowd[i]=crowd[i]!+(gap>0?round(crowd[i]!*factor):gap<0?-round(crowd[i]!*factor):0);
 for(let i=0;i<4;i++)crowd[i]=round(crowd[i]!*input.fanSupport/100);
 for(let i=0;i<4;i++){const bound=NOISE[division]![i]!;
  if(bound>0){const roll=freshInt(bound);if(!Number.isInteger(roll)||roll<0||roll>=bound)throw new RangeError('Invalid gate RNG');crowd[i]=crowd[i]!+roll;}
 }
 const prices=input.automaticPrices?priceDefault:[...input.ticketPrices] as GateResult['prices'];
 if(!input.automaticPrices)for(let i=0;i<4;i++){
  const diff=priceDefault[i]!-prices[i]!;
  if(diff!==0)crowd[i]=crowd[i]!+round(.03*crowd[i]!)*diff;
 }
 let income=0;for(let i=0;i<4;i++){
  crowd[i]=Math.min(capacity[i]!,Math.max(0,crowd[i]!));income+=crowd[i]!*prices[i]!;
 }
 if(kind===7)income*=subkind===7?5:3;
 else if(kind===9)income*=2;
 return {attendance:crowd,income,prices};
}
