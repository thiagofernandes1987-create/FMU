/** Fonte: i18n/src/labels.rs. Montagem de nomes de competições, fases e títulos.
 * Dependência: Translator22 injetado, rótulos tipados; funções puras sem renderização UI. */
import {Translator22} from './lib';
/** `collapse_spaces`: Java replaceAll('\\s+',' ').trim() sobre whitespace ASCII. */
export function collapseSpaces(s:string):string{return s.split(/[ \t\n\v\f\r]+/).filter(Boolean).join(' ');}
/** `stage`: fase reduzida a 39 unidades UTF-16 com reticências (String Java). */
export function stageName(t:Translator22,name:string,division?:number|string):string{
 let text=name.trim();
 if(division!==undefined){const d=typeof division==='number'?t.text('stage-division-number',{division}):division.trim();
  if(!text)text=d;else if(d)text=t.text('stage-name',{league:text,division:d});}
 return text.length>39?text.slice(0,39)+'...':text;
}
/** `country` procura country-code, mantendo fallback de chave do Fluent. */
export function countryLabel(t:Translator22,code:string):string{return t.text('country-'+code.toLowerCase());}
/** `national_league` usa adjetivo quando catalogado, caso contrário nome do país. */
export function nationalLeagueName(t:Translator22,countryId:number,code:string):string{
 const key=`country-adjective-${countryId}`,value=t.text(key);return value!==key?value:countryLabel(t,code);
}
/** `cup_article` usa texto específico ou padrão. */
export function cupArticle(t:Translator22,countryId:number):string{const key=`country-cup-article-${countryId}`;const x=t.text(key);return x===key?t.text('country-cup-article-default'):x;}
/** `season_titles`: junta com interpunção exatamente como o Rust. */
export function seasonTitles(t:Translator22,titles:readonly {runnerUp:boolean;competition:string}[]):string{
 return titles.map(x=>collapseSpaces(t.text(x.runnerUp?'award-title-runner-up':'award-title-champion',{competition:x.competition}))).join(' · ');
}
