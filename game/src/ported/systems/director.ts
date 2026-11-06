/** M21 — crates/systems/src/director.rs: aconselhamento de reforços para o XI.
 * Fonte Rust escolhe pior tipo de vaga, avalia pelos olhos dos olheiros,
 * filtra clube vendedor humano/nacional e ordena qualidade/chance.
 * Dependências `modValue`, `estimate`, `price` injetadas; sem efeitos. */
import {SLOT_ROLE} from '../../engine/generated/tables';
export const TYPICAL_SLOTS=[1,4,2,10,12,15,21,18] as const;
export interface DirectorPlayer{id:string;owner?:string;position:number;age:number;slot:number;starter:boolean;onLoan:boolean;star:boolean;worldClass:boolean;}
export interface DirectorClub{id:string;reputation:number;cash:number;human:boolean;nationalTeam:boolean;squad:string[];}
export interface DirectorContext{players:Record<string,DirectorPlayer>;clubs:Record<string,DirectorClub>;
 modValue(player:string,slot:number):number;estimate(player:string,slot:number):number;price(player:string,seller:string):number;}
export interface DirectorTarget{player:string;club:string;slot:number;price:number;chance:number;}
function club(c:DirectorContext,id:string):DirectorClub{const x=c.clubs[id];if(!x)throw new Error('Missing director club');return x;}
function player(c:DirectorContext,id:string):DirectorPlayer{const x=c.players[id];if(!x)throw new Error('Missing director player');return x;}
/** `slot_kind`: mapeamento do Motor, preserva tipagem do atacante. */
export function slotKind(slot:number):number{
 if(slot===1)return 0;if(slot>=3&&slot<=8)return 1;
 if(slot===2||slot===9)return 2;if(slot===10||slot===17)return 3;
 if(slot>=11&&slot<=13)return 4;if(slot>=14&&slot<=16)return 5;
 if(slot===18||slot===25)return 7;return 6;
}
export function directorTargetKind(c:DirectorContext,id:string):number{
 const total=Array(8).fill(0) as number[],count=Array(8).fill(0) as number[];
 for(const pId of club(c,id).squad){const p=player(c,pId);if(!p.starter)continue;
  const k=slotKind(p.slot);total[k]=total[k]!+c.modValue(pId,p.slot);count[k]=count[k]!+1;
 }
 let worst=-1;for(let i=0;i<8;i++)if(count[i]!>0&&(worst<0||total[i]!/count[i]!<total[worst]!/count[worst]!))worst=i;
 return worst<0?6:worst;
}
export function directorChance(p:DirectorPlayer,seller:DirectorClub,buyer:DirectorClub):number{
 const gap=buyer.reputation-seller.reputation;
 const chance=(gap>=1?85:gap===0?65:gap===-1?35:gap===-2?15:5)-(p.worldClass?20:p.star?10:0);
 return Math.max(5,Math.min(95,chance));
}
export function directorTargets(c:DirectorContext,myId:string,limit:number):DirectorTarget[]{
 if(!Number.isInteger(limit)||limit<0)throw new RangeError('Invalid director target limit');
 const mine=club(c,myId),kind=directorTargetKind(c,myId),slot=TYPICAL_SLOTS[kind]!;
 const position=SLOT_ROLE[slot]![0];
 let sum=0,n=0;for(const id of mine.squad){const p=player(c,id);
  if(p.starter&&slotKind(p.slot)===kind){sum+=c.modValue(id,p.slot);n++;}}
 const minimum=Math.floor((n?sum/n:0)+3+.5);
 const out:DirectorTarget[]=[];
 for(const p of Object.values(c.players)){
  if(!p.owner||p.owner===myId)continue;
  const seller=club(c,p.owner);
  if(seller.human||seller.nationalTeam||p.onLoan||p.position!==position||p.age<18||p.age>31)continue;
  if(c.estimate(p.id,slot)<minimum)continue;
  const price=c.price(p.id,p.owner);if(price>mine.cash*.8)continue;
  const chance=directorChance(p,seller,mine);
  if(chance>=10)out.push({player:p.id,club:p.owner,slot,price,chance});
 }
 return out.sort((a,b)=>c.estimate(b.player,b.slot)-c.estimate(a.player,a.slot)||b.chance-a.chance).slice(0,limit);
}
