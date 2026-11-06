/** Fonte: i18n/src/lib.rs. Consulta de mensagens Fluent e fallback para a chave.
 * Dependência: texto FTL fornecido pelo consumidor, sem carregar rede ou sistema de arquivos;
 * suporta mensagens simples e placeholders `{$nome}`; Fluent seletor avançado ainda não portado.
 * Efeitos: nenhum após construção; valida duplicatas como o Rust. */
export const DEFAULT_LOCALE='pt-BR';
export class Translator22 {
 private readonly messages=new Map<string,string>();
 constructor(readonly locale:string,resources:readonly string[]){
  for(const resource of resources){let key:string|undefined;
   for(const line of resource.split(/\r?\n/)){
    const m=/^([a-zA-Z][\w-]*)\s*=\s*(.*)$/.exec(line);
    if(m){const name=m[1]!;key=name;if(this.messages.has(name))throw Error('Duplicate Fluent message '+name);this.messages.set(name,m[2]!);}
    else if(/^\s+\S/.test(line)&&key){this.messages.set(key,this.messages.get(key)!+'\n'+line.trim());}
    else if(!line.trim())key=undefined;
   }
  }
 }
 /** `Translator::text`: retorna key quando não encontrada; sem isolamento bidi. */
 text(key:string,args:Readonly<Record<string,string|number>>={}):string{
  const src=this.messages.get(key);if(src===undefined)return key;
  if(src.includes('->'))throw Error('Fluent selector not supported by limited port');
  return src.replace(/\{\s*\$([\w-]+)\s*\}/g,(_token,name:string)=>String(args[name]??`{$${name}}`));
 }
 keys():string[]{return [...this.messages.keys()];}
}
/** `args` constrói o mapa de argumentos esperado pela tradutora. */
export function fluentArgs(pairs:Iterable<readonly [string,string|number]>):Record<string,string|number>{return Object.fromEntries(pairs);}
