const test=require('node:test'),assert=require('node:assert/strict');
import {demoWorld,fixtures} from '../src/demo';
import {validateWorld,worldIdentityIntegrity,recoverPlayer,clubWages,clubExpense,clubPayment} from '../src/world';
test('fixture 10-team double round robin: 18 days, 90 matches, each ordered pair once',()=>{
 const f=fixtures(Array.from({length:10},(_,i)=>i),Date.UTC(2026,0,1));assert.equal(f.matches.length,90);assert.equal(f.days.length,18);
 const pairs=new Set(f.matches.map(m=>`${m.home}:${m.away}`));assert.equal(pairs.size,90);
 for(const day of f.days){assert.equal(day.matches.length,5);const clubs=day.matches.flatMap(i=>[f.matches[i]!.home,f.matches[i]!.away]);assert.equal(new Set(clubs).size,10);}
});
test('full demo World identities validate before game',()=>{const w=demoWorld();assert.doesNotThrow(()=>validateWorld(w));assert.equal(worldIdentityIntegrity(w).checked,180);assert.deepEqual(worldIdentityIntegrity(w).errors,[]);});
test('invalid fixture refs and roster owners rejected',()=>{
 const w=demoWorld();w.matches[0]!.home=200;assert.throws(()=>validateWorld(w),/invalid home/);
 const s=demoWorld();s.players[0]!.club=1;assert.equal(worldIdentityIntegrity(s).errors.length,1);
});
test('recovery Rust age bins and started_recently different AI vs human',()=>{
 const p={name:'x',age:22,fitness:30,started_recently:true,salary:0,club:0,injured_until:0};
 recoverPlayer(p,true);assert.equal(p.fitness,54);p.fitness=30;recoverPlayer(p,false);assert.equal(p.fitness,60);
 p.age=19;p.started_recently=false;p.fitness=98;recoverPlayer(p,false);assert.equal(p.fitness,100);
});
test('salary balances exact BigInt beyond 2^53; negative expense never allowed',()=>{
 const w=demoWorld();w.clubs[0]!.cash=99999999999999999n;w.clubs[0]!.human=true;const salary=clubWages(w,0);
 clubExpense(w,0,salary);assert.equal(w.clubs[0]!.cash,99999999999999999n-salary);
 assert.throws(()=>clubExpense(w,0,-1n),/negative/);
 clubPayment(w,0,250,4);assert.equal(w.clubs[0]!.finances.expense_type4,250);
});