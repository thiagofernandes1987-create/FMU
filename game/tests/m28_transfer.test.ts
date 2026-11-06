/** Functional subset: persistent real-World club transfers, not demo sandbox. */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
import {appendClub,appendPlayer,appendCompetition,appendDay,doc28,world28,defaults} from './m28_helpers';
import {transferWorldPlayer} from '../src/m28/world_transfer';
import {prepareWorldForSave,relinkTransfersFromSaveNumbers} from '../src/m28/save_numbers';
import {writeBfnWorldAtomic,loadBfnWorld,encodeWorldDocument,validateRustWorld} from '../src/m27/persistence/bfn_world';
import {CborRecord} from '../src/m26/persistence/cbor';
const hooks={dateFields:(_now:bigint)=>({year:2031,month:2,day:10})};
function deal(humanSeller=false,humanBuyer=true){const w=world28(),from=appendClub(w,'Seller',humanSeller),to=appendClub(w,'Buyer',humanBuyer);
 const playerId=appendPlayer(w,from);appendDay(w);
 return {doc:doc28(w),from,to,playerId};}
test('M28 transfer: success moves real PlayerId without renumbering and appends history',()=>{
 const {doc,from,to,playerId}=deal(false,true);
 const x=transferWorldPlayer(doc,playerId,to,1000,hooks),w=x.document.world;
 assert.equal(x.fromClubId,from);assert.equal(x.toClubId,to);
 assert.deepEqual(w.clubs[from]!.squad,[]);assert.deepEqual(w.clubs[to]!.squad,[playerId]);
 assert.equal(w.players[playerId]!.club,to);assert.equal(w.players[playerId]!.shirt_number,0);
 assert.equal(w.players[playerId]!.previous_club,doc.world.clubs[from]!.id);
 assert.equal((w.game.transfers as CborRecord[]).length,1);assert.equal(((w.game.transfers as CborRecord[])[0] as CborRecord).fee,1000);
 assert.equal(validateRustWorld(w).valid,true);
});
test('M28 transfer: source Rust AI→human cash ONLY buyer charged, not seller',()=>{
 const {doc,from,to,playerId}=deal(false,true);
 const w=transferWorldPlayer(doc,playerId,to,2000,hooks).document.world;
 assert.equal(BigInt(w.clubs[from]!.cash as number|bigint),100000n);
 assert.equal(w.clubs[to]!.cash,98000n);
 assert.equal((w.clubs[to]!.finances as CborRecord).expense_transfers,2000n);
});
test('M28 transfer: source Rust human→AI income ONLY seller credited',()=>{
 const {doc,from,to,playerId}=deal(true,false);
 const w=transferWorldPlayer(doc,playerId,to,4500,hooks).document.world;
 assert.equal(w.clubs[from]!.cash,104500n);
 assert.equal(BigInt(w.clubs[to]!.cash as number|bigint),100000n);
 assert.equal((w.clubs[from]!.finances as CborRecord).income_transfers,4500n);
});
test('M28 transfer: AI→AI does not change cash in this source function',()=>{
 const {doc,from,to,playerId}=deal(false,false);
 const w=transferWorldPlayer(doc,playerId,to,500,hooks).document.world;
 assert.equal(BigInt(w.clubs[from]!.cash as number|bigint),100000n);assert.equal(BigInt(w.clubs[to]!.cash as number|bigint),100000n);
});
test('M28 transfer: humans on both ends blocked before save mutation',()=>{
 const {doc,to,playerId}=deal(true,true);
 assert.throws(()=>transferWorldPlayer(doc,playerId,to,100,hooks),/human-to-human/);
 assert.equal(doc.world.players[playerId]!.club,0);assert.equal((doc.world.game.transfers as CborRecord[]).length,0);
});
test('M28 transfer: default contract is today + 180 days, per Rust move_player',()=>{
 const {doc,to,playerId}=deal();
 const next=transferWorldPlayer(doc,playerId,to,100,hooks).document.world.players[playerId]!;
 assert.equal(next.contract_until,BigInt(Date.UTC(2031,2,10))+180n*86400000n);
 assert.equal(next.price,next.market_value);
});
test('M28 transfer: clears departed captain and penalty taker, no dangling pointer',()=>{
 const {doc,from,to,playerId}=deal();doc.world.clubs[from]!.captain=playerId;
 doc.world.clubs[from]!.penalty_taker=playerId;
 const w=transferWorldPlayer(doc,playerId,to,100,hooks).document.world;
 assert.equal(w.clubs[from]!.captain,null);assert.equal(w.clubs[from]!.penalty_taker,null);
});
test('M28 transfer: listed flags reset after moving, original unchanged',()=>{
 const {doc,to,playerId}=deal();doc.world.players[playerId]!.listed_for_loan=true;
 doc.world.players[playerId]!.listed_for_sale=true;
 const w=transferWorldPlayer(doc,playerId,to,100,hooks).document.world;
 assert.equal(w.players[playerId]!.listed_for_loan,false);assert.equal(w.players[playerId]!.listed_for_sale,false);
 assert.equal(doc.world.players[playerId]!.listed_for_sale,true);
});
test('M28 transfer: fails when seller squad does not own player',()=>{
 const {doc,to,playerId}=deal();doc.world.clubs[0]!.squad=[];
 assert.throws(()=>transferWorldPlayer(doc,playerId,to,100,hooks),/Ownership mismatch/);
 assert.equal((doc.world.game.transfers as CborRecord[]).length,0);
});
test('M28 transfer: rejects duplicate projected ownership',()=>{
 const {doc,to,playerId}=deal();(doc.world.clubs[to]!.squad as number[]).push(playerId);
 assert.throws(()=>transferWorldPlayer(doc,playerId,to,100,hooks),/already in destination/);
});
test('M28 transfer: contract change refuses a player currently loaned',()=>{
 const {doc,to,playerId}=deal();doc.world.players[playerId]!.on_loan=true;
 assert.throws(()=>transferWorldPlayer(doc,playerId,to,100,hooks),/On-loan/);
});
test('M28 transfer: destination capacity 35 enforced',()=>{
 const {doc,to,playerId}=deal();
 for(let i=0;i<35;i++){
  const p=defaults('Player') as CborRecord;p.club=to;const idx=doc.world.players.length;
  doc.world.players.push(p);(doc.world.clubs[to]!.squad as number[]).push(idx);
 }
 assert.throws(()=>transferWorldPlayer(doc,playerId,to,100,hooks),/exceeds Rust limit/);
});
test('M28 transfer: invalid fee and date rejected without state changes',()=>{
 const {doc,to,playerId}=deal();
 assert.throws(()=>transferWorldPlayer(doc,playerId,to,-1,hooks),/fee/);
 assert.throws(()=>transferWorldPlayer(doc,playerId,to,1,{dateFields:()=>({year:2031,month:12,day:10})}),/Clock.fields/);
 assert.equal((doc.world.game.transfers as CborRecord[]).length,0);
});
test('M28 transfer: transfer + save numbers + .bfn fsync save + read is consistent',()=>{
 const {doc,to,playerId}=deal();const transfer=transferWorldPlayer(doc,playerId,to,1000,hooks);
 const numbered=prepareWorldForSave(transfer.document);
 assert.equal(((numbered.world.game.transfers as CborRecord[])[0] as CborRecord).player_number,0);
 const again=loadBfnWorld(encodeWorldDocument(numbered));
 assert.equal(again.world.players[playerId]!.club,to);
 assert.equal(((again.world.game.transfers as CborRecord[])[0] as CborRecord).player,playerId);
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'fmu-m28-'));
 try{const file=path.join(tmp,'a.bfn');writeBfnWorldAtomic(file,numbered);
  const reopened=loadBfnWorld(fs.readFileSync(file));
  assert.equal(reopened.world.players[playerId]!.club,to);
  assert.deepEqual(relinkTransfersFromSaveNumbers(reopened.world),{relinked:1,unresolved:0});
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});

test('M28 transfer: human buyer without funds cannot acquire player',()=>{
 const {doc,to,playerId}=deal();doc.world.clubs[to]!.cash=0;
 assert.throws(()=>transferWorldPlayer(doc,playerId,to,1000,hooks),/Insufficient cash/);
 assert.equal(doc.world.players[playerId]!.club,0);
});
test('M28 transfer: youth player must use transfer_youth Rust path',()=>{
 const {doc,to,playerId}=deal();doc.world.players[playerId]!.youth=true;
 assert.throws(()=>transferWorldPlayer(doc,playerId,to,1000,hooks),/Youth transfer/);
});
test('M28 transfer: national team cannot buy a player as a club owner',()=>{
 const {doc,to,playerId}=deal();const nat=defaults('Country') as CborRecord;nat.national_team=to;
 doc.world.countries.push(nat);
 assert.throws(()=>transferWorldPlayer(doc,playerId,to,1000,hooks),/National-team/);
});
