/**
 * Port funcional: crates/model/src/names.rs — listas de nomes de jogadores.
 * Fonte original permite pasta e mapa `arquivos/names/<CODE>.txt`; esta versão
 * recebe readText por callback, preservando compatibilidade Node/Browser.
 * Alias de países 221/223→85 e 222→72; cache por ID, não por arquivo.
 * Requisito: listas vazias são reprocessadas em chamadas seguintes como Rust.
 * Efeitos: somente o cache interno; não lê ou escreve dados privados sozinho.
 */
export type NameReader=(path:string)=>string|undefined;
export class NameLists {
 private first=new Map<number,string[]>();private last=new Map<number,string[]>();
 constructor(private readonly readText:NameReader){}
 static fromFiles(files:Readonly<Record<string,string>>):NameLists{return new NameLists(path=>files[path]);}
 /** `M.a(String,int,int)`: dados inválidos não substituídos por nomes inventados. */
 list(country:number,code:string,surnames=false):readonly string[]{
  const key=country===221||country===223?85:country===222?72:country;
  const cache=surnames?this.last:this.first;
  const old=cache.get(key);if(old&&old.length)return [...old];
  const folder=surnames?'surnames':'names';
  const text=this.readText(`arquivos/${folder}/${code}.txt`);
  const lines=(text??'').split(/\r?\n/).filter(line=>line.length>0&&!line.includes('.')&&!/[0-9]/.test(line));
  cache.set(key,lines);return [...lines];
 }
}
