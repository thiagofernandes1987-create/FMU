/** M27: World arena data consumers without demo state or mutable aliasing. */
declare function require(name:string):any;
const test=require('node:test'),assert=require('node:assert/strict');
import {viewWorldClub,viewWorldPlayer,viewWorldMatch,worldTransaction} from '../src/m27/persistence/world_access';
import {validateRustWorld,WorldValidationError,WorldDocument,preflightWorldRuntime} from '../src/m27/persistence/bfn_world';
import {CborRecord,CborValue} from '../src/m26/persistence/cbor';
import schema from '../src/m27/persistence/world_schema.generated.json';
function exampleDocument():WorldDocument {
 const game={season:2031,day:0,clubs:[0],players:[0],youth_players:[],days:[]} as CborRecord;
 const club={id:77,name:'Esporte Teste',file_ref:'teste',human:true,cash:9007199254740999n,squad:[0]} as CborRecord;
 const player={name:'Jogadora A',club:0,age:24,position:4,strength:89,salary:15000} as CborRecord;
 const match={home:0,away:0,home_goals:2,away_goals:1} as CborRecord;
 const world={game,job_market:{},players:[player],clubs:[club],coaches:[],stadiums:[],matches:[match],competitions:[],stages:[],countries:[],state_leagues:[]} as unknown as WorldDocument['world'];
 const validation=validateRustWorld(world,{profile:'structural'});
 assert.equal(validation.valid,true,JSON.stringify(validation.errors.slice(0,5)));
 return {world,meta:{format_version:3},originalFormat:3,migrationSteps:[],validation,runtimePreflight:preflightWorldRuntime(world)};
}
test('M27 World access: clube com saldo i64 exato e ID original',()=>{
 const d=exampleDocument(),club=viewWorldClub(d,0);
 assert.equal(club.arenaId,0);assert.equal(club.gameId,77);
 assert.equal(club.cash,9007199254740999n);assert.deepEqual(club.squad,[0]);
});
test('M27 World access: atleta usa referências ArenaId e mantém salário',()=>{
 const player=viewWorldPlayer(exampleDocument(),0);
 assert.equal(player.name,'Jogadora A');assert.equal(player.clubArenaId,0);assert.equal(player.strength,89);assert.equal(player.salary,15000);
});
test('M27 World access: placar e lados vêm do World, não do sandbox',()=>{
 const m=viewWorldMatch(exampleDocument(),0);
 assert.deepEqual([m.homeClub,m.awayClub,m.homeGoals,m.awayGoals],[0,0,2,1]);
});
test('M27 World access: índice fora do limite é recusado sem fallback',()=>{
 assert.throws(()=>viewWorldClub(exampleDocument(),2),/out of range/);
 assert.throws(()=>viewWorldPlayer(exampleDocument(),-1),/out of range/);
});
import {loadBfnWorld} from '../src/m27/persistence/bfn_world';
test('M27 World transaction: copy-on-write prevents partial mutation on invalid reference',()=>{
 const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fmu-m27-trx-'));try{
  const file=path.join(dir,'sample.bfn');const r=cp.spawnSync('node',['tools/m27_make_fixture_world.mjs',file],{encoding:'utf8'});
  assert.equal(r.status,0,r.stderr);
  const doc=loadBfnWorld(fs.readFileSync(file));
  const changed=worldTransaction(doc,w=>{w.game.season=2032;});
  assert.equal(doc.world.game.season,1);assert.equal(changed.world.game.season,2032);
  assert.throws(()=>worldTransaction(doc,w=>{w.game.clubs=[5];}),WorldValidationError);
  assert.deepEqual(doc.world.game.clubs,[]); // original untouched
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
