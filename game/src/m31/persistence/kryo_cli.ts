/**
 * M31 replacement for persistence/examples/canonical_dump.rs with injected schema.
 * Usage: node dist/src/m31/persistence/kryo_cli.js canonical file.s22 schema.json [out.canon.txt]
 *        node dist/src/m31/persistence/kryo_cli.js diff file.s22 schema.json expected.canon.txt[.zst]
 * The original jar-exported schema remains an explicit input, not bundled here.
 * No file overwrite unless canonical receives a destination explicitly.
 */
declare const require:{(name:string):any;main?:unknown};
declare const module:unknown;
declare const process:{argv:string[];exitCode?:number;stdout:{write(text:string):void};stderr:{write(text:string):void}};
const fs=require('node:fs'),zlib=require('node:zlib');
import {parseKryoSchema} from '../../m22/persistence/kryo_schema';
import {readKryoGraph} from './kryo_reader';
import {canonicalKryoGraph} from './kryo_canonical';
import {firstCanonicalDifference} from './kryo_compare';
const MAX=64*1024*1024;
function readLimited(path:string):Uint8Array{const stat=fs.statSync(path);if(stat.size>MAX)throw Error('Kryo file exceeds 64 MiB');return fs.readFileSync(path);}
export function dumpKryoFile(source:string,schemaPath:string):string {
 const bytes=readLimited(source),schema=parseKryoSchema(fs.readFileSync(schemaPath,'utf8'));
 const graph=readKryoGraph(bytes,schema);
 return canonicalKryoGraph(graph);
}
export function compareKryoFile(source:string,schemaPath:string,expectedPath:string):{equal:boolean;firstDifference?:ReturnType<typeof firstCanonicalDifference>} {
 const actual=dumpKryoFile(source,schemaPath),golden=readLimited(expectedPath);
 const uncompressed=expectedPath.endsWith('.zst')?zlib.zstdDecompressSync(golden,{maxOutputLength:MAX}):golden;
 const expected=new TextDecoder('utf-8',{fatal:true}).decode(uncompressed);
 const firstDifference=firstCanonicalDifference(actual,expected);
 return {equal:!firstDifference,firstDifference};
}
export function runKryoCli(args:readonly string[]):string {
 const [op,source,schema,dest]=args;
 if(!source||!schema||!dest&&op==='diff')throw Error('Usage: canonical <file.s22> <schema.json> [output.txt] | diff <file.s22> <schema.json> <reference.txt[.zst]>');
 if(op==='canonical'){
  const result=dumpKryoFile(source,schema);if(dest)fs.writeFileSync(dest,result);
  return dest?`Canonical dump saved to ${dest}`:result;
 }
 if(op==='diff'){
  const result=compareKryoFile(source,schema,dest!);
  if(!result.equal)throw Error('Kryo canonical DIFFERENTIAL FAIL: '+JSON.stringify(result.firstDifference));
  return 'Kryo canonical comparison PASS';
 }
 throw Error('Unsupported Kryo operation');
}
if(require.main===module){try{process.stdout.write(runKryoCli(process.argv.slice(2))+'\n');}
 catch(e){process.stderr.write((e instanceof Error?e.message:String(e))+'\n');process.exitCode=1;}}
