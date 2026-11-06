/** M27: Rust simulation/lib.rs + datapack CLI testable behavior. */
declare function require(name:string):any;
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
import {splitDataArgs,dataOption,readPackTree,readPackManifest,runDataCli} from '../src/m27/datapack/cli';
import {matchdayRivalry,noSimulationSystems,advanceOriginalWorld} from '../src/m27/simulation/entrypoints';
import {WorldDocument} from '../src/m27/persistence/bfn_world';
import {CborRecord,CborValue} from '../src/m26/persistence/cbor';
test('M27 datapack CLI: parse positional and repeated --on in exact order',()=>{
 const p=splitDataArgs(['base','--on','one','--on','two','--commit','abc']);
 assert.deepEqual(p.positional,['base']);assert.deepEqual(p.options,[['on','one'],['on','two'],['commit','abc']]);
 assert.equal(dataOption(p.options,'on'),'one');
 assert.throws(()=>splitDataArgs(['--version']),/needs a value/);
});
test('M27 datapack CLI: manifest and patch removal',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fmu-pack-'));
 const base=path.join(dir,'base'),patch=path.join(dir,'patch');
 try{
  for(const d of [base,patch])fs.mkdirSync(d,{recursive:true});
  fs.mkdirSync(path.join(base,'clubs','bra','demo'),{recursive:true});
  fs.writeFileSync(path.join(base,'manifest.toml'),'format = 1\nid = "demo/base"\nkind = "base"\nname = "Example"\n');
  fs.writeFileSync(path.join(base,'clubs','bra','demo','club.toml'),'name="Demo"\n');
  fs.writeFileSync(path.join(patch,'manifest.toml'),'format = 1\nid = "demo/patch"\nkind = "patch"\nname = "Patch"\n[remove]\nclubs = ["bra/demo"]\n');
  const tree=readPackTree(base),meta=readPackManifest(tree);
  assert.equal(meta.id,'demo/base');assert.equal(meta.kind,'base');assert.equal(tree.size,2);
  const result=runDataCli(['validate',patch,'--on',base]);assert.equal(result.files,1);assert.equal(result.partial,true);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('M27 datapack CLI: incomplete commands never claim successful conversion',()=>{
 assert.throws(()=>runDataCli(['convert','a','b','--id','x/y','--name','z']),/not yet ported/);
 assert.throws(()=>runDataCli(['pack','a','b']),/not yet ported/);
 assert.throws(()=>runDataCli([]),/usage/);
});
test('M27 simulation: fixed derby table and explicit club rivalries both directions',()=>{
 const root:Record<string,CborValue>=Object.create(null);
 root.game={};root.matches=[{home:0,away:1}];
 root.clubs=[{file_ref:'flarj',classic_rivals:[]},{file_ref:'vasco',classic_rivals:[]}];
 const doc={world:root,meta:{},originalFormat:3,migrationSteps:[],validation:{}} as unknown as WorldDocument;
 assert.equal(matchdayRivalry(doc,0),true);
 (root.clubs as CborRecord[])[1]!.file_ref='random-away';
 assert.equal(matchdayRivalry(doc,0),false);
 (root.clubs as CborRecord[])[1]!.classic_rivals=['flarj'];
 assert.equal(matchdayRivalry(doc,0),true);
});
test('M27 simulation: unknown teams and empty files cannot become rivals',()=>{
 const w:Record<string,CborValue>=Object.create(null);w.game={};w.clubs=[{file_ref:''},{file_ref:'vasco'}];w.matches=[{home:0,away:1}];
 const doc={world:w} as unknown as WorldDocument;
 assert.equal(matchdayRivalry(doc,0),false);
 (w.matches as CborRecord[])[0]!.away=null;assert.equal(matchdayRivalry(doc,0),false);
});
test('M27 simulation: no-systems hooks match Rust default decision',()=>{
 const hooks=noSimulationSystems();assert.equal(hooks.gameBuyer(5),5);
 assert.equal(hooks.gameBuyer(undefined),undefined);
 assert.equal(hooks.approveSale(1,2,900),true);
 assert.doesNotThrow(()=>hooks.seasonEndScreen());
 assert.throws(()=>advanceOriginalWorld(),/not ported/);
});
