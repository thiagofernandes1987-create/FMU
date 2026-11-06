/**
 * M29 read-only readiness CLI for a REAL .bfn. Does not simulate games, assume scores,
 * or write an input file. Source: simulation/src/game.rs and M28 `World` reader.
 * Usage: node dist/src/m29_world_cli.js inspect <source.bfn>
 */
declare const require:{(name:string):any;main?:unknown};
declare const module:unknown;
declare const process:{argv:string[];exitCode?:number;stdout:{write(s:string):void};stderr:{write(s:string):void}};
const fs=require('node:fs');
import {loadBfnWorld} from './m27/persistence/bfn_world';
import {assessWorldAdvance} from './m29_world_driver';
import {auditWorldSemantics} from './m28/world_audit';
export function runM29WorldCli(args:readonly string[]):Record<string,unknown>{
 const [command,filename]=args;
 if(command!=='inspect'||!filename||!filename.toLowerCase().endsWith('.bfn')){
  throw Error('Usage: inspect <source.bfn> (read-only; no match simulation)');
 }
 const document=loadBfnWorld(fs.readFileSync(filename));
 const readiness=assessWorldAdvance(document),audit=auditWorldSemantics(document.world);
 return {command,source:filename,worldStructurallyValid:document.validation.valid,
  worldSemanticallyValid:audit.valid,season:document.world.game.season,
  day:document.world.game.day,requiredEngineIntegrations:readiness.requiredHooks,
  humanWaiting:readiness.humanWaiting,plannedMatches:readiness.plannedMatches,
  existingScores:readiness.alreadyPlayed,sourceFormat:document.originalFormat,
  readyForOriginalRustGameplay:false,originalRustParityVerified:false};
}
if(require.main===module){try{process.stdout.write(JSON.stringify(runM29WorldCli(process.argv.slice(2)),null,2)+'\n');}
 catch(error){process.stderr.write((error instanceof Error?error.message:String(error))+'\n');process.exitCode=1;}}
