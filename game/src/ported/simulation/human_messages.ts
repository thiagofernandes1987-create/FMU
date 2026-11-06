/** M21 — crates/simulation/src/human/messages.rs: leitura e aplicação de multa.
 * Hook externo é responsável pelo lançamento contábil e envio de mensagens. */
export interface HumanMessage{read:boolean;flagRz:boolean;valueSc:number;amount:number;text3:string;}
export interface HumanMessages{messages:HumanMessage[];}
export interface FineHooks{income(amount:number,category:9):void;freshInt(bound:number):number;send(kind:10,text:number,player:string,extra:string):void;}
export function readHumanMessage(inbox:HumanMessages,index:number):void{if(inbox.messages[index])inbox.messages[index]!.read=true;}
export function answerHumanFine(inbox:HumanMessages,index:number,fine:boolean,hooks:FineHooks):boolean{
 const m=inbox.messages[index];if(!m)return false;
 m.flagRz=false;if(!fine||m.valueSc!==1||m.amount<=0)return false;
 hooks.income(m.amount,9);
 const roll=hooks.freshInt(100);if(!Number.isInteger(roll)||roll<0||roll>=100)throw new RangeError('Invalid RNG result');
 if(roll>50){const text=hooks.freshInt(4);if(!Number.isInteger(text)||text<0||text>=4)throw new RangeError('Invalid RNG result');hooks.send(10,text+16,m.text3,'');}
 return true;
}
