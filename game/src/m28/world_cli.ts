/**
 * M28 — operational CLI for a real `.bfn` World (not synthetic demo).
 * `inspect-day` and `audit` are read-only; `prepare-save` writes a SEPARATE
 * path with numberPlayersForSave and numberCompetitionsForSave before encoding.
 * All write actions are explicit; never auto-overwrite user's original source.
 * Dependencies: M27 validator/atomic writer, M28 calendar and save numbering.
 */
declare const require:{(name:string):any;main?:unknown};
declare const module:unknown;
declare const process:{argv:string[];exitCode?:number;stdout:{write(s:string):void};stderr:{write(s:string):void}};
const fs=require('node:fs'),path=require('node:path');
import {loadBfnWorld,writeBfnWorldAtomic} from '../m27/persistence/bfn_world';
import {inspectWorldDay,findNextPlayableDay} from './world_calendar';
import {prepareWorldForSave} from './save_numbers';
import {auditWorldSemantics} from './world_audit';
export interface M28CLIResult{command:string;source:string;[key:string]:unknown;}
/** `inspect-day`, `audit`, `prepare-save` — no assumptions about fixture provenance. */
export function runM28WorldCli(argv:string[]):M28CLIResult {
 const [command,filename,arg]=argv;
 if(!filename||!filename.toLowerCase().endsWith('.bfn'))throw Error('Usage: inspect-day <save.bfn> | audit <save.bfn> | prepare-save <save.bfn> <new.bfn>');
 const doc=loadBfnWorld(fs.readFileSync(filename));
 if(command==='audit')return {command,source:filename,...auditWorldSemantics(doc.world)};
 if(command==='inspect-day'){
  const next=findNextPlayableDay(doc.world),day=doc.world.game.days;
  return {command,source:filename,nextPlayableDay:next??null,day:
   Array.isArray(day)&&day.length>0?{...inspectWorldDay(doc),dateMillis:undefined,date:inspectWorldDay(doc).date.toString()}:null};
 }
 if(command==='prepare-save'){
  if(!arg||!arg.toLowerCase().endsWith('.bfn'))throw Error('prepare-save requires a new .bfn target');
  const src=path.resolve(filename),dst=path.resolve(arg);if(src===dst)throw Error('Refusing in-place normalization: output must differ from source');
  const w=prepareWorldForSave(doc);writeBfnWorldAtomic(dst,w);
  return {command,source:filename,target:dst,players:(w.world.game.players as unknown[]).length,
   transfers:(w.world.game.transfers as unknown[]).length,formatVersion:3};
 }
 throw Error('Unknown command; try inspect-day, audit or prepare-save');
}
if(require.main===module){try{const result=runM28WorldCli(process.argv.slice(2));process.stdout.write(JSON.stringify(result,null,2)+'\n');}
 catch(e){process.stderr.write((e instanceof Error?e.message:String(e))+'\n');process.exitCode=1;}}
