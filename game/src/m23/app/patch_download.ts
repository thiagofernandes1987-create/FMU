/** Rust crates/app/src/patches/download.rs: download states and progress
 * independent of HTTP. Original networking/retry code is not translated yet. */
export type DownloadPhase={kind:'Starting'}|{kind:'Chunks'|'Files';done:number;total:number}|{kind:'Waiting';seconds:number}|{kind:'Saving'};
export function downloadProgress(p:DownloadPhase):number|undefined{
 if(p.kind==='Starting'||p.kind==='Waiting')return undefined;
 if(p.kind==='Saving')return 1;
 return p.total===0?1:p.done/p.total;
}
export function downloadHeader(headers:Readonly<Record<string,string>>,name:string):string|undefined{
 return Object.entries(headers).find(([k])=>k.toLowerCase()===name.toLowerCase())?.[1];
}
