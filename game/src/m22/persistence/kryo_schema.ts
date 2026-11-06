/** Fonte: persistence/src/kryo/schema.rs. Validação do schema JSON Kryo.
 * Dependência: schema original importado pelo consumidor; este port não gera as 1300 classes. */
export interface KryoFieldSchema {name:string;declaring:string;type:string;declared?:string|null;valueClass?:string|null;canBeNull?:boolean;}
export interface KryoClassSchema {final?:boolean;serializer:string;component?:string|null;constants?:string[];fields?:KryoFieldSchema[];transient?:KryoFieldSchema[];}
export interface KryoSchema22 {format:string;classes:Record<string,KryoClassSchema>;}
/** `game_schema`: parsear os metadados e assegurar as invariantes dos campos. */
export function parseKryoSchema(text:string):KryoSchema22{
 const raw=JSON.parse(text) as KryoSchema22;
 if(!raw||typeof raw.format!=='string'||!raw.classes||typeof raw.classes!=='object')throw Error('Invalid Kryo schema');
 for(const [id,c] of Object.entries(raw.classes)){
  if(!id||typeof c.serializer!=='string')throw Error('Invalid Kryo class');
  for(const f of [...(c.fields??[]),...(c.transient??[])])if(!f.name||!f.declaring||!f.type)throw Error('Invalid Kryo field');
 }
 return raw;
}
