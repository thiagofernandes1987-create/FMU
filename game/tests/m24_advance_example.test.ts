/** Reexecução M24 do exemplo `app/examples/advance_career.rs` em mundo fictício. */
declare function require(name:string):any;declare const process:any;
const test=require('node:test'),assert=require('node:assert/strict'),cp=require('node:child_process');
test('M24 example: 2 temporadas completas retornam 90 jogos e 10 clubes por temporada',()=>{
 const out=cp.execFileSync(process.execPath,['tools/m24_advance_career.js','2'],{cwd:process.cwd(),encoding:'utf8'});
 const s=JSON.parse(out);assert.equal(s.mode,'SANDBOX_NOT_RUST_PARITY');
 assert.deepEqual(s.seasons.map((x:any)=>x.year),[2026,2027]);
 assert(s.seasons.every((x:any)=>x.matches===90&&x.clubs===10));
 assert.equal(s.finalSeason,2028);
});
test('M24 example: execução em novo processo reproduz exatamente os mesmos resultados',()=>{
 const args=[process.execPath,'tools/m24_advance_career.js','2'];
 const a=cp.execFileSync(args[0],args.slice(1),{cwd:process.cwd(),encoding:'utf8'});
 const b=cp.execFileSync(args[0],args.slice(1),{cwd:process.cwd(),encoding:'utf8'});
 assert.equal(a,b);
});
