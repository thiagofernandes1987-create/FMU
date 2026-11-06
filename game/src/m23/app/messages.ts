/** Rust crates/app/src/screens/messages.rs: subject, two text fields and body
 * translation keys; translation and World stage names are injected. */
export interface ScreenMessage {sender:number;messageId:number;text1:string;text2:string;stageName?:string;competitionName?:string;money?:bigint;confederation?:number;}
export interface MessageTranslator {text:(key:string,args?:Record<string,string>)=>string;money:(amount:bigint)=>string;}
export function screenMessageText1(m:ScreenMessage):string{return m.stageName??m.competitionName??m.text1;}
export function screenMessageText2(m:ScreenMessage,t:MessageTranslator):string{
 return m.money!==undefined?t.money(m.money):m.confederation!==undefined?t.text(`message-continental-title-${m.confederation}`):m.text2;
}
export function screenMessageSubject(m:ScreenMessage,t:MessageTranslator):string{
 const a=screenMessageText1(m);if(m.sender===77)return t.text('message-center-newspaper',{text:a});
 const base=t.text(`message-subject-${m.sender}`);return a?t.text('message-center-subject',{subject:base,text:a}):base;
}
