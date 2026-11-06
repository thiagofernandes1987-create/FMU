/** M28 .bfn → World → save-number/relink → backup → reopen. */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
import {world28,appendClub,appendPlayer,appendDay,doc28,defaults} from './m28_helpers';
import {writeBfnWorldAtomic,encodeWorldDocument,loadBfnWorld} from '../src/m27/persistence/bfn_world';
import {prepareWorldForSave} from '../src/m28/save_numbers';
import {openCareerWorld,persistCareerWorld} from '../src/m28/career_world';
import {transferWorldPlayer} from '../src/m28/world_transfer';
import {CborRecord} from '../src/m26/persistence/cbor';
function fixture(){const w=world28(),a=appendClub(w,'A',false),b=appendClub(w,'B',true),p=appendPlayer(w,a);
 appendDay(w);return {w,a,b,p};}
test('M28 lifecycle: opens prepared .bfn World and relinks transfer references',()=>{
 const {w,p}=fixture();w.game.transfers=[Object.assign(defaults('Transfer') as CborRecord,{player:p,player_list:1,player_number:0})];
 const d=prepareWorldForSave(doc28(w));
 // Real deserialize can have an unresolved transient PlayerId with valid save number.
 (d.world.game.transfers as CborRecord[])[0]!.player=null;
 const result=openCareerWorld(encodeWorldDocument(d));
 assert.equal(result.relinked.transfers,1);assert.equal((result.document.world.game.transfers as CborRecord[])[0]!.player,p);
 assert.equal(result.audit.valid,true);
});
test('M28 lifecycle: unresolved stale transient reference is reset to null on load',()=>{
 const {w,p}=fixture();w.game.transfers=[Object.assign(defaults('Transfer') as CborRecord,{player:p,player_list:1,player_number:999})];
 const r=openCareerWorld(encodeWorldDocument(doc28(w)));
 assert.equal(r.relinked.unresolvedTransfers,1);
 assert.equal((r.document.world.game.transfers as CborRecord[])[0]!.player,null);
});
test('M28 lifecycle: refuses corrupt double ownership even when Serde schema permits it',()=>{
 const {w,a,b,p}=fixture();(w.clubs[b]!.squad as number[]).push(p);
 assert.throws(()=>openCareerWorld(encodeWorldDocument(doc28(w))),/semantic errors/);
 const result=openCareerWorld(encodeWorldDocument(doc28(w)),{enforceSemantics:false});
 assert.equal(result.audit.valid,false);
});
test('M28 lifecycle: cannot mark minimal structural fixture as fully playable',()=>{
 const {w}=fixture();assert.throws(()=>openCareerWorld(encodeWorldDocument(doc28(w)),{requireRuntimePreflight:true}),/not ready for gameplay/);
});
test('M28 lifecycle: persist with full backup and exact refs reopens validated',()=>{
 const {w,b,p}=fixture();const d=doc28(w),dir=fs.mkdtempSync(path.join(os.tmpdir(),'fmu-m28-career-'));
 try{const dest=path.join(dir,'career.bfn');
  const one=persistCareerWorld(dest,d);
  assert.equal(one.reopened.document.world.players[p]!.save_number,0);
  const later=transferWorldPlayer(one.document,p,b,1200,{dateFields:()=>({year:2031,month:2,day:10})});
  const two=persistCareerWorld(dest,later.document);
  assert.ok(fs.existsSync(dest+'.bak1'));
  assert.equal(two.reopened.document.world.players[p]!.club,b);
  assert.equal(two.reopened.relinked.transfers,1);
  assert.equal(loadBfnWorld(fs.readFileSync(dest+'.bak1')).world.players[p]!.club,0);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('M28 lifecycle: failed semantic validation does not overwrite existing save',()=>{
 const {w}=fixture(),dir=fs.mkdtempSync(path.join(os.tmpdir(),'fmu-m28-career-'));
 try{const dest=path.join(dir,'career.bfn'),d=doc28(w);
  persistCareerWorld(dest,d);const before=fs.readFileSync(dest);
  d.world.game.clubs=[99];assert.throws(()=>persistCareerWorld(dest,d));
  assert.deepEqual(fs.readFileSync(dest),before);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
