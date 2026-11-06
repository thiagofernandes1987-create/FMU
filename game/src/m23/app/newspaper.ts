/** Rust crates/app/src/screens/newspaper.rs: section labels/colors and selected
 * article read state. Web rendering has not been implemented by this module. */
export const NEWSPAPER_SECTIONS=['Todas','Mercado','Seu clube','Craques e recordes','Base','Mundo'] as const;
export const NEWSPAPER_KEYS=['newspaper-section-all','newspaper-section-market','newspaper-section-your-club','newspaper-section-records','newspaper-section-youth','newspaper-section-world'] as const;
export function newspaperSectionColor(section:string):string{return ({'Mercado':'#3b82f6','Seu clube':'#e8be50','Craques e recordes':'#a78bfa','Base':'#4cc38a'} as Record<string,string>)[section]??'#94a3b8';}
export interface ArticleView {id:number;section:string;read:boolean;title:string;}
export function newspaperArticles(articles:readonly ArticleView[],sectionIndex:number):ArticleView[]{const section=NEWSPAPER_SECTIONS[sectionIndex];if(!section)throw new RangeError('Invalid newspaper section');return [...articles].reverse().filter(a=>sectionIndex===0||a.section===section);}
export function readArticle(articles:ArticleView[],id:number):boolean{const a=articles.find(a=>a.id===id);if(!a)return false;a.read=true;return true;}
