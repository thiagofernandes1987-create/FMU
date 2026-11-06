declare function require(name:string):any;
const test=require('node:test'),assert=require('node:assert/strict');
import {ModConfig,SWITCH_KEYS} from '../src/systems/config';
import {cashTotals,cashFlows,cashTick,emptyCashBook,flowIncome,flowExpenses,seasonTotals,hasCashSeason,monthsElapsed,monthlyWages,CashFinance} from '../src/systems/cash';
import {emptyStaffState,drawStaffCandidates,staffCandidates,minimumStaffReputation,hireStaff,fireStaff,staffLevel,staffWages,payStaffMonth,STAFF_ROLES} from '../src/systems/staff';
import {ScoutContext,ScoutPlayer,sendScout,isWatched,isBeingWatched,scoutsPending,scoutsTick,scoutEstimate,scoutMargin,scoutRange,searchScouts,scoutCost} from '../src/systems/scouts';
import {FanContext,emptyFansState,fansTick,fanEvent,fanConfidence,monthlyMembership,payFansMonth,MAX_FAN_REASONS} from '../src/systems/fans';
import {emptyInvestorState,InvestorContext,investorTick,investorOffer,requestInvestorOffer,acceptInvestor,refuseInvestor,judgeOwner,investorSeasonEnd,payOwnerInjection,scheduleInvestor} from '../src/systems/investor';
const cfg=()=>ModConfig.parse('');
test('M20 config: todas as 19 opções habilitadas por omissão',()=>{
 assert.equal(Object.keys(SWITCH_KEYS).length,19);
 for(const k of Object.keys(SWITCH_KEYS) as Array<keyof typeof SWITCH_KEYS>)assert.equal(cfg().on(k),true,k);
});
test('M20 config: chave repetida e comentários respeitam ordem e valor igual a 1',()=>{
 const c=ModConfig.parse('#JORNAL=0\nJORNAL=0\nJORNAL=1\n TATICAS=0\nTATICAS=1\nTATICA_AUTO = 0');
 assert.equal(c.on('News'),true);assert.equal(c.on('Tactics'),true);assert.equal(c.on('AutoTactics'),false);
});
test('M20 config: mercados DESLIGADO CONTIDO AGITADO e padrão',()=>{
 for(const [code,expected] of [['DESLIGADO','Off'],['CONTIDO','Contained'],['AGITADO','Busy'],['desconhecido','Realistic']]){
  assert.equal(ModConfig.parse('MERCADO='+code).market(),expected);
 }
});
const finance=(other=7n):CashFinance=>({incomeType5:1n,incomeTransfers:2n,incomeType3:3n,incomeType6:4n,incomeType9:other,
 expenseTransfers:6n,expenseType7:7n,expenseSalaries:8n,expenseType4:9n,expenseType8:10n,expenseOther:11n});
const clock={fields(ms:number){const d=new Date(ms);return {year:d.getUTCFullYear(),month:d.getUTCMonth(),day:d.getUTCDate(),daysInMonth:new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate()};}};
test('M20 cash: onze linhas de caixa e saldos bigint',()=>{
 const r=cashTotals(finance());assert.equal(r.length,11);
 assert.equal(r.reduce((a,b)=>a+b,0n),68n);
 assert.equal(typeof r[5],'bigint');
});
test('M20 cash: primeiro mês é parcial e zerou multas históricas',()=>{
 const book=emptyCashBook();cashTick(book,'A',2026,finance(),300n,clock,Date.UTC(2026,0,12));
 const list=cashFlows(book,'A');assert.equal(list.length,1);assert.equal(list[0]!.partial,true);
 assert.equal(list[0]!.values[4],0n);assert.equal(flowIncome(list[0]!),10n);assert.equal(flowExpenses(list[0]!),51n);
});
test('M20 cash: mesma temporada usa diferenças, próximo ano mantém multa por diferença',()=>{
 const book=emptyCashBook();cashTick(book,'A',2026,finance(5n),200n,clock,Date.UTC(2026,11,10));
 cashTick(book,'A',2027,finance(25n),250n,clock,Date.UTC(2027,0,10));
 const list=cashFlows(book,'A');assert.equal(list.length,2);
 assert.equal(list[1]!.values[4],20n);assert.equal(list[1]!.values[5],6n);
 assert.equal(hasCashSeason(book,'A',2027),true);
 assert.equal(seasonTotals(book,'A',2027,2027,finance(25n))[4],20n);
});
test('M20 cash: mantém só 400 dias e suporta salários mensais/semanais',()=>{
 const book=emptyCashBook();for(let d=0;d<410;d++)cashTick(book,'A',2026,finance(),200n,clock,Date.UTC(2026,0,1)+d*86400000);
 assert.equal(book.days.size,400);assert.equal(book.months.size>10,true);
 assert.equal(monthlyWages(120n,true),120n);
 assert.equal(monthlyWages(120n,false),520n);
 assert.ok(monthsElapsed(clock,Date.UTC(2026,0,1))>=.5);
});
test('M20 cash: valores monetários maiores que JS safe integer continuam exatos em BigInt',()=>{
 const v=finance(123456789123456789n);assert.equal(cashTotals(v)[4],123456789123456789n);
});
const staffRng={nextIntBounded(bound:number){return Math.min(1,bound-1);},nextDouble(){return .5;}};
test('M20 staff: 3 profissionais por cargo, 9 candidatos e níveis de 1..5',()=>{
 const s=emptyStaffState();const arr=drawStaffCandidates(s,202611,3,staffRng);
 assert.equal(arr.length,9);assert.deepEqual([...new Set(arr.map(x=>x.role))],STAFF_ROLES);
 assert(arr.every(x=>x.level>=1&&x.level<=5));assert(arr.every(x=>x.salary>0n));
});
test('M20 staff: geração mensal só troca candidatos quando muda mês',()=>{
 const s=emptyStaffState();drawStaffCandidates(s,202611,2,staffRng);
 const r={nextIntBounded(){throw Error('should not draw');},nextDouble(){throw Error('no');}};
 assert.equal(staffCandidates(s,202611,2,r).length,9);
});
test('M20 staff: reputação insuficiente não modifica candidatos nem profissionais',()=>{
 const s=emptyStaffState();s.candidates=[{role:'Analyst',name:[0,1],level:5,salary:1000n,profile:0,since:0}];
 assert.deepEqual(hireStaff(s,0,0,2026),{ok:false,reason:'Reputation',minimum:3});
 assert.equal(s.candidates.length,1);assert.equal(s.hired.length,0);
});
test('M20 staff: contratação substitui cargo, salário e demissão',()=>{
 const s=emptyStaffState();s.candidates=[{role:'Analyst',name:[0,1],level:2,salary:1000n,profile:0,since:0},
  {role:'Analyst',name:[3,2],level:3,salary:3000n,profile:1,since:0}];
 assert.deepEqual(hireStaff(s,0,6,2026),{ok:true});
 assert.deepEqual(hireStaff(s,0,6,2027),{ok:true});assert.equal(s.hired.length,1);
 assert.equal(staffWages(s),3000n);assert.equal(s.hired[0]!.since,2027);
 assert.equal(staffLevel(s,cfg(),'Analyst'),3);
 fireStaff(s,'Analyst');assert.equal(staffWages(s),0n);
});
test('M20 staff: desligado simula nível 5, mas não paga salário mensal',()=>{
 const s=emptyStaffState();s.hired=[{role:'Assistant',name:[0,0],level:2,salary:1000n,profile:1,since:2026}];
 const disabled=ModConfig.parse('COMISSAO=0');
 assert.equal(staffLevel(s,disabled,'Analyst'),5);
 let paid=0;payStaffMonth(s,disabled,'a',()=>paid++);assert.equal(paid,0);
 payStaffMonth(s,cfg(),'a',(club,value,kind)=>{assert.equal(club,'a');assert.equal(value,1000);assert.equal(kind,0);paid++;});
 assert.equal(paid,1);
});
const scoutPlayer=(id:string,extra:Partial<ScoutPlayer>={}):ScoutPlayer=>({id,key:id,name:id,club:'A',nationalTeam:false,
 position:3,age:20,marketValue:1000,star:false,worldClass:false,...extra});
function scoutContext():ScoutContext{
 return {players:[scoutPlayer('p',{club:'B'}),scoutPlayer('star',{club:'B',star:true}),scoutPlayer('mine')],myClub:'A',reputation:3,now:1000,state:{observations:[]},
 bestValue:()=>70,modValue:()=>65,bestKind:()=>2,payment:()=>{}};
}
test('M20 scouts: margem 0 próprios, 2 estrelas e 5 demais',()=>{
 const c=scoutContext();assert.equal(scoutMargin(c,c.players[2]!),0);
 assert.equal(scoutMargin(c,c.players[1]!),2);assert.equal(scoutMargin(c,c.players[0]!),5);
 assert.equal(scoutCost(c),150000);
});
test('M20 scouts: hash da chave fixa erro por atleta sem RNG',()=>{
 const c=scoutContext();assert.equal(scoutEstimate(c,c.players[0]!),scoutEstimate(c,c.players[0]!));
 assert.deepEqual(scoutRange(c,c.players[2]!,70),[70,70]);
});
test('M20 scouts: envio cobra, aguarda 14 dias e conclui observação',()=>{
 const c=scoutContext(),paid:number[]=[];c.payment=amount=>paid.push(amount);
 assert.equal(sendScout(c,'p',200000),undefined);assert.deepEqual(paid,[150000]);
 assert.equal(isBeingWatched(c,c.players[0]!),true);
 assert.equal(scoutsPending(c),1);assert.equal(sendScout(c,'p',200000),'AlreadyWatching');
 c.now+=14*86400000-1;assert.equal(scoutsTick(c,true),0);
 c.now++;assert.equal(scoutsTick(c,true),1);assert.equal(isWatched(c,c.players[0]!),true);
 assert.equal(sendScout(c,'p',200000),'AlreadyKnown');
});
test('M20 scouts: recusas de dinheiro e ausência de clube sem cobrança',()=>{
 const c=scoutContext();assert.equal(sendScout(c,'p',100),'NoCash');c.myClub=undefined;
 assert.equal(sendScout(c,'p',200000),'NoClub');assert.equal(c.state.observations.length,0);
});
test('M20 scouts: pesquisa ordena mais fortes, exclui seleções e limita 300',()=>{
 const c=scoutContext();c.players=[...Array.from({length:350},(_,i)=>scoutPlayer(String(i),{club:'B',marketValue:1,age:21})),
 scoutPlayer('nt',{nationalTeam:true})];
 c.bestValue=id=>id==='nt'?99:80;
 const r=searchScouts(c,-1,22,1,0);
 assert.equal(r.length,300);assert(!r.some(x=>x.player==='nt'));
});
function fansContext():FanContext{
 return {coach:{fanSupport:50},clubId:'A',wages:100000n,membersFactor:1,now:0,
 players:[{key:'a',name:'A',strength:50,club:'A',worldClass:false,onLoan:false}],squad:['a'],academy:[],idolKeys:new Set(),state:emptyFansState(),config:cfg()};
}
test('M20 fans: primeira atualização só salva snapshot e não cria evento',()=>{
 const c=fansContext();assert.equal(fansTick(c),0);assert.deepEqual(c.state.squad,{a:50});
});
test('M20 fans: estrela contratada aumenta apoio +7 e conserva últimos dez motivos',()=>{
 const c=fansContext();fansTick(c);
 c.players=[...c.players,{key:'b',name:'Bravo',strength:95,club:'A',worldClass:true,onLoan:false}];c.squad=['a','b'];
 assert.equal(fansTick(c),1);assert.equal(fanConfidence(c),57);
 for(let i=0;i<16;i++)fanEvent(c,1,{kind:'ImpactSigning',player:'x'});
 assert.equal(c.state.reasons.length,MAX_FAN_REASONS);assert.equal(c.coach!.fanSupport,73);
});
test('M20 fans: ídolo vendido desconta -7, empréstimo não',()=>{
 const c=fansContext();fansTick(c);c.idolKeys=new Set(['a']);
 c.players=[{key:'a',name:'A',strength:50,club:'B',clubName:'B',worldClass:false,onLoan:false}];c.squad=[];
 assert.equal(fansTick(c),1);assert.equal(c.coach!.fanSupport,43);
});
test('M20 fans: sócios dependem do humor e fator de marketing',()=>{
 const c=fansContext();assert.equal(monthlyMembership(c),6000n);
 c.membersFactor=2;assert.equal(monthlyMembership(c),12000n);
 let received=0;payFansMonth(c,(club,value,kind)=>{assert.equal(club,'A');assert.equal(kind,6);received=value;});
 assert.equal(received,12000);
});
function investorContext():InvestorContext{
 return {state:emptyInvestorState(),club:{id:'A',reputation:4,hasOwner:false,ownerFunding:0,ownerSince:0},
 now:Date.UTC(2026,0,15),year:2026,saveName:'save1',config:cfg(),rng:{nextIntBounded:()=>0,nextDouble:()=>0},
 newOwnerName:()=> 'Investidor X',sellClub:(club,_name,now,yearly)=>{club.hasOwner=true;club.ownerFunding=yearly;club.ownerSince=2026;},
 income:()=>{},fanEvent:()=>{},ownerLeaves:club=>{club.hasOwner=false;}};
}
test('M20 investor: taxa anual 15%, agenda no primeiro dia de fevereiro',()=>{
 const c=investorContext();investorTick(c);assert.equal(c.state.offer?.day,20260201);
 assert.equal(c.state.yearPaid,2026);assert.equal(c.state.yearDrawn,2026);
});
test('M20 investor: oferta depende de reputação e de sorteios 201 e 81',()=>{
 const c=investorContext();const o=investorOffer(c,20260201);
 assert.equal(o.investor,'Investidor X');assert.equal(o.now,98000000);
 assert.equal(o.yearly,39200000);
});
test('M20 investor: aceitar compra cria novo dono e não paga no primeiro ano',()=>{
 const c=investorContext();c.state.shown=investorOffer(c,20260115);
 let events=0;c.fanEvent=()=>events++;
 assert.equal(acceptInvestor(c),true);assert.equal(c.club!.hasOwner,true);
 assert.equal(c.state.yearPaid,2026);assert.equal(events,1);
});
test('M20 investor: recusa limpa proposta e duas reclamações provocam saída',()=>{
 const c=investorContext();c.club!.hasOwner=true;c.club!.ownerSince=2024;c.state.shown=investorOffer(c,20260201);
 refuseInvestor(c);assert.equal(c.state.shown,undefined);
 assert.equal(judgeOwner(c,2025,{position:8,expected:2,title:false}),false);
 assert.equal(judgeOwner(c,2026,{position:9,expected:2,title:false}),true);
 assert.equal(c.state.complaints,0);
});
test('M20 investor: aporte anual reduz 40% quando reclamações=1',()=>{
 const c=investorContext();c.club!.ownerSince=2025;c.club!.ownerFunding=100000000;
 c.state.complaints=1;let paid=0;c.income=(_club,amount,kind)=>{paid=amount;assert.equal(kind,9);};
 assert.equal(payOwnerInjection(c),true);assert.equal(paid,60000000);
});
test('M20 investor: troca de temporada reinicia avaliação de aquisição, requisita teste',()=>{
 const c=investorContext();investorTick(c);requestInvestorOffer(c);
 investorTick(c);assert.equal(c.state.testRequest,false);assert.equal(c.state.shown?.day,20260115);
});
