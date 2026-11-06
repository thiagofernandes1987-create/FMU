/**
 * M27 — `datapack/src/bin/brasfoot-data.rs` CLI parsing/validation subset.
 * Fonte Rust: `split`, `option`, `validate` and strict argument contracts.
 * Entrada: argv; efeitos: validate reads only; convert/pack unsupported until
 * legacy conversion and ZIP writer are fully ported. Never report success for them.
 * Dependências: `datapack/read.ts`, `database.ts`, node fs/path.
 */
declare function require(name:string):any;
const fs=require('node:fs'),path=require('node:path');
import {DbLayer,composeLayers} from '../../m22/datapack/database';
import {isSlug} from '../../m22/datapack/read';
export interface DataCliTokens {positional:string[];options:[string,string][];}
const USAGE='usage: brasfoot-data convert <game folder> <out folder> --id <owner/name> --name <name> | validate <folder> [--on <base>] | pack <folder> <out> [--on <base>]';
/** Rust `split`: preserves option order, accepts repeated --on pairs. */
export function splitDataArgs(args:readonly string[]):DataCliTokens {
 const positional:string[]=[],options:[string,string][]=[];
 for(let i=0;i<args.length;i++){
  const x=args[i]!;if(x.startsWith('--')){
   const value=args[++i];if(value===undefined)throw Error(`${x} needs a value\n${USAGE}`);
   options.push([x.slice(2),value]);
  }else positional.push(x);
 }
 return {positional,options};
}
/** Rust `option`: when repeated, first match wins. */
export function dataOption(options:readonly (readonly [string,string])[],name:string):string|undefined {
 return options.find(([key])=>key===name)?.[1];
}
/** Read raw pack tree without following symlinks outside root; used only for M27 read-only checks. */
export function readPackTree(folder:string,maxFiles=50_000):Map<string,Uint8Array>{
 if(!fs.statSync(folder).isDirectory())throw Error('Pack path is not a directory');
 const files=new Map<string,Uint8Array>(),stack:[string,string][]=[[folder,'']];
 while(stack.length){const [dir,base]=stack.pop()!;
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
   const rel=base?base+'/'+entry.name:entry.name,full=path.join(dir,entry.name);
   if(entry.isSymbolicLink())throw Error('Pack symbolic link not allowed: '+rel);
   if(entry.isDirectory())stack.push([full,rel]);
   else if(entry.isFile()){
    if(files.size>=maxFiles)throw Error('Pack exceeds file count');
    const stat=fs.statSync(full);if(stat.size>32*1024*1024)throw Error('Pack file exceeds 32 MiB: '+rel);
    files.set(rel,new Uint8Array(fs.readFileSync(full)));
   }
  }
 }
 return files;
}
/** Parses the four mandatory TOML keys; does NOT implement full TOML or squad validation. */
export function readPackManifest(files:ReadonlyMap<string,Uint8Array>):{id:string;kind:'base'|'patch';format:number;name:string;remove:DbLayer['remove']} {
 const raw=files.get('manifest.toml');if(!raw)throw Error('Missing manifest.toml');
 const text=new TextDecoder('utf-8',{fatal:true}).decode(raw);
 const field=(key:string)=>{const match=new RegExp('^'+key+'\\s*=\\s*"([^"]*)"\\s*$','m').exec(text);return match?.[1];};
 const id=field('id'),name=field('name'),kind=field('kind');
 const f=/^format\s*=\s*(\d+)\s*$/m.exec(text)?.[1];
 if(!id||!name||(kind!=='base'&&kind!=='patch')||f===undefined)throw Error('Missing/invalid manifest fields');
 const [owner,slug]=id.split('/');if(!owner||!slug||!isSlug(owner)||!isSlug(slug)||id.split('/').length!==2)throw Error('Invalid pack owner/name');
 const remove={clubs:[] as string[],leagues:[] as string[],stateLeagues:[] as string[]};
 const section=/\[remove\]([\s\S]*?)(?=\n\[|$)/.exec(text)?.[1]??'';
 for(const [key,property] of [['clubs','clubs'],['leagues','leagues'],['state_leagues','stateLeagues']] as const){
  const body=new RegExp('^'+key+'\\s*=\\s*\\[([^\\]]*)\\]','m').exec(section)?.[1];
  if(body)for(const match of body.matchAll(/"([^"]*)"/g))remove[property].push(match[1]!);
 }
 return {id,kind,format:Number(f),name,remove};
}
/** Read-only approximation; Rust's TOML/CSV semantic validator remains a missing dependency. */
export function inspectDataPack(folder:string,bases:readonly string[]=[]):{id:string;files:number;issues:string[];kind:'base'|'patch';partial:true} {
 const sources=[...bases,folder].map(folder=>{
  const files=readPackTree(folder),manifest=readPackManifest(files);
  return {files,kind:manifest.kind,remove:manifest.remove,manifest};
 });
 const result=composeLayers(sources.map(x=>({files:x.files,kind:x.kind,remove:x.remove})));
 const x=sources.at(-1)!;
 return {id:x.manifest.id,kind:x.manifest.kind,files:result.files.size,issues:result.issues,partial:true};
}
/** Never silently pretend unsupported Rust convert/pack commands succeeded. */
export function runDataCli(args:readonly string[]):{id:string;files:number;issues:string[];kind:'base'|'patch';partial:true} {
 const [command,...rest]=args,{positional,options}=splitDataArgs(rest);
 if(command==='validate'&&positional.length===1)return inspectDataPack(positional[0]!,options.filter(([k])=>k==='on').map(([_,v])=>v));
 if(command==='convert'||command==='pack')throw Error('M27: '+command+' requires full Rust datapack parser/packer; not yet ported');
 throw Error(USAGE);
}
