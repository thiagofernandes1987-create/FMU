/** Fonte: datapack/src/read.rs. Validadores de nomes de pacote e cores, usados antes de ler clubes.
 * Dependências: nenhum parser TOML/CSV; efeitos: nenhum; testes m22_datapack. */
export const TROPHY_KINDS=['league','cup','super-cup','state','regional','continental'] as const;
export const NATIONAL_TEAM_PICTURES=['crest.png','kit.png','kit2.png'] as const;
/** `is_slug`: minúsculas ASCII, números e hífen; sem hífen nas extremidades. */
export function isSlug(s:string):boolean{return s.length>0&&!s.startsWith('-')&&!s.endsWith('-')&&/^[a-z0-9-]+$/.test(s);}
/** `is_documentation` apenas na raiz, sem leitura do arquivo. */
export function isDocumentation(name:string):boolean{const t=name.toLowerCase();return t.endsWith('.md')||t.endsWith('.txt')||t.startsWith('license')||t.startsWith('copying');}
/** `is_color`: exatamente #RRGGBB em hex ASCII. */
export function isColor(s:string):boolean{return /^#[0-9a-fA-F]{6}$/.test(s);}
/** `range`: retorna diagnóstico explícito somente quando fora do intervalo inclusivo. */
export function rangeIssue(field:string,value:number,min:number,max:number):{field:string;value:number;min:number;max:number}|undefined{
 return value<min||value>max?{field,value,min,max}:undefined;
}
