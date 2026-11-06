/** M22 partial port: persistence/src/game_data.rs::player(Object) legacy DTO extraction.
 * Expects decoded Java object fields; does not decode binary ObjectInputStream.
 * Input: map of abbreviated fields; output: typed athlete. No side effects. */
export interface LegacyPlayerTemplate{name:string;country:number;age:number;position:number;side:number;status:number;hash:number;tid:number;sid:number;aid:number;star:boolean;worldClass:boolean;traits:[number,number];}
export function legacyPlayer(fields:Readonly<Record<string,unknown>>):LegacyPlayerTemplate {
 const int=(key:string,defaultValue=0)=>typeof fields[key]==='number'&&Number.isInteger(fields[key])?fields[key] as number:defaultValue;
 return {name:typeof fields.a==='string'?fields.a:'',star:fields.b===true,country:int('c'),age:int('d'),position:int('e'),
 side:int('i'),status:int('f'),hash:int('hash'),tid:int('tid'),sid:int('sid'),aid:int('aid'),worldClass:fields.j===true,traits:[int('g'),int('h')]};
}
