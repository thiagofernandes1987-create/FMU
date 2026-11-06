/** Mirrors the concrete scenarios in Rust model/src/save_numbers.rs tests. */
const test=require('node:test'),assert=require('node:assert/strict');
import {world28,appendPlayer,appendClub,appendCompetition,appendDay,doc28,defaults} from './m28_helpers';
import {numberPlayersForSave,relinkTransfersFromSaveNumbers,relinkOneTransfer,
 indexPlayersBySaveNumber,calendarCompetitions,linkCompetitionStats,numberCompetitionsForSave,prepareWorldForSave} from '../src/m28/save_numbers';
import {loadBfnWorld,encodeWorldDocument,validateRustWorld} from '../src/m27/persistence/bfn_world';
import {CborRecord} from '../src/m26/persistence/cbor';
test('M28 save_numbers: main list precedes youth list, contiguous 0..2',()=>{
 const w=world28(),c=appendClub(w);appendPlayer(w,c);appendPlayer(w,c);appendPlayer(w,c);
 w.game.players=[0,1];w.game.youth_players=[2];
 assert.deepEqual(numberPlayersForSave(w),{players:3,transfers:0});
 assert.deepEqual(w.players.map(p=>[p.save_number,p.save_list]),[[0,1],[1,1],[2,2]]);
});
test('M28 save_numbers: source Rust retired player linked to replacement with reused number',()=>{
 const w=world28(),c=appendClub(w);appendPlayer(w,c);appendPlayer(w,c);appendPlayer(w,c);
 w.game.players=[0,1];w.game.youth_players=[2];
 w.game.transfers=[Object.assign(defaults('Transfer') as CborRecord,{player:1,fee:1000})];
 numberPlayersForSave(w);relinkTransfersFromSaveNumbers(w);
 assert.equal((w.game.transfers[0] as CborRecord).player,1);
 appendPlayer(w,c);w.game.players=[3,0];w.game.transfers.push(Object.assign(defaults('Transfer') as CborRecord,{player:3}));
 numberPlayersForSave(w);
 assert.equal((w.game.transfers[0] as CborRecord).player_number,1);
 relinkTransfersFromSaveNumbers(w);
 assert.equal((w.game.transfers[0] as CborRecord).player,0);
 assert.equal((w.game.transfers[1] as CborRecord).player,3);
});
test('M28 save_numbers: retired player absent before first save becomes unresolved',()=>{
 const w=world28(),c=appendClub(w);appendPlayer(w,c);appendPlayer(w,c);
 w.game.players=[0];w.game.transfers=[Object.assign(defaults('Transfer') as CborRecord,{player:1})];
 numberPlayersForSave(w);assert.equal((w.game.transfers[0] as CborRecord).player_number,-1);
 assert.deepEqual(relinkTransfersFromSaveNumbers(w),{relinked:0,unresolved:1});
 assert.equal((w.game.transfers[0] as CborRecord).player,null);
});
test('M28 save_numbers: missing player sets transfer player_number = -1 but leaves save_list',()=>{
 const w=world28();w.game.transfers=[Object.assign(defaults('Transfer') as CborRecord,{player:null,player_list:2,player_number:10})];
 numberPlayersForSave(w);assert.equal((w.game.transfers[0] as CborRecord).player_number,-1);
 assert.equal((w.game.transfers[0] as CborRecord).player_list,2);
});
test('M28 save_numbers: duplicates preserve the first player in source list',()=>{
 const w=world28(),c=appendClub(w);appendPlayer(w,c);appendPlayer(w,c);
 w.players[0]!.save_number=9;w.players[1]!.save_number=9;
 assert.equal(indexPlayersBySaveNumber(w).get('1:9'),0);
});
test('M28 save_numbers: full relink clears stale references even without a replacement',()=>{
 const w=world28(),c=appendClub(w);appendPlayer(w,c);w.game.transfers=[Object.assign(defaults('Transfer') as CborRecord,{player:0,player_list:1,player_number:999})];
 const ret=relinkTransfersFromSaveNumbers(w);assert.equal(ret.unresolved,1);
 assert.equal((w.game.transfers[0] as CborRecord).player,null);
});
test('M28 save_numbers: single relink retains transient link when no number matches',()=>{
 const w=world28(),c=appendClub(w);appendPlayer(w,c);
 w.game.transfers=[Object.assign(defaults('Transfer') as CborRecord,{player:0,player_list:1,player_number:999})];
 assert.equal(relinkOneTransfer(w,0),false);assert.equal((w.game.transfers[0] as CborRecord).player,0);
 assert.throws(()=>relinkOneTransfer(w,10),/index/);
});
test('M28 save_numbers: single relink can resolve youth player',()=>{
 const w=world28(),c=appendClub(w),p=appendPlayer(w,c);w.game.players=[];w.game.youth_players=[p];w.players[p]!.save_number=12;
 w.game.transfers=[Object.assign(defaults('Transfer') as CborRecord,{player:null,player_list:2,player_number:12})];
 assert.equal(relinkOneTransfer(w,0),true);assert.equal((w.game.transfers[0] as CborRecord).player,p);
});
test('M28 save_numbers: calendar order first appearance, not arena allocation',()=>{
 const w=world28(),a=appendCompetition(w),b=appendCompetition(w),c=appendCompetition(w);
 appendDay(w);appendDay(w);
 (w.game.days as CborRecord[])[0]!.competitions=[c,a,a];(w.game.days as CborRecord[])[1]!.competitions=[b,c];
 assert.deepEqual(calendarCompetitions(w),[c,a,b]);
});
test('M28 save_numbers: competitions assign IDs and stats link after clearing transient references',()=>{
 const w=world28(),club=appendClub(w),p=appendPlayer(w,club),a=appendCompetition(w),b=appendCompetition(w);
 appendDay(w);(w.game.days as CborRecord[])[0]!.competitions=[b,a];
 w.players[p]!.competition_stats=[Object.assign(defaults('CompetitionStats') as CborRecord,{competition_id:a,competition_number:-1})];
 assert.deepEqual(numberCompetitionsForSave(w),{competitions:2,statsLinked:1});
 assert.equal(w.competitions[b]!.legacy_id,0);assert.equal(w.competitions[a]!.legacy_id,1);
 assert.equal((w.players[p]!.competition_stats as CborRecord[])[0]!.competition_number,1);
 assert.equal((w.players[p]!.competition_stats as CborRecord[])[0]!.competition_id,a);
});
test('M28 save_numbers: matching duplicate legacy numbers resolves first calendar occurrence',()=>{
 const w=world28(),club=appendClub(w),p=appendPlayer(w,club),a=appendCompetition(w),b=appendCompetition(w);
 appendDay(w);(w.game.days as CborRecord[])[0]!.competitions=[a,b];w.competitions[a]!.legacy_id=9;w.competitions[b]!.legacy_id=9;
 w.players[p]!.competition_stats=[Object.assign(defaults('CompetitionStats') as CborRecord,{competition_number:9,competition_id:null})];
 assert.equal(linkCompetitionStats(w),1);
 assert.equal((w.players[p]!.competition_stats as CborRecord[])[0]!.competition_id,a);
});
test('M28 save_numbers: unused retired stats keep legacy number and lose transient ID',()=>{
 const w=world28(),club=appendClub(w),p=appendPlayer(w,club),a=appendCompetition(w);
 w.players[p]!.competition_stats=[Object.assign(defaults('CompetitionStats') as CborRecord,{competition_number:42,competition_id:a})];
 w.game.players=[];appendDay(w);numberCompetitionsForSave(w);
 assert.equal((w.players[p]!.competition_stats as CborRecord[])[0]!.competition_id,null);
 assert.equal((w.players[p]!.competition_stats as CborRecord[])[0]!.competition_number,42);
});
test('M28 save_numbers: prepareWorldForSave produces independent validated document',()=>{
 const w=world28(),club=appendClub(w),p=appendPlayer(w,club);appendDay(w);
 const doc=doc28(w),post=prepareWorldForSave(doc);
 assert.equal(doc.world.players[p]!.save_number,-1);assert.equal(post.world.players[p]!.save_number,0);
 assert.equal(validateRustWorld(post.world).valid,true);
 const after=loadBfnWorld(encodeWorldDocument(post));assert.equal(after.world.players[p]!.save_number,0);
});
test('M28 save_numbers: invalid player index rejected without changing original World',()=>{
 const w=world28(),club=appendClub(w);appendPlayer(w,club);appendDay(w);
 const d=doc28(w);d.world.game.players=[5];assert.throws(()=>prepareWorldForSave(d),/Invalid player arena/);
 assert.deepEqual(d.world.game.players,[5]);
});
