/** Fixture .bfn criada neste release; valida leitura do arquivo real. */
declare function require(name:string):any;
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
import {readBfnPayload} from '../src/m26/persistence/bfn_codec';
import {inspectBfnBytes} from '../src/m26/diagnostics/persistence_examples';
const fixture=path.join(process.cwd(),'tests/fixtures/m26_sample_data_only.bfn');
test('M26 fixture BFN: origem externa é arquivo binário, com skippable frame + zstd',()=>{
 const bytes=fs.readFileSync(fixture) as Uint8Array;
 assert.deepEqual(Array.from(bytes.subarray(0,4)),[0x50,0x2a,0x4d,0x18]);
 const len=new DataView(bytes.buffer,bytes.byteOffset).getUint32(4,true);
 assert.deepEqual(Array.from(bytes.subarray(8+len,12+len)),[0x28,0xb5,0x2f,0xfd]);
});
test('M26 fixture BFN: metadados e payload estruturado preservados em leitura',()=>{
 const bytes=fs.readFileSync(fixture) as Uint8Array;
 const save=readBfnPayload(bytes),summary=inspectBfnBytes(bytes);
 assert.equal(save.meta.app_version,'fmu-m26-fixture');
 assert.equal(summary.header.worldLoaded,false);
 assert.equal(summary.features.clubs,1);
 assert.equal(summary.features.players,1);
 assert.equal(summary.competitions[0]?.legacyId,7);
});
