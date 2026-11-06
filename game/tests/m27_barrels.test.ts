/** M27: smoke of the four Rust lib.rs namespace manifests as real importable JS modules. */
declare function require(name:string):any;
const test=require('node:test'),assert=require('node:assert/strict');
import * as datapack from '../src/m27/datapack';
import * as engine from '../src/m27/engine';
import * as model from '../src/m27/model';
import * as persistence from '../src/m27/persistence';
test('M27 lib.rs: datapack exports nine Rust public namespaces',()=>{
 assert.deepEqual(Object.keys(datapack).sort(),['codes','database','format','issues','legacy','pack','read','tree','trophies']);
 assert.equal(typeof datapack.database.composeLayers,'function');
 assert.equal(typeof datapack.pack.parsePackIndex,'function');
});
test('M27 lib.rs: engine exports 12 Rust public namespaces',()=>{
 assert.deepEqual(Object.keys(engine).sort(),['clubs','engine','events','hooks','injury','lineup','messages','simulate','stadium','tables','tactics','value']);
 assert.equal(typeof engine.injury,'object');
});
test('M27 lib.rs: model exports 21 Rust public namespaces',()=>{
 assert.equal(Object.keys(model).length,21);
 assert.ok(Object.hasOwn(model,'rng'));assert.ok(Object.hasOwn(model,'world'));
 assert.equal(typeof model.ids.arenaId,'function');
});
test('M27 lib.rs: persistence exports six Rust public namespaces',()=>{
 assert.deepEqual(Object.keys(persistence).sort(),['game_data','import_','javaser','kryo','migrations','native']);
 assert.equal(typeof persistence.migrations.addSaveNumbers,'function');
});
