/** Rust crates/app/src/patches/mod.rs::Location::github/key/label.
 * Parsing requires ASCII github slug and normalizes owner/repo. SHA key for local
 * files is injected: consumer must supply the data-pack SHA-256 implementation. */
export type PatchLocation={kind:'github';owner:string;repo:string}|{kind:'folder'|'zip';path:string};
export const OFFICIAL_PATCH:{owner:string;repo:string}={owner:'brasfoot-next',repo:'database'};
export function parseGitHubLocation(input:string):PatchLocation|undefined{
 let rest=input.trim().replace(/\/+$/,'');rest=rest.replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/^github\.com\//,'');
 const [owner,rawRepo]=rest.split('/'),repo=rawRepo?.replace(/\.git$/,'');
 const valid=(s:string|undefined):s is string=>!!s&&/^[A-Za-z0-9_.-]+$/.test(s);
 return valid(owner)&&valid(repo)&&!rest.includes(' ')&&!rest.includes(':')?{kind:'github',owner:owner.toLowerCase(),repo:repo.toLowerCase()}:undefined;
}
export function patchLocationKey(location:PatchLocation,sha256:(value:string)=>string):string{
 if(location.kind==='github')return `github/${location.owner}/${location.repo}`;
 const hash=sha256(location.path);if(!/^[a-f0-9]{64}$/i.test(hash))throw new Error('Invalid SHA256 contract');
 return `${location.kind}/${hash.slice(0,16)}`;
}
export function patchLocationLabel(location:PatchLocation):string{return location.kind==='github'?`${location.owner}/${location.repo}`:location.path;}
export function isOfficialPatch(location:PatchLocation):boolean{return location.kind==='github'&&location.owner===OFFICIAL_PATCH.owner&&location.repo===OFFICIAL_PATCH.repo;}
export function initialPatchList():{location:PatchLocation;enabled:boolean;installed?:unknown}[]{return [{location:{kind:'github',...OFFICIAL_PATCH},enabled:true}];}
