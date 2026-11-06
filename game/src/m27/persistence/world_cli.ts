/** M27 — CLI real de leitura, migração e persistência de World .bfn.
 * Fonte: persistence/examples/{save_smoke,import_s22,canonical_dump}.rs, native.rs.
 * Entradas: arquivos .bfn; saída: diagnóstico read-only ou arquivo .bfn v3.
 * Dependências: bfn_world, node fs/path; nenhum save é interpretado como sandbox M24.
 * Efeitos: `upgrade` escreve de forma atômica com backups; outros comandos são puros.
 */
declare const require:{(name:string):any;main?:unknown};
declare const module:unknown;
declare const process:{argv:string[];exitCode?:number;stdout:{write(x:string):void};stderr:{write(x:string):void}};
const fs=require('node:fs');
import {loadBfnWorld,worldArenaObject,writeBfnWorldAtomic,WORLD_ARENAS,WorldLoadOptions} from './bfn_world';
export interface WorldSummary {format:number;migrations:readonly number[];season:number;day:number;arenas:Record<string,number>;checkedReferences:number;checkedFields:number;warnings:number;runtimePreflight:boolean;runtimeBlockers:string[];}
/** `read_save(World)`: read-only, refuses weak CBOR fixtures even with valid header. */
export function inspectWorldFile(filename:string,opts:WorldLoadOptions={}):WorldSummary {
 if(!filename.toLowerCase().endsWith('.bfn'))throw Error('Only .bfn files accepted');
 const doc=loadBfnWorld(fs.readFileSync(filename),opts),w=doc.world;
 return {format:doc.originalFormat,migrations:doc.migrationSteps,season:Number(w.game.season),day:Number(w.game.day),
  arenas:Object.fromEntries(WORLD_ARENAS.map(a=>[a,w[a].length])),checkedReferences:doc.validation.checkedReferences,
  checkedFields:doc.validation.checkedFields,warnings:doc.validation.warnings.length,
  runtimePreflight:doc.runtimePreflight.minimumReady,runtimeBlockers:doc.runtimePreflight.blockers.map(x=>x.path)};
}
/** `native::write_save` after migrations: loads complete Rust World, outputs v3 and backups. */
export function upgradeWorldFile(source:string,target:string,opts:WorldLoadOptions={}):WorldSummary {
 if(!source.toLowerCase().endsWith('.bfn')||!target.toLowerCase().endsWith('.bfn'))throw Error('Only .bfn files accepted');
 const doc=loadBfnWorld(fs.readFileSync(source),opts);
 const summary:WorldSummary={format:doc.originalFormat,migrations:doc.migrationSteps,
  season:Number(doc.world.game.season),day:Number(doc.world.game.day),
  arenas:Object.fromEntries(WORLD_ARENAS.map(a=>[a,doc.world[a].length])),checkedReferences:doc.validation.checkedReferences,
  checkedFields:doc.validation.checkedFields,warnings:doc.validation.warnings.length,
  runtimePreflight:doc.runtimePreflight.minimumReady,runtimeBlockers:doc.runtimePreflight.blockers.map(x=>x.path)};
 // writeBfnWorldAtomic accepts existing destination and rotates backups, including in-place upgrades.
 writeBfnWorldAtomic(target,doc);return summary;
}
/** System CLI: returns data; action is performed only when explicitly invoked. */
export function runM27WorldCli(argv:string[]):WorldSummary {
 const [command,source,target]=argv;
 if(!source)throw Error('Usage: inspect <save.bfn> | upgrade <source.bfn> <dest.bfn>');
 if(command==='inspect')return inspectWorldFile(source);
 if(command==='upgrade'&&target)return upgradeWorldFile(source,target);
 throw Error('Usage: inspect <save.bfn> | upgrade <source.bfn> <dest.bfn>');
}
if(require.main===module){try{process.stdout.write(JSON.stringify(runM27WorldCli(process.argv.slice(2)),null,2)+'\n');}
 catch(e){process.stderr.write((e instanceof Error?e.message:String(e))+'\n');process.exitCode=1;}}
