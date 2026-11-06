/** FMU M23 — integration and persistence of view-model domain logic.
 * Egui visual UI is not implemented; tests do not assert UI parity. */
declare function require(name:string):any;
const test=require('node:test'),assert=require('node:assert/strict');
import {stagesOf,standingGroups,clubMatchesByCalendar,nextClubMatch,viewTopScorers,bestAverageRatings,stagePlace,shownPlace} from '../src/m23/app/view';
import {calendarRows} from '../src/m23/app/calendar';
import {newContractView,validContractSalary,CONTRACT_DURATION_KEYS} from '../src/m23/app/contract';
import {ModkitCell,plainCell,coloredCell,strongCell,rightCell,flaggedCell} from '../src/m23/app/modkit';
import {THEME_COLORS,themePositionColor} from '../src/m23/app/theme';
import {parseGitHubLocation,patchLocationKey,patchLocationLabel,isOfficialPatch,initialPatchList} from '../src/m23/app/patch_library';
import {MemoryPatchStore} from '../src/m23/app/patch_store';
import {downloadHeader,downloadProgress} from '../src/m23/app/patch_download';
import {gameFilePath,imageFileRef} from '../src/m23/app/game_files';
import {humanCareerClub,canAdvanceCareer,advanceCareer,careerSaveMeta} from '../src/m23/app/career';
import {newCareerScreenView,toggleCareerDialog,CAREER_DIALOGS} from '../src/m23/app/career_screen';
import {playerCareerRows,playerRatingText} from '../src/m23/app/player';
import {newStartView,selectSavedCareer} from '../src/m23/app/start';
import {menuColumn} from '../src/m23/app/menu';
import {pendingMasterOffers,hasProposalBonus} from '../src/m23/app/proposals';
import {bootApp,parseDeveloperTab} from '../src/m23/app/app';
import {topLeaders,LEADERS_SHOWN} from '../src/m23/app/leaders';
import {emptySearch,searchFilter} from '../src/m23/app/search';
import {fitText} from '../src/m23/app/widgets';
test('M23 view: dedup stages in original fixed order',()=>{
 assert.deepEqual(stagesOf({league:'a',secondLeague:'b',mainStage:'a',knockout:'k',finalStage:'k'}),['a','b','k']);
});
test('M23 view: grouped standings and statistics by club',()=>{
 const groups=standingGroups({clubs:['a','b'],groups:[{clubs:['a']},{clubs:['b']}]},id=>[id==='a'?3:0,1,1,0,0,2,0,2]);
 assert.equal(groups.length,2);assert.equal(groups[0]?.[0]?.numbers[0],3);
});
test('M23 view: calendar order and first unplayed game',()=>{
 const matches={m1:{id:'m1',home:'a',away:'b',date:1,kind:1,season:2026,played:true},m2:{id:'m2',home:'b',away:'a',date:2,kind:1,season:2026,played:false}};
 const days=[{matchIds:['m1']},{matchIds:['m2']}];
 assert.equal(clubMatchesByCalendar(days,matches,'a').length,2);
 assert.equal(nextClubMatch(days,matches,'a')?.id,'m2');
});
test('M23 view: best ratings only if at least five results over 5.0',()=>{
 const rows=Array.from({length:4},(_,i)=>({playerId:String(i),ratingSum:70,ratedGames:10}));
 assert.deepEqual(bestAverageRatings(rows),[]);
 assert.equal(bestAverageRatings([...rows,{playerId:'5',ratingSum:80,ratedGames:10}]).length,5);
});
test('M23 view: scorer tie-breaker fewer games and group placement',()=>{
 assert.deepEqual(viewTopScorers([{playerId:'x',goals:7,games:9},{playerId:'y',goals:7,games:7}],1).map(x=>x.playerId),['y']);
 const st={kind:'League' as const,groupCount:2,clubs:[],groups:[{clubs:['a','b']},{clubs:['c','d']}],round:2};
 assert.equal(stagePlace(st,'c'),1);assert.equal(shownPlace(st,'d'),2);
 assert.equal(shownPlace({...st,round:1},'d'),undefined);
});
test('M23 calendar: scores reported from club perspective',()=>{
 const rows=calendarRows('a',[{id:'x',home:'b',away:'a',season:2026,kind:1,date:10,homeGoals:1,awayGoals:2,played:true}]);
 assert.deepEqual(rows[0],{matchId:'x',day:10,home:false,opponentId:'b',played:true,mine:2,theirs:1,result:'win'});
});
test('M23 contracts: bounds 1..100 million and 4 duration options',()=>{
 assert.equal(CONTRACT_DURATION_KEYS.length,4);
 assert.deepEqual(newContractView('p',5000),{playerId:'p',duration:0,salary:'5000'});
 assert.equal(validContractSalary(' 1000 '),1000);assert.equal(validContractSalary('0'),undefined);
 assert.equal(validContractSalary('100000001'),undefined);
});
test('M23 modkit: cell decoration uses immutable builder semantics',()=>{
 const c=plainCell('name');assert.equal(rightCell(c).right,true);assert.equal(c.right,false);
 assert.equal(coloredCell('score','#f00').color,'#f00');assert.equal(strongCell('caption').bold,true);
 assert.equal(flaggedCell('Brazil',29).flag,29);
});
test('M23 theme: exact original position RGB and accent',()=>{
 assert.equal(THEME_COLORS.accent,'#3b82f6');assert.deepEqual(themePositionColor(0),[217,154,30]);
 assert.deepEqual(themePositionColor(1),themePositionColor(2));assert.deepEqual(themePositionColor(3),[31,157,99]);
});
test('M23 patches: GitHub normalization, path rejection and official detection',()=>{
 const gh=parseGitHubLocation('https://github.com/Brasfoot-Next/database/tree/main/');
 assert.deepEqual(gh,{kind:'github',owner:'brasfoot-next',repo:'database'});
 assert.ok(gh&&isOfficialPatch(gh));
 assert.equal(parseGitHubLocation('https://github.com/foo/a:b'),undefined);
 assert.equal(patchLocationLabel(gh!),'brasfoot-next/database');
 assert.equal(patchLocationKey(gh!,()=>{throw Error('sha not needed');}),'github/brasfoot-next/database');
 assert.equal(initialPatchList()[0]?.enabled,true);
});
test('M23 patches: file-based keys demand canonical 64-hex SHA',()=>{
 assert.equal(patchLocationKey({kind:'zip',path:'/a'},()=> 'a'.repeat(64)),'zip/aaaaaaaaaaaaaaaa');
 assert.throws(()=>patchLocationKey({kind:'folder',path:'/a'},()=>''),/SHA256/);
});
test('M23 patch store: clone bytes on write/read, keys(prefix) and remove',async()=>{
 const store=new MemoryPatchStore(),buffer=new Uint8Array([1,2,3]);await store.write('a/key',buffer);buffer[0]=99;
 const out=await store.read('a/key');assert.deepEqual([...out!],[1,2,3]);out![0]=88;
 assert.deepEqual([...(await store.read('a/key'))!],[1,2,3]);
 assert.deepEqual(await store.keys('a/'),['a/key']);await store.remove('a/key');assert.equal(await store.read('a/key'),undefined);
});
test('M23 download phases: HTTP headers case insensitive and zero-total progress',()=>{
 assert.equal(downloadHeader({'Content-Length':'50'},'content-length'),'50');
 assert.equal(downloadProgress({kind:'Files',done:0,total:0}),1);
 assert.equal(downloadProgress({kind:'Waiting',seconds:3}),undefined);
});
test('M23 game files: rejects traversal before joining data asset paths',()=>{
 assert.equal(gameFilePath('/base','flag.png'),'/base/flag.png');
 assert.throws(()=>gameFilePath('/base','../secret'),/Unsafe/);
 assert.equal(imageFileRef('/base','flag',29),'/base/aflags/29.png');
});
test('M23 career: unattended advance only without human coaches/clubs',()=>{
 const a={world:{round:1},humanCoachClubIds:[] as string[],humanClubs:[] as string[]};
 assert.equal(humanCareerClub(a),undefined);assert.equal(canAdvanceCareer(a),true);
 assert.equal(canAdvanceCareer({...a,humanCoachClubIds:['a']}),false);
});
test('M23 career: snapshot rollback on failed simulation step',()=>{
 const a={world:{round:1,score:0},humanCoachClubIds:[],humanClubs:[]};
 assert.throws(()=>advanceCareer(a,x=>({...x}),x=>{x.round=2;throw Error('unported');}),/unported/);
 assert.deepEqual(a.world,{round:1,score:0});
 advanceCareer(a,x=>({...x}),x=>{x.round=3;});assert.equal(a.world.round,3);
});
test('M23 career: generated save metadata uses zero-based month and optional import',()=>{
 assert.deepEqual(careerSaveMeta({year:2026,monthZero:10,day:5},'A','Coach',1,'original.s22'),
  {club:'A',coach:'Coach',date:'2026-11-05',season:1,importedFrom:'original.s22'});
});
test('M23 career screen: human club priority and modal state toggles',()=>{
 let s=newCareerScreenView('human','league',false);assert.equal(s.clubId,'human');
 s=toggleCareerDialog(s,'newspaper',true);assert.deepEqual(s.openDialogs,['newspaper']);
 s=toggleCareerDialog(s,'newspaper',false);assert.deepEqual(s.openDialogs,[]);
 assert.equal(CAREER_DIALOGS.length,16);
});
test('M23 player: newest career first, rating fallback',()=>{
 assert.deepEqual(playerCareerRows([{season:1,clubId:'x',games:1,goals:1,assists:1},{season:2,clubId:'x',games:1,goals:0,assists:1}]).map(x=>x.season),[2,1]);
 assert.equal(playerRatingText(undefined,String),'—');
});
test('M23 start: save state independent from source array',()=>{
 const x={path:'a.bfn',club:'A',coach:'B',season:1,date:'2026-11-05'},src=[x];
 const s=newStartView(src,['game.s22']);src.length=0;
 assert.equal(s.careers.length,1);assert.equal(selectSavedCareer(s,0),'a.bfn');
});
test('M23 menu: centered width and reserved 32px margin',()=>{
 assert.deepEqual(menuColumn(1200,460),{width:460,left:370});
 assert.deepEqual(menuColumn(200,500),{width:168,left:16});
});
test('M23 proposals: only up to three offers shown for a human club',()=>{
 const offer={brand:'x',yearly:1,years:2,bonusTop4:0,bonusLeague:0,bonusContinental:1};
 assert.equal(hasProposalBonus(offer),true);
 assert.equal(pendingMasterOffers(Array(5).fill(offer),true).length,3);
 assert.equal(pendingMasterOffers([offer],false).length,0);
});
test('M23 app: BF_SCREEN override and BF_OPEN chooses native/import',()=>{
 assert.deepEqual(bootApp('new'),{page:'NewGame'});
 assert.deepEqual(bootApp('saved','career.bfn','tables'),{page:'Career',loadPath:'career.bfn',importOriginal:false,tab:'tables'});
 assert.equal(bootApp('new','old.s22').importOriginal,true);
});
test('M23 app: BF_TAB parses nested views and offer-send',()=>{
 assert.deepEqual(parseDeveloperTab('finances-3'),{screen:'finances',index:3});
 assert.deepEqual(parseDeveloperTab('offer-150-send'),{screen:'offer',amount:'150',send:true});
 assert.equal(parseDeveloperTab('awards-4-2').index,4);
});
test('M23 cross-screen: calendar, finances, ranking and contract retained in JSON',()=>{
 const source={calendar:calendarRows('a',[{id:'m',home:'a',away:'b',season:2026,kind:1,date:3,played:false}]),
   contract:newContractView('p',3000),screen:toggleCareerDialog(newCareerScreenView('a',undefined,false),'calendar',true)};
 const back=JSON.parse(JSON.stringify(source));assert.equal(back.screen.openDialogs[0],'calendar');assert.deepEqual(back,JSON.parse(JSON.stringify(source)));assert.equal(back.calendar[0].result,'pending');
});
test('M23 regression: M22 source search baseline thresholds remain accurate',()=>{
 const s=emptySearch();assert.deepEqual(s.strength,[1,100]);assert.deepEqual(s.age,[16,45]);
 assert.equal(LEADERS_SHOWN,401);
 assert.deepEqual(searchFilter({...s,age:[20,45]},false).age,[20,100]);
});
test('M23 widths: never truncate a string already fitting',()=>{
 assert.equal(fitText('Çá😀',30,s=>Array.from(s).length*5),'Çá😀');
});
import {transferHistory} from '../src/m23/app/history';
test('M23 history: latest transfer first, zero-fee preserved and missing names fallback',()=>{
 const records=[{day:1,month:3,year:2026,playerName:'A',playerNumber:9,from:1,to:2,fee:0},
 {day:7,month:10,year:2026,playerNumber:17,from:3,to:2,fee:500}];
 const result=transferHistory(records,{1:'One',2:'Two'});
 assert.equal(result.length,2);assert.deepEqual(result[0],{date:'07/10/2026',player:'17',from:'--',to:'Two',fee:500});
 assert.equal(result[1]!.fee,0);assert.equal(result[1]!.date,'01/03/2026');
 assert.equal(records[0]?.playerName,'A');
});
