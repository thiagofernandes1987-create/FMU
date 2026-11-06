/** Rust World finance / game day tests, schema-valid fixtures (not original golden fixtures). */
const test=require('node:test'),assert=require('node:assert/strict');
import {appendClub,appendPlayer,appendCompetition,appendDay,appendMatch,doc28,world28} from './m28_helpers';
import {findNextPlayableDay,firstWaitingHumanLineup,worldMatchKind,inspectWorldDay,playsWorldMatchInMonth} from '../src/m28/world_calendar';
import {worldClubWages,worldClubIncome,worldClubPayment,worldClubExpense} from '../src/m28/world_finances';
import {CborRecord} from '../src/m26/persistence/cbor';
const daysOf=(v:bigint)=>new Date(Number(v)).getUTCMonth();
function setupDay(){const w=world28(),a=appendClub(w,'Human',true),b=appendClub(w,'AI',false);
 const c=appendCompetition(w),day=appendDay(w),match=appendMatch(w,day,a,b);w.matches[match]!.competition=c;
 return {w,a,b,c,day,match};}
test('M28 calendar: first playable day skips empty, done and zero-kind days',()=>{
 const {w,match}=setupDay(),extra=appendDay(w,Date.UTC(2031,3,2));
 (w.game.days as CborRecord[])[0]!.done=true;
 (w.game.days as CborRecord[])[extra]!.matches=[match];
 assert.equal(findNextPlayableDay(w),extra);
});
test('M28 calendar: search starts from cursor, does not mutate day cursor',()=>{
 const {w,match}=setupDay(),second=appendDay(w,Date.UTC(2031,3,2));
 (w.game.days as CborRecord[])[second]!.matches=[match];w.game.day=second;
 assert.equal(findNextPlayableDay(w),second);assert.equal(w.game.day,second);
});
test('M28 calendar: season end reports undefined, does not auto-create new season',()=>{
 const {w}=setupDay();(w.game.days as CborRecord[])[0]!.done=true;
 assert.equal(findNextPlayableDay(w),undefined);assert.equal(w.game.season_over,false);
});
test('M28 calendar: human team with pending lineup blocks play, AI not considered',()=>{
 const {w,a,b,day,match}=setupDay();
 assert.deepEqual(firstWaitingHumanLineup(w,day),{clubId:a,matchId:match});
 w.clubs[a]!.lineup_set=true;assert.equal(firstWaitingHumanLineup(w,day),undefined);
});
test('M28 calendar: the first of two human clubs with unset lineup wins',()=>{
 const {w,a,b,day,match}=setupDay();w.clubs[b]!.human=true;
 assert.deepEqual(firstWaitingHumanLineup(w,day),{clubId:a,matchId:match});
 w.clubs[a]!.lineup_set=true;assert.deepEqual(firstWaitingHumanLineup(w,day),{clubId:b,matchId:match});
});
test('M28 calendar: match kind from competition arena, zero when friendly',()=>{
 const {w,match}=setupDay();w.competitions[0]!.kind=8;
 assert.equal(worldMatchKind(w,match),8);w.matches[match]!.competition=null;
 assert.equal(worldMatchKind(w,match),0);
});
test('M28 calendar: matches check game clock month, not system month',()=>{
 const {w,a,b}=setupDay();assert.equal(playsWorldMatchInMonth(w,a,2,daysOf),true);
 assert.equal(playsWorldMatchInMonth(w,b,1,daysOf),false);
 assert.throws(()=>playsWorldMatchInMonth(w,a,12,daysOf),/month/);
});
test('M28 calendar: inspect day lists unplayed, waiting, competition kind and tasks',()=>{
 const {w,match}=setupDay();const day=(w.game.days as CborRecord[])[0]!;
 day.tasks_before=['cw'];day.tasks_after=['aj'];w.competitions[0]!.kind=3;
 const p=inspectWorldDay(doc28(w));assert.equal(p.matches[0]?.competitionKind,3);
 assert.deepEqual(p.unplayed,[match]);assert.equal(p.eligibleForAfterDay,false);
 assert.deepEqual(p.tasksBefore,['cw']);assert.deepEqual(p.tasksAfter,['aj']);
});
test('M28 calendar: completed matches enable inspection-only after_day flag',()=>{
 const {w,match}=setupDay();w.matches[match]!.played=true;
 const p=inspectWorldDay(doc28(w));assert.equal(p.eligibleForAfterDay,true);
 assert.equal(p.unplayed.length,0);assert.equal((w.game.days as CborRecord[])[0]!.done,false);
});
test('M28 calendar: no double-playing a completed day',()=>{
 const {w,match}=setupDay();w.matches[match]!.played=true;
 (w.game.days as CborRecord[])[0]!.done=true;
 assert.equal(inspectWorldDay(doc28(w)).eligibleForAfterDay,false);
});
test('M28 finance: wages include youth and senior salaries, bigint exact',()=>{
 const w=world28(),c=appendClub(w);appendPlayer(w,c,24,18000);const kid=appendPlayer(w,c,17,300);
 (w.clubs[c]!.squad as number[]).pop();(w.clubs[c]!.youth_squad as number[]).push(kid);
 assert.equal(worldClubWages(w,c),18300n);
});
test('M28 finance: human income category 1 records transfers, AI income untouched only finance category',()=>{
 const w=world28(),h=appendClub(w,'Human',true),a=appendClub(w,'AI',false);
 worldClubIncome(w,h,500,1);worldClubIncome(w,a,500,1);
 assert.equal(w.clubs[h]!.cash,100500n);assert.equal(w.clubs[a]!.cash,100500n);
 assert.equal((w.clubs[h]!.finances as CborRecord).income_transfers,500n);
 assert.equal((w.clubs[a]!.finances as CborRecord).income_transfers,0);
});
test('M28 finance: category 3/5/6/9 routed to exact human fields',()=>{
 const w=world28(),h=appendClub(w,'Human',true);
 for(const kind of [3,5,6,9])worldClubIncome(w,h,kind*10,kind);
 const f=w.clubs[h]!.finances as CborRecord;
 assert.deepEqual([f.income_type3,f.income_type5,f.income_type6,f.income_type9],[30,50,60,90]);
});
test('M28 finance: payments category 1/4/7/8 and other, no accidental income',()=>{
 const w=world28(),h=appendClub(w,'Human',true);
 for(const kind of [1,4,7,8,99])worldClubPayment(w,h,kind,kind);
 const f=w.clubs[h]!.finances as CborRecord;
 assert.deepEqual([f.expense_transfers,f.expense_type4,f.expense_type7,f.expense_type8,f.expense_other],[1n,4,7,8,99]);
 assert.equal(w.clubs[h]!.cash,100000n-BigInt(1+4+7+8+99));
});
test('M28 finance: human expense salary i64 over JS safe integer remains exact',()=>{
 const w=world28(),h=appendClub(w,'Human',true);
 w.clubs[h]!.cash=9007199254741999n;
 worldClubExpense(w,h,9007199254740993n);
 assert.equal(w.clubs[h]!.cash,1006n);assert.equal((w.clubs[h]!.finances as CborRecord).expense_salaries,9007199254740993n);
});
test('M28 finance: rejects invalid i32 and i64 overflows before mutation',()=>{
 const w=world28(),h=appendClub(w,'Human',true);
 const prior=w.clubs[h]!.cash;
 assert.throws(()=>worldClubIncome(w,h,2147483648,1),/i32/);
 assert.throws(()=>worldClubExpense(w,h,1n<<63n),/i64/);
 assert.equal(w.clubs[h]!.cash,prior);
});
test('M28 finance: bad category cannot partially mutate account',()=>{
 const w=world28(),h=appendClub(w,'Human',true),f=w.clubs[h]!.finances as CborRecord;
 f.expense_type7=2147483647;
 assert.throws(()=>worldClubPayment(w,h,1,7),/overflow/);
 assert.equal(w.clubs[h]!.cash,100000n);assert.equal(f.expense_type7,2147483647);
});
test('M28 finance: club index and player references validated',()=>{
 const w=world28(),h=appendClub(w);assert.throws(()=>worldClubWages(w,4),/ClubId/);
 (w.clubs[h]!.squad as number[]).push(99);assert.throws(()=>worldClubWages(w,h),/PlayerId/);
});
