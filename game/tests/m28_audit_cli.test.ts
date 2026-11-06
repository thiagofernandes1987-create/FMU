/** M28 CLI/semantic audit — real Rust World schema; synthetic fixtures only. */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
import {world28,appendClub,appendPlayer,appendDay,appendMatch,doc28,defaults} from './m28_helpers';
import {CborRecord} from '../src/m26/persistence/cbor';
import {auditWorldSemantics} from '../src/m28/world_audit';
import {runM28WorldCli} from '../src/m28/world_cli';
import {loadBfnWorld,writeBfnWorldAtomic} from '../src/m27/persistence/bfn_world';
function withFixture<T>(fn:(file:string,dir:string)=>T):T {
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'fmu-m28-cli-'));
 try{const w=world28(),club=appendClub(w,'Clube A',true),other=appendClub(w,'Clube B');appendPlayer(w,club);const day=appendDay(w);
  appendMatch(w,day,club,other,true);w.clubs[club]!.lineup_set=true;
  const file=path.join(tmp,'source.bfn');writeBfnWorldAtomic(file,doc28(w));return fn(file,tmp);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
}
test('M28 semantic audit: valid fixture is structurally valid and reports its counts',()=>{
 const w=world28(),c=appendClub(w),p=appendPlayer(w,c);appendDay(w);
 const audit=auditWorldSemantics(w);assert.equal(audit.valid,true);
 assert.equal(audit.structurallyValid,true);assert.equal(audit.counts.players,1);
 assert.equal(audit.findings.length,0);
});
test('M28 semantic audit: duplicate player in same club is an ERROR',()=>{
 const w=world28(),c=appendClub(w),p=appendPlayer(w,c);
 (w.clubs[c]!.squad as number[]).push(p);
 const a=auditWorldSemantics(w);
 assert.equal(a.valid,false);assert.ok(a.findings.some(x=>x.code==='DUPLICATE_CLUB_PLAYER'));
});
test('M28 semantic audit: player in multiple owner squads is an ERROR',()=>{
 const w=world28(),a=appendClub(w),b=appendClub(w),p=appendPlayer(w,a);
 (w.clubs[b]!.squad as number[]).push(p);
 const r=auditWorldSemantics(w);
 assert.ok(r.findings.some(x=>x.code==='MULTIPLE_OWNER_SQUADS'));
 assert.ok(r.findings.some(x=>x.code==='OWNER_SQUAD_MISMATCH'));
});
test('M28 semantic audit: player in national-team squad is not double ownership',()=>{
 const w=world28(),a=appendClub(w),b=appendClub(w),p=appendPlayer(w,a);
 (w.clubs[b]!.squad as number[]).push(p);
 const nat=defaults('Country') as CborRecord;nat.national_team=b;w.countries.push(nat);
 const r=auditWorldSemantics(w);
 assert.ok(!r.findings.some(x=>x.code==='MULTIPLE_OWNER_SQUADS'));
});
test('M28 semantic audit: player ownership mismatch alone is a warning, not hard failure',()=>{
 const w=world28(),a=appendClub(w),b=appendClub(w);const p=appendPlayer(w,a);
 w.players[p]!.club=b;
 const r=auditWorldSemantics(w);assert.equal(r.valid,true);
 assert.ok(r.findings.some(x=>x.code==='OWNER_SQUAD_MISMATCH'&&x.severity==='WARNING'));
});
test('M28 semantic audit: invalid squad reference is an error',()=>{
 const w=world28(),a=appendClub(w);
 (w.clubs[a]!.squad as number[]).push(999);
 const r=auditWorldSemantics(w);
 assert.ok(r.findings.some(x=>x.code==='INVALID_SQUAD_REFERENCE'));
 assert.equal(r.structurallyValid,false);
});
test('M28 semantic audit: duplicate match day refs are a warning',()=>{
 const w=world28(),a=appendClub(w),b=appendClub(w);
 const d=appendDay(w),id=appendMatch(w,d,a,b);
 (w.game.days as CborRecord[])[d]!.matches=[id,id];
 const r=auditWorldSemantics(w);assert.equal(r.valid,true);
 assert.ok(r.findings.some(x=>x.code==='MATCH_REUSED'));
});
test('M28 semantic audit: invalid cursor outside calendar is an error except season-over',()=>{
 const w=world28();appendDay(w);w.game.day=3;
 assert.ok(auditWorldSemantics(w).findings.some(x=>x.code==='CURSOR_OUT_OF_CALENDAR'));
 w.game.season_over=true;assert.ok(!auditWorldSemantics(w).findings.some(x=>x.code==='CURSOR_OUT_OF_CALENDAR'));
});
test('M28 CLI: inspect-day reads actual saved file without changing bytes',()=>withFixture((file)=>{
 const previous=fs.readFileSync(file);
 const result=runM28WorldCli(['inspect-day',file]);
 assert.equal(result.command,'inspect-day');assert.ok(result.day);
 assert.deepEqual(fs.readFileSync(file),previous);
}));
test('M28 CLI: audit reports structurally valid World',()=>withFixture((file)=>{
 const report=runM28WorldCli(['audit',file]);assert.equal(report.valid,true);
 assert.equal(report.structurallyValid,true);
}));
test('M28 CLI: prepare-save creates a distinct v3 .bfn and preserves original',()=>withFixture((file,dir)=>{
 const before=fs.readFileSync(file),dest=path.join(dir,'normalized.bfn');
 const result=runM28WorldCli(['prepare-save',file,dest]);
 assert.equal(result.formatVersion,3);assert.ok(fs.existsSync(dest));
 assert.deepEqual(fs.readFileSync(file),before);
 const after=loadBfnWorld(fs.readFileSync(dest));assert.equal(after.world.players[0]!.save_number,0);
}));
test('M28 CLI: refuses in-place save normalization and non-BFN targets',()=>withFixture((file,dir)=>{
 assert.throws(()=>runM28WorldCli(['prepare-save',file,file]),/in-place/);
 assert.throws(()=>runM28WorldCli(['prepare-save',file,path.join(dir,'data.txt')]),/\.bfn/);
}));
