/**
 * M29R integration checkpoint: atomic and checksummed Node.js snapshot, NOT .bfn!
 * The original Rust `.bfn` (CBOR/Zstd) loader lives in FMU M28/M29 and must
 * supply its validated World. This format is intentionally `.fmu-day` to avoid
 * accidental attempts to open it with Brasfoot Next.
 * V8 serialization preserves bigint, typed buffers and unknown fields.
 */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),v8=require('node:v8');
import {World,validateWorld,worldIdentityIntegrity} from './world';
import {RandomSource,RandomSourceCheckpoint} from './rng';
export interface Checkpoint {world:World;random:RandomSourceCheckpoint;schema:'fmu-day-transaction-v1';}
const MAGIC='FMU-TX-1\n',LIMIT=128*1024*1024;
export function encodeCheckpoint(world:World,rng:RandomSource):Uint8Array {
 validateWorld(world);const i=worldIdentityIntegrity(world);if(i.errors.length)throw Error('Broken World references: '+i.errors[0]);
 const body=v8.serialize({world,random:rng.snapshot(),schema:'fmu-day-transaction-v1'} as Checkpoint);
 if(body.length>LIMIT)throw Error('Snapshot too large');
 const sha=crypto.createHash('sha256').update(body).digest('hex');
 return Buffer.concat([Buffer.from(MAGIC+sha+'\n','utf8'),body]);
}
export function decodeCheckpoint(bytes:Uint8Array):{world:World;rng:RandomSource} {
 if(bytes.length>LIMIT+100)throw Error('Snapshot too large');
 const header=Buffer.from(bytes.subarray(0,bytes.length<80?bytes.length:80)).toString('utf8');
 if(!header.startsWith(MAGIC))throw Error('This is not a .fmu-day checkpoint');
 const match=/^FMU-TX-1\n([0-9a-f]{64})\n/.exec(header);
 if(!match)throw Error('Malformed checkpoint header');
 const body=bytes.subarray(74); // 9 chars magic + 64 hash + LF = 74
 const hash=crypto.createHash('sha256').update(body).digest('hex');
 if(hash!==match[1])throw Error('Snapshot checksum mismatch');
 const parsed=v8.deserialize(body) as Checkpoint;
 if(!parsed||parsed.schema!=='fmu-day-transaction-v1'||!parsed.random)throw Error('Invalid checkpoint schema');
 validateWorld(parsed.world);const i=worldIdentityIntegrity(parsed.world);
 if(i.errors.length)throw Error('Broken checkpoint World references: '+i.errors[0]);
 return {world:parsed.world,rng:RandomSource.restore(parsed.random)};
}
export function writeCheckpointAtomic(filename:string,world:World,rng:RandomSource):void {
 if(!filename.endsWith('.fmu-day'))throw Error('Expected .fmu-day (NOT .bfn)');
 const content=encodeCheckpoint(world,rng),tmp=filename+'.tmp';let fd:number|undefined;
 try {
  fd=fs.openSync(tmp,'wx');let offset=0;while(offset<content.length){const wrote=fs.writeSync(fd,content,offset,content.length-offset,offset);if(wrote<=0)throw Error('Short write');offset+=wrote;}
  fs.fsyncSync(fd);fs.closeSync(fd);fd=undefined;
  if(fs.existsSync(filename)){
   for(let i=2;i>=1;i--){const from=filename+'.bak'+i;if(fs.existsSync(from))fs.renameSync(from,filename+'.bak'+(i+1));}
   fs.copyFileSync(filename,filename+'.bak1');
  }
  fs.renameSync(tmp,filename);
  try{const d=fs.openSync(path.dirname(filename),'r');fs.fsyncSync(d);fs.closeSync(d);}catch{/* directory fsync unavailable on some platforms */}
 }catch(e){if(fd!==undefined)fs.closeSync(fd);try{fs.unlinkSync(tmp);}catch{}throw e;}
}
export function readCheckpoint(filename:string):{world:World;rng:RandomSource} {
 if(!/\.fmu-day(?:\.bak[123])?$/.test(filename))throw Error('Expected .fmu-day or its backup');return decodeCheckpoint(fs.readFileSync(filename));
}