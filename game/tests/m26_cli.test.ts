/** M26 — CLI usa artefatos reais, não escreve saves. */
declare function require(name:string):any;
const test=require('node:test'),assert=require('node:assert/strict');
import {runM26Cli} from '../src/m26/diagnostics/cli';
import {writeBfnPayload} from '../src/m26/persistence/bfn_codec';
import {createDemoCareer,serializeDemoCareer} from '../src/m24/web/career_demo';
test('M26 CLI: inspeciona `.bfn` com cabecalho e CBOR real',()=>{
 const bfn=writeBfnPayload({season:2026,club:'FMU',coach:'Teste',date:'2026-01-01',app_version:'M26',saved_at:0},{game:{season:1},clubs:[{name:'A'}],players:[],competitions:[]});
 const result=runM26Cli(['bfn','fixture.bfn'],()=>bfn) as {header:{worldLoaded:boolean};features:{clubs:number}};
 assert.equal(result.header.worldLoaded,false);assert.equal(result.features.clubs,1);
});
test('M26 CLI: inspeciona save demo validado e rejeita alterado',()=>{
 const good=serializeDemoCareer(createDemoCareer());
 const result=runM26Cli(['demo','career.json'],()=>good) as {clubIds:string[]};
 assert.equal(result.clubIds.length,10);
 assert.throws(()=>runM26Cli(['demo','career.json'],()=>'{"schema":"fake"}'),/incompatível/);
});
test('M26 CLI: demo smoke tem resultado reproduzível por semente',()=>{
 const a=runM26Cli(['demo-smoke','36','99']);
 assert.deepEqual(a,runM26Cli(['demo-smoke','36','99']));
 assert.equal((a as {played:number}).played,180);
});
test('M26 CLI: formatos, extensão e números inválidos rejeitados',()=>{
 assert.throws(()=>runM26Cli(['bfn','foo.txt']),/bfn/);
 assert.throws(()=>runM26Cli(['demo-smoke','-1']),/integer/);
 assert.throws(()=>runM26Cli(['demo-smoke','1','NaN']),/seed/);
 assert.throws(()=>runM26Cli([]),/Usage/);
});
