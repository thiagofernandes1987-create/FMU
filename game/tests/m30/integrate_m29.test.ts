/** M29+M30 integration, using actual typed synthetic WorldDocument and .bfn codec. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
import {appendClub,appendPlayer,appendCompetition,appendDay,appendMatch,doc28,world28,defaults} from '../m28_helpers';
import {WorldDocument,encodeWorldDocument,loadBfnWorld} from '../../src/m27/persistence/bfn_world';
import {DeterministicRandomSource} from '../../src/m30/java_rng';
import {prepareM29WorldBatch,commitM29WorldBatch,m29WorldCodec} from '../../src/m30/integrate_m29';
import {hashSaveFile,readCommittedRng,recoverCommit} from '../../src/m30/journal';
import {WorldAdvanceHooks} from '../../src/m29_world_advance';
const hooks=():Omit<WorldAdvanceHooks,'draw100'>=>({
 afterMatch:()=>{},endSeason:()=>{},coachChanges:()=>{},
 monthOf:epoch=>new Date(Number(epoch)).getUTCMonth()
});
function worldFixture(human=false,played=true,days=1):WorldDocument{
 const w=world28(),a=appendClub(w,'Local',human),b=appendClub(w,'Visitante',false);
 w.coaches.push(defaults('Coach') as import('../../src/m26/persistence/cbor').CborRecord);(w.game.coaches as number[]).push(0);
 const competition=appendCompetition(w);
 for(let d=0;d<days;d++){
  const day=appendDay(w,Date.UTC(2031,3,15+d)),mid=appendMatch(w,day,a,b,played);
  w.matches[mid]!.competition=competition;
  w.matches[mid]!.home_goals=2;w.matches[mid]!.away_goals=0;
 }
 w.clubs[a]!.lineup_set=true;w.clubs[b]!.lineup_set=true;
 appendPlayer(w,a,23,280);
 (w.game.human_clubs as number[])=human?[a]:[];
 return doc28(w);
}
test('M30+M29 advances a real typed World draft with isolated RNG and events',()=>{
 const doc=worldFixture(false,true,2),rng=new DeterministicRandomSource(123);
 const beforeRng=rng.snapshot();const base=doc.world.game.day;
 const p=prepareM29WorldBatch(doc,rng,2,()=>hooks(),'career:2026');
 assert.equal(p.completed,2);assert.equal(p.status,'ready');
 assert.equal(p.effects.filter(e=>e.kind==='world.day.advanced').length,2);
 assert.equal(doc.world.game.day,base);assert.deepEqual(rng.snapshot(),beforeRng);
 assert.equal(p.world.world.game.season_over,true);
});
test('M30+M29 persists .bfn with exact World codec and RNG journal, reopens valid World',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fmu-m29m30-'));
 try{
  const save=path.join(dir,'career.bfn'),doc=worldFixture(),rng=new DeterministicRandomSource(456);
  fs.writeFileSync(save,encodeWorldDocument(doc));const base=hashSaveFile(save);
  const p=prepareM29WorldBatch(doc,rng,1,()=>hooks(),'batch:1');
  const seen:string[]=[];
  const r=commitM29WorldBatch(save,p,e=>seen.push(e.key),base);
  assert.equal(r.state,'committed');assert.equal(seen.length,1);
  const reopened=loadBfnWorld(fs.readFileSync(save));
  assert.equal(reopened.validation.valid,true);assert.equal(reopened.world.game.season_over,true);
  assert.ok(fs.existsSync(save+'.m30.bak'));
  assert.deepEqual(readCommittedRng(save),p.rng);
  assert.equal(recoverCommit(save,()=>{}),null);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('M30+M29 human pause consumes no RNG and refuses checkpoint',()=>{
 const doc=worldFixture(true,false);
 doc.world.clubs[0]!.lineup_set=false;
 const rng=new DeterministicRandomSource(555),start=rng.snapshot();
 const p=prepareM29WorldBatch(doc,rng,1,()=>hooks(),'batch:paused');
 assert.equal(p.completed,0);assert.equal(p.status,'paused');
 assert.deepEqual(p.rng,start);assert.equal(doc.world.game.day,0);
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fmu-m29m30-'));
 try{
  const save=path.join(dir,'career.bfn');fs.writeFileSync(save,encodeWorldDocument(doc));
  assert.throws(()=>commitM29WorldBatch(save,p,()=>{},hashSaveFile(save)),/zero-step|Paused/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('M30+M29 missing real match engine fails without changing original World or RNG',()=>{
 const doc=worldFixture(false,false),rng=new DeterministicRandomSource(555);
 const before=encodeWorldDocument(doc),rs=rng.snapshot();
 assert.throws(()=>prepareM29WorldBatch(doc,rng,1,()=>hooks(),'batch:blocked'),/play_match_day/);
 assert.deepEqual([...encodeWorldDocument(doc)],[...before]);assert.deepEqual(rng.snapshot(),rs);
});
test('M30 World codec rejects invalid references before saving',()=>{
 const doc=worldFixture();doc.world.game.clubs=[900000];
 assert.throws(()=>m29WorldCodec.validate(doc),/World|DANGLING/);
});
