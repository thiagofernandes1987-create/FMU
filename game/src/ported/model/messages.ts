/** M21 — crates/model/src/messages.rs. Normalização para differential testing.
 * Efeitos: altera apenas textos criados dinamicamente e datas ausentes, sem inventar descrições. */
export const COMPOSED_TEXTS:ReadonlyArray<readonly [number,number]>=[[26,79],[26,80],[25,76]];
export interface SourceMessage {sender:number;messageId:number;text1:string;text2:string;day?:number;dateText:string;}
export interface CoachInbox {messages:SourceMessage[];}
/** `blank_composed_texts`: preserva metadados de refs de estágio/competição. */
export function blankComposedTexts(coaches:CoachInbox[]):void {
 for(const c of coaches)for(const m of c.messages){
  if(COMPOSED_TEXTS.some(([a,b])=>m.sender===a&&m.messageId===b)){m.text1='';m.text2='';}
 }
}
/** `fill_date_texts`: preenche apenas quando data existir e texto estiver vazio. */
export function fillDateTexts(coaches:CoachInbox[],fields:(millis:number)=>{year:number;month:number;day:number}):void {
 for(const c of coaches)for(const m of c.messages){if(m.day!==undefined&&!m.dateText){
  const f=fields(m.day);m.dateText=`${String(f.day).padStart(2,'0')}/${String(f.month+1).padStart(2,'0')}/${String(f.year).padStart(4,'0')}`;
 }}
}
