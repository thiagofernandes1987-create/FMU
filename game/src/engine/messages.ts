/**
 * Port funcional: crates/engine/src/messages.rs, notices do treinador.
 * Dependências: relógio do World, inbox, `javaRound`; nenhum formato HTML.
 * Efeito: append de mensagem na inbox. Composição de títulos preserva IDs e valores.
 */
export interface EngineMessage {
 sender:number;messageId:number;text1:string;text2:string;day:number;
 text3?:string;amount?:number;flagRz?:boolean;valueSc?:number;
 stage?:string;competition?:string;money?:bigint;confederation?:number;
}
export interface MessageInbox {messages:EngineMessage[];}
/** Core do Rust `send`: inicialização de campos, sem ação adicional. */
export function sendEngineMessage(inbox:MessageInbox,day:number,sender:number,messageId:number,text1='',text2=''):EngineMessage{
 const m={sender,messageId,text1,text2,day};inbox.messages.push(m);return m;
}
/** Envia mensagem disciplinar. `amount = Math.round(salary*0.1)` (Java). */
export function sendEnginePlayerMessage(inbox:MessageInbox,day:number,sender:number,messageId:number,
 text1:string,text2:string,playerName:string,salary:number,flag:boolean,kind:number):EngineMessage {
 const m:EngineMessage={sender,messageId,text1,text2,day,text3:playerName,amount:Math.floor(salary*.1+.5),flagRz:flag,valueSc:kind};
 inbox.messages.push(m);return m;
}
export function sendEngineComposed(inbox:MessageInbox,day:number,sender:number,messageId:number,
 about:{stage?:string;competition?:string;money?:bigint}):EngineMessage{
 const m={sender,messageId,text1:'',text2:'',day,...about};inbox.messages.push(m);return m;
}
export function sendContinentalTitle(inbox:MessageInbox,day:number,confederation:number):EngineMessage{
 const m:EngineMessage={sender:25,messageId:76,text1:'',text2:'',day};
 if(Number.isInteger(confederation)&&confederation>=0&&confederation<6)m.confederation=confederation;
 inbox.messages.push(m);return m;
}
