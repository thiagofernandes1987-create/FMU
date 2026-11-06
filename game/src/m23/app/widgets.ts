/** Rust crates/app/src/screens/widgets.rs: fit_text with measured width;
 * callbacks use real font metrics (never guess glyph widths) and preserve Unicode scalars. */
export function fitText(text:string,maxWidth:number,width:(s:string)=>number):string{
 if(width(text)<=maxWidth)return text;
 const chars=Array.from(text);for(let n=chars.length-1;n>=0;n--){const cut=chars.slice(0,n).join('').trimEnd()+'…';if(width(cut)<=maxWidth)return cut;}
 return '';
}
export function competitionCountry(kind:'NationalSuperCup'|'StateChampionship'|'RegionalCup'|'Other',country:number,fromCountryRef?:number):number|undefined{
 const code=kind==='NationalSuperCup'?country:kind==='StateChampionship'||kind==='RegionalCup'?29:fromCountryRef;
 return code!==undefined&&code>=0?code:undefined;
}
