/** Proves differential gates, not Rust game parity without a real golden. */
const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
import {canonical,shaCanonical,compareTraces,verifyDifferential,RustGolden,RuntimeTrace} from '../../src/m30/differential';
const bytes=Uint8Array.from([1,2,3]);const hash=crypto.createHash('sha256').update(bytes).digest('hex');
const rust:RuntimeTrace={world:{game:{day:2,money:9007199254740998n},clubs:[{id:1,slots:new Map([[2,80]])}]},rng:{draws:15},events:[{goal:1}]};
const golden:RustGolden={kind:'rust-executed',rustCommit:'bd2ccbdd5f1aaacb6437b58b198d7963c61b3780',
 rustBinarySha256:'1'.repeat(64),inputSha256:hash,title:'PROVENANCE TEST ONLY, NOT REAL RUST EXECUTION',trace:rust};
test('M30 golden missing means UNVERIFIED, not silent PASS',()=>{
 assert.equal(verifyDifferential(bytes,rust).status,'UNVERIFIED');
});
test('M30 canonical bigint/maps/byte arrays/NaN/-0 stable and distinguished',()=>{
 const a={z:new Map([[2,4],[1,3]]),x:new Uint8Array([1,2]),a:1n,notANumber:NaN,minusZero:-0};
 const b={minusZero:-0,a:1n,x:new Uint8Array([1,2]),notANumber:NaN,z:new Map([[1,3],[2,4]])};
 assert.equal(canonical(a),canonical(b));assert.equal(shaCanonical(a),shaCanonical(b));
 assert.notEqual(canonical(-0),canonical(0));assert.notEqual(canonical(9007199254740993n),canonical(9007199254740992n));
});
test('M30 diff resolves nested array and Map paths separately',()=>{
 const changed:RuntimeTrace={world:{game:{day:3,money:9007199254740998n},clubs:[{id:1,slots:new Map([[2,90]])}]},rng:{draws:16},events:[{goal:2}]};
 const paths=compareTraces(rust,changed).map(d=>d.path);
 assert.ok(paths.some(x=>x.includes('day')));assert.ok(paths.some(x=>x.includes('slots')));
 assert.ok(paths.some(x=>x.startsWith('$.rng')));assert.ok(paths.some(x=>x.startsWith('$.events')));
});
test('M30 mismatched input sha is UNVERIFIED despite matching traces',()=>{
 const result=verifyDifferential(Uint8Array.from([9]),rust,golden);
 assert.equal(result.status,'UNVERIFIED');assert.match(result.reason!,/SHA/);
});
test('M30 invalid golden provenance refuses false success',()=>{
 const bad={...golden,rustBinarySha256:'not-a-sha'} as RustGolden;
 assert.equal(verifyDifferential(bytes,rust,bad).status,'UNVERIFIED');
});
test('M30 source-supplied synthetic golden fixture: infrastructure PASS, not original game parity',()=>{
 const result=verifyDifferential(bytes,rust,golden);
 assert.equal(result.status,'PASS');assert.deepEqual(result.differences,[]);
 assert.equal(result.referenceDigest,result.typescriptDigest);
});
test('M30 mismatched results yield FAIL with path and value',()=>{
 const changed:RuntimeTrace={...rust,rng:{draws:16}};
 const result=verifyDifferential(bytes,changed,golden);
 assert.equal(result.status,'FAIL');assert.equal(result.differences[0]?.path,'$.rng.draws');
});
test('M30 cyclic values and invalid diff limit are blocked',()=>{
 const a:any={};a.a=a;assert.throws(()=>canonical(a),/Cyclic/);
 assert.throws(()=>compareTraces(rust,rust,0),/diff limit/);
});
