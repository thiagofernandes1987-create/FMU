/** Rust crates/app/src/screens/patches.rs::phase_text/short_version.
 * Downloading stays external; no network or fake installation claims. */
import {decimalText,ptTranslator,thousandsText,FMUTranslator} from './format';
export type PatchPhase={type:'Starting'}|{type:'Chunks'|'Files';done:number;total:number}|{type:'Waiting';seconds:number}|{type:'Saving'};
export function shortGitVersion(version:string):string{return /^[\da-fA-F]{40}$/.test(version)?version.slice(0,7):version;}
export function patchPhase(t:FMUTranslator,p:PatchPhase):{key:string;args?:Record<string,string>;progress?:number}{
 switch(p.type){
 case 'Starting':return {key:'patches-phase-starting'};
 case 'Saving':return {key:'patches-phase-saving',progress:1};
 case 'Waiting':return {key:'patches-phase-waiting',args:{seconds:String(p.seconds)}};
 case 'Chunks':return {key:'patches-phase-chunks',args:{done:decimalText(t,p.done/1e6,1),total:decimalText(t,p.total/1e6,1)},progress:p.total? p.done/p.total:1};
 case 'Files':return {key:'patches-phase-files',args:{done:thousandsText(t,p.done),total:thousandsText(t,p.total)},progress:p.total? p.done/p.total:1};
 }
}
