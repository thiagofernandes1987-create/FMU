/** Rust crates/app/src/game_files.rs: image and patch file locators composed
 * from paths. FS/JAR integration requires platform IO adapter. */
export interface GameFilesView {root:string;patches:readonly string[];}
export function gameFilePath(root:string,relative:string):string{
 if(!relative||relative.startsWith('/')||relative.split(/[\\/]/).includes('..'))throw new Error('Unsafe game-relative path');
 return root.replace(/\/+$/,'')+'/'+relative.replace(/^\.\//,'');
}
export function imageFileRef(root:string,kind:'crest'|'flag'|'trophy',id:string|number):string{
 const relative=kind==='flag'?`aflags/${id}.png`:kind==='crest'?`acrests/${id}.png`:`atrophies/${id}.png`;
 return gameFilePath(root,relative);
}
