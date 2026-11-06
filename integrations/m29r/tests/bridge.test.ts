const test=require('node:test'),assert=require('node:assert/strict');
import {demoWorld} from '../src/demo';
import {normalizeImportedWorld,attachWorldToDocument} from '../src/bridge';
test('M28-style WorldDocument accepted with lossless i64 normalization',()=>{
 const w=demoWorld(),doc={world:structuredClone(w),meta:{format_version:3,unknown:'kept'},validation:{valid:true}};
 (doc.world.clubs[0] as any).cash=999;
 (doc.world.clubs[0]!.finances as any).expense_salaries=200;
 const out=normalizeImportedWorld(doc);
 assert.equal(out.clubs[0]!.cash,999n);assert.equal(out.clubs[0]!.finances.expense_salaries,200n);
 assert.equal((doc.world.clubs[0]!.cash),999);assert.equal(doc.meta.unknown,'kept');
 const updated=attachWorldToDocument(doc,out);
 assert.equal(updated.world.clubs[0]!.cash,999n);assert.equal(doc.world.clubs[0]!.cash,999);
});
test('BFN WorldDocument with invalid refs or numbers is rejected',()=>{
 const w=demoWorld();(w.clubs[0] as any).cash=Number.MAX_SAFE_INTEGER+1;
 assert.throws(()=>normalizeImportedWorld({world:w}),/Lossy or missing/);
 const bad=demoWorld();bad.players[0]!.club=2;
 assert.throws(()=>normalizeImportedWorld({world:bad}),/roster references/);
 assert.throws(()=>normalizeImportedWorld({world:demoWorld(),validation:{valid:false}}),/invalid structure/);
});