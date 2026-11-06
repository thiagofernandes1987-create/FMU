/* Testes M21: model/ids, stage, messages, java_sort, java_hash, fdlibm, brands, options, templates. */
declare function require(name:string):any;
const test=require('node:test');const assert=require('node:assert/strict');
import {arenaId,arenaIndex} from '../src/ported/model/ids';
import {stageKindCode} from '../src/ported/model/stage';
import {blankComposedTexts,fillDateTexts} from '../src/ported/model/messages';
import {javaSortBy} from '../src/ported/model/java_sort';
import {JavaHashMap,javaHash} from '../src/ported/model/java_hash';
import {strictLog,f64Bits,f64FromBits} from '../src/ported/model/fdlibm';
import {BRAND_FIRST,OWNER_FIRST,STAFF_FIRST_NAMES,MASTER_BRANDS,brand,owner,staff,slotBrand,clubArena,sponsoredStadium,legendStadium} from '../src/ported/model/brands';
import {defaultGameOptions,applyGameOptions} from '../src/ported/model/options';
import {defaultLeagueConfig,defaultStateLeagueConfig} from '../src/ported/model/templates';
test('M21 model/ids: nove arenas u32 e discriminação',()=>{
  assert.equal(arenaIndex(arenaId('ClubId',0xffffffff),'ClubId'),0xffffffff);
  assert.throws(()=>arenaId('ClubId',-1),/u32/);assert.throws(()=>arenaId('ClubId',2**32),/u32/);
  assert.throws(()=>arenaIndex(arenaId('PlayerId',1),'ClubId' as never),/mismatch/);
});
test('M21 model/stage: liga usa kind, mata-mata competitionKind',()=>{
  assert.equal(stageKindCode({class:'League',kind:2,competitionKind:8}),2);
  assert.equal(stageKindCode({class:'Knockout',kind:2,competitionKind:8}),8);
});
test('M21 model/messages: blanks somente três pares (sender,id)',()=>{
  const coaches=[{messages:[{sender:26,messageId:79,text1:'a',text2:'b',dateText:''},
    {sender:25,messageId:76,text1:'x',text2:'y',dateText:''},
    {sender:10,messageId:79,text1:'ok',text2:'continua',dateText:''}]}];
  blankComposedTexts(coaches);assert.equal(coaches[0]!.messages[0]!.text1,'');
  assert.equal(coaches[0]!.messages[1]!.text2,'');assert.equal(coaches[0]!.messages[2]!.text1,'ok');
});
test('M21 model/messages: data dd/MM/yyyy apenas onde está vazia',()=>{
  const coaches=[{messages:[{sender:1,messageId:1,text1:'',text2:'',day:0,dateText:''},
    {sender:1,messageId:2,text1:'',text2:'',day:0,dateText:'já definida'}]}];
  fillDateTexts(coaches,()=>({year:2024,month:1,day:9}));
  assert.equal(coaches[0]!.messages[0]!.dateText,'09/02/2024');
  assert.equal(coaches[0]!.messages[1]!.dateText,'já definida');
});
test('M21 model/java_sort: comparador normal equivale à ordenação estável',()=>{
  const values=[5,1,4,1,3,9,2,6,5,3];javaSortBy(values,(a,b)=>a-b);
  assert.deepEqual(values,[1,1,2,3,3,4,5,5,6,9]);
});
test('M21 model/java_sort: quatro fixtures de comparator inconsistente do Rust',()=>{
  const cases:[number[][],number[][]][]=[
    [[[4,5],[4,0],[4,8],[4,0],[4,0],[2,8],[1,5],[2,1],[3,7],[4,2],[4,3],[1,8],[4,9],[0,6],[1,3],[3,9],[1,5],[2,8],[1,6]],[[4,9],[3,9],[4,8],[1,8],[1,5],[4,3],[4,2],[3,7],[2,8],[2,8],[1,6],[1,3],[0,6],[4,5],[2,1],[1,5],[4,0],[4,0],[4,0]]],
    [[[0,0],[3,7],[3,5],[2,9],[1,2],[2,5],[4,0],[4,2],[3,5],[1,7],[4,5],[1,9],[2,5],[0,5],[4,7],[4,2],[2,0]],[[4,7],[4,2],[1,9],[4,5],[2,5],[4,2],[4,0],[2,9],[3,7],[1,7],[3,5],[3,5],[2,5],[2,0],[0,5],[1,2],[0,0]]],
    [[[1,0],[1,1],[3,6],[4,7],[1,7],[1,8],[1,5],[3,6],[3,7],[2,6],[1,0],[4,5],[0,8],[1,1],[2,5],[2,5],[0,4]],[[1,8],[0,8],[4,7],[4,5],[3,7],[1,7],[3,6],[3,6],[2,6],[2,5],[2,5],[1,5],[0,4],[1,1],[1,1],[1,0],[1,0]]],
    [[[2,1],[2,4],[3,5],[2,2],[3,5],[1,9]],[[1,9],[3,5],[3,5],[2,4],[2,2],[2,1]]]
  ];
  for(const [values,expected] of cases){javaSortBy(values,(x,y)=>x[0]!>y[0]!?-1:y[1]!-x[1]!);assert.deepEqual(values,expected);}
});
test('M21 model/java_sort: Rust recusa >=32 no comparador inconsistente',()=>{
  assert.throws(()=>javaSortBy(Array(32).fill(0),()=>0),/>=32/);
});
test('M21 model/java_hash: UTF-16 e colisões originais',()=>{
  assert.equal(javaHash('hello'),99162322);assert.equal(javaHash('Aa'),javaHash('BB'));
  assert.equal(javaHash('é'),233);assert.equal(javaHash(''),0);
});
test('M21 model/java_hash: ordem bins Java com chaves 17,3,1,33,2',()=>{
  const m=new JavaHashMap<number>();for(const k of [17,3,1,33,2])m.insert(k,k);
  assert.deepEqual(m.values(),[17,1,33,2,3]);assert.equal(m.capacityForTest(),16);
});
test('M21 model/java_hash: resize a 3/4, nove colisões e overwrite',()=>{
  const m=new JavaHashMap<number>();for(let k=0;k<13;k++)m.insert(k*16,k);
  assert.deepEqual(m.values(),[0,2,4,6,8,10,12,1,3,5,7,9,11]);
  m.insert(0,999);assert.equal(m.get(0),999);assert.equal(m.len(),13);
  const n=new JavaHashMap<number>();for(let k=0;k<9;k++)n.insert(k*64,k);
  assert.equal(n.capacityForTest(),32);assert.deepEqual(n.values(),Array.from({length:9},(_,i)=>i));
});
test('M21 model/fdlibm: 7 vetores binários Java 21 do teste Rust',()=>{
  const cases:[string,string][]=[
    ['3fe74833a06ff457','bfd45afe1ecf772f'],['3fe5dcf778622e01','bfd86135fc79dabd'],
    ['3fd3c20f3f12bbb4','bff2ce1ec888f460'],['3fea2b647816a9f1','bfc9befee1808a87'],
    ['3fe736e1fb765d46','bfd48aab8221bfe7'],['3fe1915b4e06c255','bfe3307b79f7308e'],
    ['3fe88c42b0db5ef5','bfd0f78f7b8a1103']
  ];
  for(const [x,expect] of cases)assert.equal(f64Bits(strictLog(f64FromBits(BigInt('0x'+x)))).toString(16),expect);
});
test('M21 model/fdlibm: especiais NaN/inf/zero/subnormal',()=>{
  assert.equal(strictLog(1),0);assert.equal(strictLog(0),-Infinity);
  assert.equal(strictLog(Infinity),Infinity);assert.ok(Number.isNaN(strictLog(-1)));
  assert.ok(Number.isFinite(strictLog(Number.MIN_VALUE)));
});
test('M21 model/brands: tabelas na ordem e quantidade Rust',()=>{
  assert.deepEqual([BRAND_FIRST.length,OWNER_FIRST.length,STAFF_FIRST_NAMES.length,MASTER_BRANDS.length],[30,16,30,12]);
  assert.equal(brand(0,0),'Vortex Bank');assert.equal(owner(0,0),'Crescent Oasis Capital');
  assert.equal(staff(0,0),'Paulo Almeida');assert.equal(slotBrand(0,0),'Vortex Bank');
  assert.throws(()=>brand(30,0),/index/);
});
test('M21 model/brands: estádios por país e direitos de nome',()=>{
  assert.equal(clubArena(30,2,'Paris'),'Stade Paris');assert.equal(clubArena(27,1,'United'),'United Park');
  assert.equal(clubArena(10,0,'Berlin'),'Berlin-Arena');assert.equal(legendStadium('Léo'),'Estádio Léo');
  assert.equal(sponsoredStadium('Estádio Municipal A','Vortex Bank'),'Vortex Arena');
  assert.equal(sponsoredStadium('Vortex Arena','Vortex Bank'),'Vortex Arena');
});
test('M21 model/options: defaults Rust e aplicação sem copiar arrays por referência',()=>{
  const o=defaultGameOptions();assert.equal(o.show_international.length,21);
  assert.deepEqual([o.speed,o.monthly_salary,o.regionals_all.length,o.show_auctions],[4,true,4,false]);
  const target:Record<string,unknown>={};applyGameOptions(o,target);
  assert.equal(target.plays_state,true);assert.equal(target.theme_color,undefined);
  (target.show_international as boolean[])[0]=false;assert.equal(o.show_international[0],true);
});
test('M21 model/templates: defaults das ligas sem arrays compartilhados',()=>{
  const a=defaultLeagueConfig(),b=defaultLeagueConfig();assert.equal(a.relegated,2);
  assert.deepEqual(a.twoLeggedKnockout,Array(7).fill(true));a.twoLeggedKnockout[0]=false;
  assert.equal(b.twoLeggedKnockout[0],true);assert.deepEqual(defaultStateLeagueConfig().twoLeggedFinals,[2,2,2]);
});
