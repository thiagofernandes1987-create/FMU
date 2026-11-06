/** Rust crates/app/src/lib.rs::App::new: BF_SCREEN/BF_TAB startup routing.
 * This is a pure view-state transition; `open/import` of files is injected,
 * and egui runtime FPS, painting and interaction are NOT implemented. */
export type AppPage='Opening'|'SavedGame'|'NewGame'|'Patches'|'Career'|'Support';
export interface AppBoot {page:AppPage;tab?:string;loadPath?:string;importOriginal?:boolean;}
export function bootApp(screen?:string,openPath?:string,tab?:string):AppBoot{
 let page:AppPage=screen==='saved'?'SavedGame':screen==='new'?'NewGame':screen==='patches'?'Patches':'Opening';
 if(openPath){page='Career';return {page,loadPath:openPath,importOriginal:!openPath.endsWith('.bfn'),tab};}
 return {page};
}
/** Rust `BF_TAB` chooses screen or nested module and optional index. */
export function parseDeveloperTab(tab:string):{screen:string;index?:number;send?:boolean;amount?:string}{
 for(const kind of ['market','finances','management','satellites','assets'])if(tab.startsWith(kind+'-')){
  const n=Number.parseInt(tab.slice(kind.length+1),10);return {screen:kind,index:Number.isFinite(n)&&n>=0?n:0};
 }
 if(tab==='offer')return {screen:'offer'};
 if(tab.startsWith('offer-')){const suffix=tab.slice(6),send=suffix.endsWith('-send');return {screen:'offer',amount:send?suffix.slice(0,-5):suffix,send};}
 if(tab.startsWith('awards-')){const n=Number.parseInt(tab.slice(7).split('-')[0]??'',10);return {screen:'awards',index:Number.isFinite(n)?n:0};}
 return {screen:tab};
}
