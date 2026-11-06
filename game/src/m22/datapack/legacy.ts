/** Fonte: datapack/src/legacy.rs. Importação de dados da versão legada.
 * Port de slug, hash Java UTF-16, potenciais ordinais e regra de rebaixamento direto.
 * IO puro; `deunicode` original exige transliteração real: usamos NFKD e marcamos limitação. */
export function legacySlug(name:string):string{
 const ascii=name.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const slug=ascii.replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');return slug||'club';
}
/** `String.hashCode`: multiplicação i32 com wrapping. */
export function legacyJavaHash(s:string):number{let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(h,31)+s.charCodeAt(i))|0;return h;}
/** `potentials_are_places`: N > 10 e hash original é permutação 1..N. */
export function potentialsArePlaces(values:readonly number[]):boolean {
 return values.length>10&&[...values].sort((a,b)=>a-b).every((n,i)=>n===i+1);
}
/** `effective_relegated_directly` exige versão 22 e limites exatos Rust. */
export function effectiveRelegatedDirectly(c:{teams:number;relegated:number;fileVersion:number;relegatedDirectly:number}):number {
 const places=c.teams<=10&&c.relegated>2?2:c.relegated;
 return c.fileVersion!==22||c.relegatedDirectly===0||c.relegatedDirectly>places?places:c.relegatedDirectly;
}
