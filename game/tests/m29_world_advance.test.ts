/** M29 integration tests on typed Rust World CBOR fixtures; not Rust golden-game parity. */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
import {appendClub,appendPlayer,appendCompetition,appendDay,appendMatch,doc28,world28} from './m28_helpers';
import {CborRecord,encodeCbor} from '../src/m26/persistence/cbor';
import {WorldDocument,RustWorld,encodeWorldDocument,loadBfnWorld} from '../src/m27/persistence/bfn_world';
import {advanceWorldOneDay,recoverWorldPlayer,recoverWorldRoster,runWorldDayTask,WorldAdvanceHooks,WorldAdvanceResult} from '../src/m29_world_advance';
import {persistCareerWorld,openCareerWorld} from '../src/m28/career_world';
const month=(v:bigint)=>new Date(Number(v)).getUTCMonth();
const baseHooks=():WorldAdvanceHooks=>({
 draw100:()=>7,monthOf:month,afterMatch:()=>{},
 endSeason:()=>{},coachChanges:()=>{}
});
function fixture(human=false,played=true,withNext=true){
 const w=world28(),a=appendClub(w,'Human',human),b=appendClub(w,'Visitor',false);
 const {defaults}=require('./m28_helpers');w.coaches.push(defaults('Coach'));(w.game.coaches as number[]).push(0);
 const competition=appendCompetition(w);const day=appendDay(w),mid=appendMatch(w,day,a,b,played);
 w.matches[mid]!.competition=competition;
 w.matches[mid]!.home_goals=2;w.matches[mid]!.away_goals=1;
 w.clubs[a]!.lineup_set=true;w.clubs[b]!.lineup_set=true;
 const p=appendPlayer(w,a,22,300);w.players[p]!.fitness=43;w.players[p]!.started_recently=true;
 (w.game.human_clubs as number[])=human?[a]:[];
 let second:number|undefined;
 if(withNext){second=appendDay(w,Date.UTC(2031,2,17));appendMatch(w,second,a,b,false);}
 return {w,a,b,p,competition,day,mid,second};
}
function finished(r:WorldAdvanceResult){assert.equal('paused' in r,false);return r as Exclude<WorldAdvanceResult,{paused:true}>;}
test('M29 baseline: day with completed result advances, preserving match score, without fictitious engine',()=>{
 const {w,mid,p}=fixture(false,true,true),doc=doc28(w);const before=encodeCbor(doc.world,{allowNonFinite:true});
 const out=finished(advanceWorldOneDay(doc,baseHooks()));
 assert.equal(out.day,0);assert.equal(out.nextDay,1);assert.equal(out.seasonOver,false);
 assert.equal(out.document.world.game.day,1);assert.equal((out.document.world.game.days as CborRecord[])[0]!.done,true);
 assert.equal(out.document.world.matches[mid]!.home_goals,2);
 assert.equal(out.document.world.players[p]!.fitness,73); // age 22, AI club, recently played: +30
 assert.deepEqual(encodeCbor(doc.world,{allowNonFinite:true}),before); // original immutable
});
test('M29 human waiting: no changes, no RNG and no engine call',()=>{
 const {w,a}=fixture(true,false);w.clubs[a]!.lineup_set=false;const doc=doc28(w);
 let calls=0;const result=advanceWorldOneDay(doc,{...baseHooks(),draw100:()=>{calls++;return 1;}});
 assert.equal('paused' in result,true);assert.equal(calls,0);
 if('paused' in result){assert.equal(result.clubId,a);assert.equal(result.document,doc);}
});
test('M29 human confirmed lineup: demands external engine for unplayed match',()=>{
 const {w}=fixture(true,false),doc=doc28(w);
 assert.throws(()=>advanceWorldOneDay(doc,baseHooks()),/play_match_day/);
});
test('M29 adapter can apply a real external engine result and persist event',()=>{
 const {w,mid}=fixture(false,false),doc=doc28(w);let called=0;
 const out=finished(advanceWorldOneDay(doc,{...baseHooks(),playMatch:(world,id)=>{
  called++;assert.equal(id,mid);world.matches[id]!.played=true;
  world.matches[id]!.home_goals=3;world.matches[id]!.away_goals=0;
  world.matches[id]!.extra_engine_trace={provider:'external',version:1};
 }}));
 assert.equal(called,1);assert.equal(out.document.world.matches[mid]!.away_goals,0);
 assert.equal((out.document.world.matches[mid]!.extra_engine_trace as CborRecord).provider,'external');
});
test('M29 invalid engine score causes rollback of whole World',()=>{
 const {w}=fixture(false,false),doc=doc28(w),before=encodeCbor(doc.world,{allowNonFinite:true});
 assert.throws(()=>advanceWorldOneDay(doc,{...baseHooks(),playMatch:(_world,id)=>{
  _world.matches[id]!.played=true;_world.matches[id]!.home_goals=-20;
 }}),/Invalid match engine score/);
 assert.deepEqual(encodeCbor(doc.world,{allowNonFinite:true}),before);
});
test('M29 unmarked match after hook is rejected and original World remains',()=>{
 const {w}=fixture(false,false),doc=doc28(w);
 assert.throws(()=>advanceWorldOneDay(doc,{...baseHooks(),playMatch:()=>{}}),/did not mark played/);
 assert.equal(doc.world.game.day,0);assert.equal(doc.world.matches[0]!.played,false);
});
test('M29 successful terminal day requires explicit endSeason hook',()=>{
 const {w}=fixture(false,true,false),doc=doc28(w);
 assert.throws(()=>advanceWorldOneDay(doc,{...baseHooks(),endSeason:undefined}),/end_season/);
 const end=finished(advanceWorldOneDay(doc,baseHooks()));
 assert.equal(end.seasonOver,true);assert.equal(end.nextDay,null);assert.equal(end.document.world.game.season_over,true);
});
test('M29 double advance of a done day rejected, no double accounting',()=>{
 const {w}=fixture();(w.game.days as CborRecord[])[0]!.done=true;
 assert.throws(()=>advanceWorldOneDay(doc28(w),baseHooks()),/already done/);
});
test('M29 postmatch without hook blocks instead of pretending stats were updated',()=>{
 const {w}=fixture();assert.throws(()=>advanceWorldOneDay(doc28(w),{...baseHooks(),afterMatch:undefined}),/after_match/);
});
test('M29 stage missing handler blocks and preserves World',()=>{
 const {w}=fixture(),stage={...w.stages[0]};void stage;
 const id=w.stages.length; // use a strict Stage fixture, valid against Rust schema
 const {defaults}=require('./m28_helpers');w.stages.push(defaults('Stage'));
 ((w.game.days as CborRecord[])[0]!.stages as number[]).push(id);
 assert.throws(()=>advanceWorldOneDay(doc28(w),baseHooks()),/league_round/);
});
test('M29 stage processor called once, can update round transactionally',()=>{
 const {w}=fixture();const {defaults}=require('./m28_helpers');w.stages.push(defaults('Stage'));
 ((w.game.days as CborRecord[])[0]!.stages as number[]).push(0);
 const next=finished(advanceWorldOneDay(doc28(w),{...baseHooks(),processStage:(x,s)=>{x.stages[s]!.round=1;}}));
 assert.equal(next.document.world.stages[0]!.round,1);
});
test('M29 invalid stage processor change rolls back to original doc',()=>{
 const {w}=fixture(),{defaults}=require('./m28_helpers');w.stages.push(defaults('Stage'));
 ((w.game.days as CborRecord[])[0]!.stages as number[]).push(0);
 const doc=doc28(w);
 assert.throws(()=>advanceWorldOneDay(doc,{...baseHooks(),processStage:(x,s)=>{x.stages[s]!.round=-100;x.matches[0]!.home=999;}}),/DANGLING_REFERENCE/);
 assert.equal(doc.world.stages[0]!.round,0);assert.equal(doc.world.matches[0]!.home,0);
});
test('M29 task wages ds applies only human clubs participating that month',()=>{
 const {w,a,b,p}=fixture(true),doc=doc28(w);
 (w.game.days as CborRecord[])[0]!.tasks_before=['ds'];
 const out=finished(advanceWorldOneDay(doc28(w),baseHooks()));
 assert.equal(out.document.world.clubs[a]!.cash,99700n);
 assert.equal(BigInt(out.document.world.clubs[b]!.cash as number),100000n);
 assert.deepEqual(out.tasks,['pre:0:ds']);void p;void doc;
});
test('M29 dJ task charges bank interest of human club and finance category 4',()=>{
 const {w,a}=fixture(true);(w.game.days as CborRecord[])[0]!.tasks_before=['dJ'];
 (w.clubs[a]!.finances as CborRecord).bank_interest=150;
 const out=finished(advanceWorldOneDay(doc28(w),baseHooks()));
 assert.equal(out.document.world.clubs[a]!.cash,99850n);
 assert.equal((out.document.world.clubs[a]!.finances as CborRecord).expense_type4,150);
});
test('M29 task aj is not dropped: explicit evolution required',()=>{
 const {w}=fixture();(w.game.days as CborRecord[])[0]!.tasks_before=['aj'];
 assert.throws(()=>advanceWorldOneDay(doc28(w),baseHooks()),/evolve_players/);
 const out=finished(advanceWorldOneDay(doc28(w),{...baseHooks(),evolvePlayers:x=>{x.game.bfn_m29_evolution='executed';}}));
 assert.equal(out.document.world.game.bfn_m29_evolution,'executed');
});
test('M29 missing unknown task handler blocked rather than erased',()=>{
 const {w}=fixture();(w.game.days as CborRecord[])[0]!.tasks_before=['cw'];
 assert.throws(()=>advanceWorldOneDay(doc28(w),baseHooks()),/day_task\(cw\)/);
});
test('M29 future after-tasks run in Rust nextDay order, exactly once',()=>{
 const {w}=fixture();(w.game.days as CborRecord[])[1]!.tasks_after=['cS'];
 let calls=0;const out=finished(advanceWorldOneDay(doc28(w),{...baseHooks(),processTask:(_world,c,origin,after)=>{
   assert.equal(c,'cS');assert.equal(origin,1);assert.equal(after,true);calls++;
 }}));
 assert.equal(calls,1);assert.deepEqual(out.tasks,['post:1:cS']);
 assert.deepEqual((out.document.world.game.days as CborRecord[])[1]!.tasks_after,[]);
});
test('M29 task handler throwing after match rollback restores all World data',()=>{
 const {w}=fixture();(w.game.days as CborRecord[])[1]!.tasks_after=['cS'];
 const doc=doc28(w),before=encodeCbor(doc.world,{allowNonFinite:true});
 assert.throws(()=>advanceWorldOneDay(doc,{...baseHooks(),processTask:()=>{throw Error('failure');}}),/failure/);
 assert.deepEqual(encodeCbor(doc.world,{allowNonFinite:true}),before);
});
test('M29 fee/cash i64 preserved through day advance and .bfn reopen',()=>{
 const {w,a}=fixture(true);w.clubs[a]!.cash=9007199254741993n;
 (w.game.days as CborRecord[])[0]!.tasks_before=['ds'];
 const doc=doc28(w),out=finished(advanceWorldOneDay(doc,baseHooks()));
 assert.equal(out.document.world.clubs[a]!.cash,9007199254741693n);
 const reopened=openCareerWorld(encodeWorldDocument(out.document));
 assert.equal(reopened.document.world.clubs[a]!.cash,9007199254741693n);
});
test('M29 end-to-end disk: .bfn -> simulated engine -> World -> atomic save -> re-open preserves ids',()=>{
 const {w,a,b,p,mid}=fixture(false,false),doc=doc28(w);
 const out=finished(advanceWorldOneDay(doc,{...baseHooks(),playMatch:(world,id)=>{
  world.matches[id]!.played=true;world.matches[id]!.home_goals=2;world.matches[id]!.away_goals=2;
 }}));
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fmu-m29-'));try{
  const target=path.join(dir,'career.bfn');const stored=persistCareerWorld(target,out.document);
  assert.equal(stored.reopened.document.world.game.day,1);
  assert.equal(stored.reopened.document.world.matches[mid]!.home, a);
  assert.equal(stored.reopened.document.world.matches[mid]!.away,b);
  assert.equal(stored.reopened.document.world.players[p]!.club,a);
  assert.equal(stored.reopened.document.world.matches[mid]!.home_goals,2);
  assert.equal(stored.reopened.document.world.matches[mid]!.away_goals,2);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('M29 recover Rust age thresholds human recent: 20/25/31/36/older',()=>{
 const {w,a}=fixture(true),p=appendPlayer(w,a);let age=0;
 for(const [n,expected] of [[20,13],[25,24],[31,37],[36,40],[40,30]]){
  age=n!;w.players[p]!.age=age;w.players[p]!.fitness=0;w.players[p]!.started_recently=true;
  recoverWorldPlayer(w,p,true);assert.equal(w.players[p]!.fitness,expected);
 }
});
test('M29 recover Rust age thresholds AI recent: 20/25/31/36/older',()=>{
 const {w,a}=fixture(),p=appendPlayer(w,a);
 for(const [n,expected] of [[20,20],[25,30],[31,50],[36,52],[40,42]]){
  w.players[p]!.age=n;w.players[p]!.fitness=0;w.players[p]!.started_recently=true;
  recoverWorldPlayer(w,p,false);assert.equal(w.players[p]!.fitness,expected);
 }
});
test('M29 recover Rust inactive + youth returns 100, caps stamina',()=>{
 const {w,a,p}=fixture();w.players[p]!.started_recently=false;
 w.players[p]!.fitness=96;recoverWorldPlayer(w,p,false);assert.equal(w.players[p]!.fitness,100);
 const y=appendPlayer(w,a,17,100);(w.game.players as number[]).pop();(w.game.youth_players as number[]).push(y);
 w.players[y]!.fitness=7;recoverWorldRoster(w,1);assert.equal(w.players[y]!.fitness,100);
});
test('M29 bad draw RNG causes rollback, not false season advancement',()=>{
 const {w}=fixture(),doc=doc28(w);
 assert.throws(()=>advanceWorldOneDay(doc,{...baseHooks(),draw100:()=>101}),/fresh_int/);
 assert.equal(doc.world.game.day,0);assert.equal(doc.world.game.season_over,false);
});
test('M29 seasonal flag refuses new season without full calendar integration',()=>{
 const {w}=fixture();w.game.season_over=true;
 assert.throws(()=>advanceWorldOneDay(doc28(w),baseHooks()),/new_season/);
});
test('M29 loans require real return handler; not silently removed',()=>{
 const {w}=fixture();const {defaults}=require('./m28_helpers');(w.game.loans as unknown as any[]).push(defaults('Loan'));
 assert.throws(()=>advanceWorldOneDay(doc28(w),baseHooks()),/missing required real-engine hook: loans_coming_back/);
});
import {assessWorldAdvance,advanceWorldDays,persistAdvancedBatch} from '../src/m29_world_driver';
test('M29 readiness shows real engine requirements for unplayed schedule',()=>{
 const {w}=fixture(false,false);w.clubs[0]!.lineup_set=false;
 const view=assessWorldAdvance(doc28(w));
 assert.ok(view.requiredHooks.includes('play_match_day'));
 assert.ok(view.requiredHooks.includes('pick_ai_lineup'));
 assert.ok(view.requiredHooks.includes('after_match'));
 assert.equal(view.engineParityVerified,false);
});
test('M29 readiness detects human awaiting lineup',()=>{
 const {w,a}=fixture(true,false);w.clubs[a]!.lineup_set=false;
 const view=assessWorldAdvance(doc28(w));assert.equal(view.humanWaiting?.clubId,a);
 assert.ok(view.requiredHooks.includes('human_lineup'));
});
test('M29 AI lineup hook is mandatory before match engine',()=>{
 const {w,b}=fixture(false,false);w.clubs[b]!.lineup_set=false;
 const d=doc28(w);assert.throws(()=>advanceWorldOneDay(d,{...baseHooks(),playMatch:(world,id)=>{world.matches[id]!.played=true;}}),/pick_ai_lineup/);
});
test('M29 AI lineup hook must confirm the lineup',()=>{
 const {w,b}=fixture(false,false);w.clubs[b]!.lineup_set=false;
 assert.throws(()=>advanceWorldOneDay(doc28(w),{...baseHooks(),pickAiLineup:()=>{},playMatch:(world,id)=>{world.matches[id]!.played=true;}}),/AI lineup was not confirmed/);
});
test('M29 external AI lineup hook runs before real engine and persists lineup flag',()=>{
 const {w,b}=fixture(false,false);w.clubs[b]!.lineup_set=false;
 const calls:string[]=[];
 const r=finished(advanceWorldOneDay(doc28(w),{...baseHooks(),
  pickAiLineup:(world,_mid,cid)=>{calls.push('lineup');world.clubs[cid]!.lineup_set=true;},
  playMatch:(world,mid)=>{calls.push('match');world.matches[mid]!.played=true;}}));
 assert.deepEqual(calls,['lineup','match']);assert.equal(r.document.world.clubs[b]!.lineup_set,true);
});
test('M29 multi-day World batch can advance two consecutive games and persist both',()=>{
 const {w,mid}=fixture(false,false);
 const calls:number[]=[];
 const hooks={...baseHooks(),playMatch:(world:RustWorld,id:number)=>{
  calls.push(id);world.matches[id]!.played=true;world.matches[id]!.home_goals=id+1;world.matches[id]!.away_goals=0;
 }};
 const source=doc28(w),out=advanceWorldDays(source,hooks,2);
 assert.equal(out.completed.length,2);assert.equal(out.seasonOver,true);
 assert.deepEqual(calls,[0,1]);assert.equal(out.document.world.matches[mid]!.home_goals,1);
 assert.equal(out.document.world.matches[1]!.home_goals,2);
 assert.equal(source.world.matches[mid]!.played,false);
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fmu-m29-batch-'));try{
  const saved=persistAdvancedBatch(path.join(dir,'career.bfn'),out);
  assert.equal(saved.reopened.world.game.season_over,true);
  assert.equal(saved.reopened.world.matches[1]!.home_goals,2);
  assert.deepEqual((saved.reopened.world.game.days as CborRecord[]).map(d=>d.done),[true,true]);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('M29 second-day error in batch never changes original doc',()=>{
 const {w}=fixture(false,false),doc=doc28(w),snapshot=encodeCbor(doc.world,{allowNonFinite:true});
 assert.throws(()=>advanceWorldDays(doc,{...baseHooks(),playMatch:(world,id)=>{
  if(id===1)throw Error('day2 fixture fails');world.matches[id]!.played=true;
 }},2),/day2 fixture fails/);
 assert.deepEqual(encodeCbor(doc.world,{allowNonFinite:true}),snapshot);
});
test('M29 cannot checkpoint incomplete/paused batch',()=>{
 const {w,a}=fixture(true,false);w.clubs[a]!.lineup_set=false;
 const paused=advanceWorldDays(doc28(w),baseHooks(),1);
 assert.equal(paused.completed.length,0);
 assert.throws(()=>persistAdvancedBatch('/tmp/forbidden.bfn',paused),/No completed career batch/);
});
test('M29 rejects excessive batch and missing season engine',()=>{
 const {w}=fixture();assert.throws(()=>advanceWorldDays(doc28(w),baseHooks(),1001),/maxDays/);
 const out=advanceWorldDays(doc28(w),baseHooks(),1);
 assert.throws(()=>advanceWorldDays(out.document,baseHooks(),2),/play_match_day/);
});
test('M29 future unrelated task does not block earlier day',()=>{
 const {w}=fixture();const future=appendDay(w,Date.UTC(2031,4,1));
 (w.game.days as CborRecord[])[future]!.tasks_before=['cw'];
 const out=finished(advanceWorldOneDay(doc28(w),baseHooks()));assert.equal(out.nextDay,1);
});
test('M29 national league team of round hook is required before stage processing',()=>{
 const {w,competition}=fixture();const {defaults}=require('./m28_helpers');
 const s=defaults('Stage') as CborRecord;s.class='League';s.kind=1;s.country_ref=0;
 w.stages.push(s);const c=defaults('Country') as CborRecord;c.divisions=[competition];w.countries.push(c);
 w.competitions[competition]!.league=0;
 ((w.game.days as CborRecord[])[0]!.stages as number[]).push(0);
 assert.throws(()=>advanceWorldOneDay(doc28(w),{...baseHooks(),processStage:()=>{}}),/team_of_the_round/);
 const events:string[]=[];
 const out=finished(advanceWorldOneDay(doc28(w),{...baseHooks(),
  teamOfRound:()=>events.push('team'),processStage:()=>events.push('stage')}));
 assert.deepEqual(events,['team','stage']);assert.equal(out.document.world.game.day,1);
});
test('M29 unknown World extension (CBOR map, bytes and bigint) survives real advance + re-open',()=>{
 const {w}=fixture();w.game.future_version={fee:9223372036854775800n,binary:Uint8Array.from([0,255,7]),
  mapping:new Map([[2n,'world']])};
 const doc=doc28(w),out=finished(advanceWorldOneDay(doc,baseHooks()));
 const r=openCareerWorld(encodeWorldDocument(out.document)).document;
 const ext=r.world.game.future_version as CborRecord;
 assert.equal(ext.fee,9223372036854775800n);assert.deepEqual([...ext.binary as Uint8Array],[0,255,7]);
 assert.equal((ext.mapping as Map<number,string>).get(2),'world'); // canonical CBOR small integer decodes to JS number
});
test('M29 i64 overflow on wage rollback does not mutate or discard preceding tasks',()=>{
 const {w,a}=fixture(true);w.clubs[a]!.cash=-(1n<<63n)+50n;
 (w.game.days as CborRecord[])[0]!.tasks_before=['ds'];
 const doc=doc28(w),bytes=encodeCbor(doc.world,{allowNonFinite:true});
 assert.throws(()=>advanceWorldOneDay(doc,baseHooks()),/overflow/);
 assert.deepEqual(encodeCbor(doc.world,{allowNonFinite:true}),bytes);
 assert.deepEqual((doc.world.game.days as CborRecord[])[0]!.tasks_before,['ds']);
});
test('M29 listed player sale uses verified RNG branch and fails closed without engine hook',()=>{
 const {w,a,p}=fixture(true);w.players[p]!.listed_for_sale=true;
 const doc=doc28(w);
 assert.throws(()=>advanceWorldOneDay(doc,{...baseHooks(),draw100:()=>70}),/sell_listed_players/);
 let invoked=0;
 const out=finished(advanceWorldOneDay(doc,{...baseHooks(),draw100:()=>70,
  sellListed:(ww)=>{invoked++;ww.players[p]!.listed_for_sale=false;}}));
 assert.equal(invoked,1);assert.equal(out.document.world.players[p]!.listed_for_sale,false);
 assert.equal(doc.world.players[p]!.listed_for_sale,true);
});
test('M29 no sale draw does not call an unrelated sell hook',()=>{
 const {w,p}=fixture(true);w.players[p]!.listed_for_sale=true;
 const out=finished(advanceWorldOneDay(doc28(w),{...baseHooks(),draw100:()=>25,sellListed:()=>{throw Error('not supposed to run');}}));
 assert.equal(out.draw,25);assert.equal(out.document.world.players[p]!.listed_for_sale,true);
});
import {runM29WorldCli} from '../src/m29_world_cli';
test('M29 read-only CLI reports missing engine rather than claiming simulated career',()=>{
 const {w}=fixture(false,false),d=doc28(w),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'fmu-m29-cli-'));
 try{
  const target=path.join(tmp,'sample.bfn');fs.writeFileSync(target,encodeWorldDocument(d));
  const before=fs.readFileSync(target),result=runM29WorldCli(['inspect',target]);
  assert.equal(result.worldStructurallyValid,true);
  assert.equal(result.readyForOriginalRustGameplay,false);
  assert.ok((result.requiredEngineIntegrations as string[]).includes('play_match_day'));
  assert.deepEqual(fs.readFileSync(target),before);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('M29 CLI rejects unsupported mutating commands',()=>{
 assert.throws(()=>runM29WorldCli(['advance','/tmp/career.bfn']),/Usage: inspect/);
});
