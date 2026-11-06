/**
 * CLI M26 — diagnóstico READ-ONLY de saves BFN reais e carreiras demo JSON.
 * USO: node dist/src/m26/diagnostics/cli.js bfn <arquivo.bfn>
 *      node dist/src/m26/diagnostics/cli.js demo <arquivo.json>
 *      node dist/src/m26/diagnostics/cli.js demo-smoke <rodadas> [seed]
 * DEPENDÊNCIAS: node fs, codec Zstd/CBOR e validadores da carreira M24.
 * Erro no arquivo causa exitCode=1; não escreve/corrige arquivo de origem.
 * A saída BFN contém metadados e indicadores, sem `World` carregado.
 */
declare const require:{(name:string):any;main?:unknown};
declare const module:unknown;
declare const process:{argv:string[];exitCode?:number;stdout:{write(s:string):void};stderr:{write(s:string):void}};
const fs=require('node:fs');
import {inspectBfnBytes} from './persistence_examples';
import {restoreDemoCareer} from '../../m24/web/career_demo';
import {inspectDemoCompetition} from './simulation_examples';
import {runDemoCareerSmoke} from './systems_examples';
export function runM26Cli(args:readonly string[],read:(path:string)=>Uint8Array|string=path=>fs.readFileSync(path)):unknown {
 const [command,path,seed]=args;
 if(command==='bfn'){
  if(!path||!path.toLowerCase().endsWith('.bfn'))throw Error('bfn requires .bfn path');
  const raw=read(path);return inspectBfnBytes(typeof raw==='string'?new TextEncoder().encode(raw):raw);
 }
 if(command==='demo'){
  if(!path||!path.toLowerCase().endsWith('.json'))throw Error('demo requires .json path');
  const raw=read(path),text=typeof raw==='string'?raw:new TextDecoder('utf-8',{fatal:true}).decode(raw);
  return inspectDemoCompetition(restoreDemoCareer(text));
 }
 if(command==='demo-smoke'){
  if(!path||!/^\d+$/.test(path))throw Error('demo-smoke requires integer steps');
  const steps=Number(path);const seedN=seed===undefined?2026:Number(seed);
  if(!Number.isSafeInteger(seedN))throw Error('Invalid seed');
  const r=runDemoCareerSmoke(steps,seedN);
  return {seasons:r.seasons,played:r.played,uniqueFixtures:r.uniqueFixtures,players:r.players,
   season:r.career.season,round:r.career.round};
 }
 throw Error('Usage: bfn <file.bfn> | demo <file.json> | demo-smoke <rounds> [seed]');
}
if(typeof require==='function'&&require.main===module){
 try{process.stdout.write(JSON.stringify(runM26Cli(process.argv.slice(2)),null,2)+'\n');}
 catch(e){process.stderr.write((e instanceof Error?e.message:String(e))+'\n');process.exitCode=1;}
}
