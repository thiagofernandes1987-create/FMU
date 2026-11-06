declare function require(name:string):any;
/** M23 — test vectors derived from Rust app/format/motion/glyphs/pitch/offer/finance.
 * No DOM or egui renderer is claimed by this suite. */
const test=require('node:test');const assert=require('node:assert/strict');
import {money,compactMoney,ptTranslator,shortDate,isoMediumDate,thousandsText,decimalText,ratingText} from '../src/m23/app/format';
import {ANIMATION_SECONDS,easeOut,mixColor,ContentFade} from '../src/m23/app/motion';
import {APP_GLYPHS} from '../src/m23/app/glyphs';
import {pitchSlotCenter,PITCH_SLOTS} from '../src/m23/app/pitch';
import {parseOfferThousands,newOfferState,typeOffer} from '../src/m23/app/offer';
import {financesWealth,financeDateOf,financesMonthName,signedMoney} from '../src/m23/app/finances';
import {stadiumViewState} from '../src/m23/app/stadium';
import {canRetire,releaseFeePercent,playerMenuOptions,toggleLoanListing} from '../src/m23/app/player_actions';
import {trainingAvailable} from '../src/m23/app/training';
import {retireViewState} from '../src/m23/app/retire';
import {fitText,competitionCountry} from '../src/m23/app/widgets';
import {shortGitVersion,patchPhase} from '../src/m23/app/patches';
import {FORM_WIDTH,moneyStepper} from '../src/m23/app/form';
import {standingsBand} from '../src/m23/app/standings';
import {BRAZILIAN_STATE_CODES,teamsReputationKey,viewedClubId} from '../src/m23/app/teams';
import {findingsRoleKey,findingsMeasurementKey} from '../src/m23/app/findings';
import {supportLinks} from '../src/m23/app/support';
test('M23 format: money zero, hundreds, thousands, millions and negative',()=>{
 assert.equal(money(ptTranslator,0n),'0 mil');assert.equal(money(ptTranslator,500n),'500');
 assert.equal(money(ptTranslator,35000n),'35 mil');assert.equal(money(ptTranslator,1500000n),'1 milhão 500 mil');
 assert.equal(money(ptTranslator,-2000n),'-2 mil');
});
test('M23 format: date, medium ISO fallback, decimal and thousands grouping',()=>{
 assert.equal(thousandsText(ptTranslator,-1762000n),'-1.762.000');
 assert.equal(decimalText(ptTranslator,1.25,1),'1,3');assert.equal(decimalText(ptTranslator,-1.25,1),'-1,3');
 assert.equal(ratingText(ptTranslator,10,2),'10');assert.equal(ratingText(ptTranslator,8.25,2),'8,25');
 assert.equal(shortDate(ptTranslator,2026,10,5),'date-short');
 assert.equal(isoMediumDate(ptTranslator,'bad'),'bad');assert.equal(isoMediumDate(ptTranslator,'2026-13-12'),'2026-13-12');
});
test('M23 motion: cubic easing end points and clamped RGBA',()=>{
 assert.equal(easeOut(0),0);assert.equal(easeOut(1),1);assert.equal(easeOut(.5),.875);
 assert.deepEqual(mixColor([0,20,40,255],[100,120,140,0],.5),[50,70,90,128]);
 assert.deepEqual(mixColor([0,0,0,0],[255,255,255,255],-1),[0,0,0,0]);
 assert.equal(ANIMATION_SECONDS.HOVER,.12);
});
test('M23 motion: fade restart occurs only after key change',()=>{
 const f=new ContentFade();assert.equal(f.update('one',100,.2),0);
 assert.equal(f.update('one',100.2,.2),1);assert.equal(f.update('two',100.2,.2),0);
});
test('M23 glyphs: 36 original Phosphor code points, no font bytes',()=>{
 assert.equal(Object.keys(APP_GLYPHS).length,36);
 assert.equal(APP_GLYPHS.CALENDAR.codePointAt(0),0xe7b4);
 assert.equal(APP_GLYPHS.TRAINING.codePointAt(0),0xe0b6);
});
test('M23 pitch: 26 exact slots and scaled center coordinates',()=>{
 assert.equal(PITCH_SLOTS.length,26);const rect={left:10,top:20,width:434,height:650};
 assert.deepEqual(pitchSlotCenter(rect,1),{x:230,y:610});
 assert.throws(()=>pitchSlotCenter(rect,26),/slot/);
});
test('M23 offer: parse thousands uses i32 domain and disallows malformed text',()=>{
 assert.equal(parseOfferThousands('35'),35000);assert.equal(parseOfferThousands('0'),0);
 assert.equal(parseOfferThousands('-4'),undefined);assert.equal(parseOfferThousands('2147484'),undefined);
 assert.equal(parseOfferThousands('1.2'),undefined);
});
test('M23 offer: state reset feedback when typing and retains send flag',()=>{
 const s=typeOffer({...newOfferState('p'),feedback:'bad'},'125',true);
 assert.equal(s.amount,'125');assert.equal(s.sendNow,true);assert.equal(s.feedback,undefined);
});
test('M23 finances: wealth boundaries include zero/crisis and billions',()=>{
 assert.deepEqual([-1,0,30000000,100000000,300000000,1000000000].map(financesWealth),['crisis','tight','stable','rich','very-rich','billionaire']);
 assert.equal(financeDateOf(20261105),'05/11/2026');assert.equal(financesMonthName(202612),12);
 assert.equal(financesMonthName(202600),undefined);assert.equal(signedMoney(12n,v=>v.toString()),'+12');
});
test('M23 stadium: automatic prices capped by sector and missing stadium has zero state',()=>{
 assert.deepEqual(stadiumViewState(undefined,()=>[20,20,20,20],[200,300,500,1000]),{prices:[0,0,0,0],auto:true});
 assert.deepEqual(stadiumViewState({automaticPrices:true,ticketPrices:[5,5,5,5]},()=>[0,500,2,5000],[200,300,500,1000]).prices,[1,300,2,1000]);
});
test('M23 player actions: retirement strictly age > 32, release fee thresholds',()=>{
 assert.equal(canRetire(32),false);assert.equal(canRetire(33),true);
 assert.deepEqual([0,1,30,31,60,61,90,91,180,181,722,723].map(releaseFeePercent),[0,12,12,20,20,22,22,25,25,30,30,35]);
 assert.equal(playerMenuOptions({age:19,onLoan:true,listedForLoan:false,listedForSale:true}).find(x=>x.action==='Sell')?.enabled,false);
 assert.equal(toggleLoanListing({age:20,onLoan:false,listedForLoan:false,listedForSale:false}).listedForLoan,true);
});
test('M23 training and retire: eligibility and position clamping',()=>{
 assert.equal(trainingAvailable('club',false),false);assert.equal(trainingAvailable('club',true),true);
 assert.equal(trainingAvailable(undefined,true),false);
 assert.deepEqual(retireViewState('p',7),{playerId:'p',name:'',position:4});
});
test('M23 widgets: trims Unicode text and country of national competitions',()=>{
 assert.equal(fitText('abcdef',5,s=>Array.from(s).length),'abcd…');
 assert.equal(competitionCountry('StateChampionship',-1),29);
 assert.equal(competitionCountry('NationalSuperCup',3),3);
});
test('M23 patches: commit shortening and download phase progress',()=>{
 assert.equal(shortGitVersion('a'.repeat(40)),'aaaaaaa');assert.equal(shortGitVersion('abc'),'abc');
 assert.equal(patchPhase(ptTranslator,{type:'Files',done:2,total:4}).progress,.5);
 assert.equal(patchPhase(ptTranslator,{type:'Chunks',done:0,total:0}).progress,1);
});
test('M23 form: stepper uses i64-safe bigint and bounds',()=>{
 assert.equal(FORM_WIDTH,420);
 assert.equal(moneyStepper('not-a-number',5n,1,0n,100n),'5');
 assert.equal(moneyStepper('98',5n,1,0n,100n),'100');
});
test('M23 standings: promotion priority and relegation after safe subtraction',()=>{
 assert.equal(standingsBand(0,20,4,4),'promotion');
 assert.equal(standingsBand(17,20,4,4),'relegation');
 assert.equal(standingsBand(10,20,4,4),'neutral');
 assert.throws(()=>standingsBand(-1,20,4,4),/band/);
});
test('M23 states/findings/support: exact canonical codes and keys',()=>{
 assert.equal(BRAZILIAN_STATE_CODES.length,27);
 assert.equal(teamsReputationKey(5),'teams-reputation-5');
 assert.equal(viewedClubId('a','b'),'b');
 assert.equal(findingsRoleKey('Analyst'),'findings-role-analyst');
 assert.equal(findingsMeasurementKey(true),'findings-measure-pitch');
 assert.equal(supportLinks().length,2);
});
