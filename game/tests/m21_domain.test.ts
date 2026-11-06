declare function require(name:string):any;
const test=require('node:test'),assert=require('node:assert/strict');
import {CONTRACT_DURATIONS,offerContract,leastAccepted,ContractState} from '../src/ported/simulation/human_contract';
import {borrowEmergency,repayEmergency,emergencyLimit,updateEmergencyInterest} from '../src/ported/simulation/human_finances';
import {stadiumSectorCost,stadiumQuote,stadiumWorkDays,stadiumCeilings,startStadiumWork} from '../src/ported/simulation/human_stadium';
import {readHumanMessage,answerHumanFine} from '../src/ported/simulation/human_messages';
import {mainScreenTick,SCREEN_SERVICE_ORDER,MainScreenService} from '../src/ported/systems/clock';
import {prepareNextTactic,nextTacticalMatch} from '../src/ported/systems/tactics';
import {COUNTRY_FIFA,countryCode,countryId,stateCode,stateId,positionCode,positionId,traitCode} from '../src/ported/datapack/codes';
import {trophyPackPath} from '../src/ported/datapack/trophies';
import {issueSeverity,hasPackErrors,formatPackIssue,ISSUE_CODES} from '../src/ported/datapack/issues';
import {normalizeManifest,emptyRemovals,removalsIsEmpty} from '../src/ported/datapack/format';
import {MemTree,LayeredTree} from '../src/ported/datapack/tree';
const DAY=86400000;
test('M21 simulation/contract: durações, aceitação, extensão a partir do vencimento',()=>{
 assert.deepEqual(CONTRACT_DURATIONS,[180,365,730,1095]);
 const p:ContractState={marketValue:40000,salary:4000,price:500,contractUntil:100*DAY};
 assert.equal(leastAccepted(p,0,0),4400);
 assert.deepEqual(offerContract(p,0,4200,0),{type:'Asks',amount:4400});
 assert.deepEqual(offerContract(p,0,4400,0),{type:'Signed'});
 assert.equal(p.salary,4400);assert.equal(p.price,40000);assert.equal(p.contractUntil,280*DAY);
});
test('M21 simulation/contract: desconto 60 dias, sobre-teto e recusa silenciosa',()=>{
 const p:ContractState={marketValue:40000,salary:4000,price:300,contractUntil:10*DAY};
 assert.equal(leastAccepted(p,0,3),3520);
 assert.deepEqual(offerContract(p,0,10000,1),{type:'OverLimit',amount:10000});
 assert.deepEqual(offerContract(p,0,0,1),{type:'Nothing'});
});
test('M21 simulation/finances: 500 mil por vez, limite e juros',()=>{
 const f={division:0,cash:0,bankLoan:0,bankInterest:0},logs:number[]=[];
 const acct={income:(v:number,k:-1)=>logs.push(v+k),payment:(v:number,k:-1)=>logs.push(-(v+k))};
 assert.equal(emergencyLimit(0),1000000);
 assert.equal(borrowEmergency(f,acct),true);assert.equal(borrowEmergency(f,acct),true);
 assert.equal(borrowEmergency(f,acct),false);assert.equal(f.cash,1000000);
 assert.equal(f.bankInterest,30000);
 assert.equal(repayEmergency(f,acct),true);assert.equal(f.cash,500000);
 assert.equal(f.bankLoan,500000);assert.equal(f.bankInterest,15000);
 assert.equal(logs.length,3);
});
test('M21 simulation/stadium: bordas, preço das faixas e work days',()=>{
 assert.deepEqual(stadiumCeilings(4),[20000,100000,10000,800]);
 assert.equal(stadiumSectorCost(1,4000,2000),760000);
 assert.equal(stadiumSectorCost(3,100,50),175000);
 assert.equal(stadiumWorkDays(1000),20);assert.equal(stadiumWorkDays(30000),40);
 const q=stadiumQuote([100,4000,0,100],[0,2000,0,50],100,(time,days)=>time+days*DAY)!;
 assert.equal(q.cost,1035000);assert.equal(q.until,100+20*DAY);
});
test('M21 simulation/stadium: obra só começa com estádio e caixa, categoria 7',()=>{
 const q=stadiumQuote([0,0,0,0],[200,0,0,0],0,(_,d)=>d*DAY)!;
 const state={stadiumId:'stadium1',cash:1000000,works:[] as {stadiumId:string;until:number;seats:[number,number,number,number]}[]};
 const payments:number[]=[];
 assert.equal(startStadiumWork(state,q,(v,cat)=>payments.push(cat+v)),true);
 assert.equal(state.works.length,1);assert.equal(state.cash,1000000-q.cost);
 assert.equal(payments[0],q.cost+7);
});
test('M21 simulation/messages: multa categoria 9, chance 51 e texto [16..19]',()=>{
 const inbox={messages:[{read:false,flagRz:true,valueSc:1,amount:500,text3:'Ana'}]};
 readHumanMessage(inbox,0);assert.equal(inbox.messages[0]!.read,true);
 const events:string[]=[];
 assert.equal(answerHumanFine(inbox,0,true,{income:(a,c)=>events.push(`${a}|${c}`),
  freshInt:bound=>bound===100?51:3,send:(kind,text,player)=>events.push(`${kind}|${text}|${player}`)}),true);
 assert.deepEqual(events,['500|9','10|19|Ana']);assert.equal(inbox.messages[0]!.flagRz,false);
});
test('M21 systems/clock: 13 serviços na ordem Rust, checkpoints, tática',()=>{
 const calls:string[]=[],services={} as Record<MainScreenService,()=>void>;
 for(const [_,name] of SCREEN_SERVICE_ORDER)services[name]=()=>{calls.push(name);};
 mainScreenTick({humanCount:1,prepareNextTactic:()=>{calls.push('tactic');},checkpoint:s=>{calls.push(s);},services});
 assert.equal(calls.length,28);assert.equal(calls[0],'tactic');assert.equal(calls.at(-1),'mod end');
 assert.deepEqual(calls.slice(1,5),['mod Estadios','stadiums','mod Base','academy']);
});
test('M21 systems/clock: exceção em Jornal impede serviços posteriores',()=>{
 const calls:string[]=[],services={} as Record<MainScreenService,()=>void>;
 for(const [_,name] of SCREEN_SERVICE_ORDER)services[name]=()=>{calls.push(name);if(name==='news')throw new Error('news failure');};
 assert.throws(()=>mainScreenTick({humanCount:0,prepareNextTactic:()=>{},checkpoint:()=>{},services}),/news failure/);
 assert.deepEqual(calls,['stadiums','academy','news']);
});
test('M21 systems/tactics: próxima partida sem jogar e não reseta tática preparada',()=>{
 const day=10*DAY,world={day:0,days:[[{home:1,away:2,played:true,date:0},{home:1,away:2,played:false,date:day}]],clubs:{2:{id:2,human:false}}};
 assert.deepEqual(nextTacticalMatch(world,1),{rival:2,home:true,date:day});
 const calls:string[]=[],state:{prepared?:import("../src/ported/systems/tactics").PreparedTactic}={};
 const hooks={likelyEleven:(id:number)=>[id],measure:(h:number,a:number)=>{calls.push(`${h}:${a}`);return 42;},
  advise:(m:number,side:0|1,analyst:number,seed:number)=>({best:[1,2,3] as [number,number,number],predictedRival:[2,3,4] as [number,number,number]}),
  setTactic:(id:number,_:readonly [number,number,number])=>{calls.push('set:'+id);}};
 const config={tactics:true,autoTactics:true,assistantLevel:3,analystLevel:4};
 const one=prepareNextTactic(world,1,config,state,hooks),two=prepareNextTactic(world,1,config,state,hooks);
 assert.equal(one?.rival,2);assert.equal(one?.predicted,2);assert.equal(two,undefined);
 assert.deepEqual(calls,['1:2','set:1']);
});
test('M21 datapack/codes: 224 países, 27 estados, volta e limites',()=>{
 assert.equal(COUNTRY_FIFA.length,224);assert.equal(countryCode(29),'BRA');assert.equal(countryId('GER'),3);
 assert.equal(stateId('SP'),25);assert.equal(stateCode(25),'SP');assert.equal(positionId('FW'),4);
 assert.equal(positionCode(0),'GK');assert.equal(traitCode(13),'pace');assert.equal(countryCode(224),undefined);
 assert.equal(countryId('ger'),undefined);
});
test('M21 datapack/trophies: 8 fixtures da fonte Rust',()=>{
 const cases:[string,string|undefined][]=[['tr_nacional_ALE_d2','trophies/league/ger-2.png'],
 ['tr_nacional_ING','trophies/league/eng.png'],['TR_nacional_tur','trophies/league/tur.png'],
 ['tr_estadual_RS_D1','trophies/state/rs-1.png'],['tr_copa_HOL','trophies/cup/ned.png'],
 ['tr_supercopa_generico','trophies/super-cup/default.png'],
 ['tr_recopasulamaericana','trophies/continental/recopa-sudamericana.png'],
 ['tr_liganacoesC','trophies/continental/nations-league-c.png'],
 ['tr_copa_NZE',undefined],['tr_nacional_RUS1',undefined]];
 for(const [stem,target] of cases)assert.equal(trophyPackPath(stem),target,stem);
});
test('M21 datapack/issues: 30 códigos + warnings conhecidos da fonte',()=>{
 assert.equal(ISSUE_CODES.length,30);
 assert.equal(issueSeverity('missing-crest'),'warning');assert.equal(issueSeverity('unknown-state'),'error');
 assert.equal(hasPackErrors([{path:'x',code:'unknown-file'}]),false);
 assert.equal(hasPackErrors([{path:'x',code:'syntax'}]),true);
 assert.equal(formatPackIssue({path:'a.csv',line:2,code:'missing-state'}),'warning: a.csv:2: Brazilian club without a state, it plays no state league');
});
test('M21 datapack/format: serde deny_unknown_fields e valores default',()=>{
 assert.equal(removalsIsEmpty(emptyRemovals()),true);
 const m=normalizeManifest({format:1,id:'club/test',kind:'patch',name:'Teste'});
 assert.equal(m.kind,'patch');assert.deepEqual(m.remove,emptyRemovals());
 assert.throws(()=>normalizeManifest({format:1,id:'x',kind:'base',name:'X',mystery:1}),/Unknown/);
});
test('M21 datapack/tree: layers e remoções respeitam preferência da última camada',()=>{
 const a=new MemTree();a.insert('manifest.toml',new Uint8Array([1]));a.insert('clubs/a/club.toml',new Uint8Array([2]));
 const b=new MemTree();b.insert('clubs/a/club.toml',new Uint8Array([3]));b.insert('clubs/b/club.toml',new Uint8Array([4]));
 const layered=new LayeredTree([a,b],(_,path)=>path==='clubs/a/club.toml');
 assert.deepEqual(layered.files(),['clubs/a/club.toml','clubs/b/club.toml']);
 assert.equal(layered.layerOf('clubs/a/club.toml'),1);
 assert.equal(layered.read('clubs/a/club.toml')[0],3);
 assert.throws(()=>layered.read('manifest.toml'),/NotFound/);
});
test('M21 datapack/tree: GitHub zip prefix e arquivos ocultos',()=>{
 const tree=MemTree.fromExtracted([
 ['repo-main/manifest.toml',new Uint8Array([1])],['repo-main/.DS_Store',new Uint8Array([0])],
 ['repo-main/clubs/a/club.toml',new Uint8Array([3])]
 ]);
 assert.deepEqual(tree.files(),['clubs/a/club.toml','manifest.toml']);
 assert.throws(()=>tree.insert('../evil',new Uint8Array([1])),/Unsafe/);
});
