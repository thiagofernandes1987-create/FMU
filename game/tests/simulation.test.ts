declare function require(name:string):any;
const test=require('node:test');const assert=require('node:assert/strict');
import {NationalCupPort,CupState} from '../src/simulation/cup';
import {NationCompetitionsPort,WORLD_CUP_BRACKET,NationCompetition,NationStageOps,NationStage} from '../src/simulation/nations';
import {matchGrid,formation,moveInMatch,onPitchNow,MatchForGrid,SubstituteOps} from '../src/simulation/human_substitutions';
import {askHuman,noChanges} from '../src/simulation/human_default';
import {NumericClub,Rng} from '../src/types';
const clubs=Object.fromEntries(Array.from({length:60},(_,i)=>[String(i),{id:String(i),level:100-i,reputation:5,country:i%3}]));
const resolver={getClub:(id:string):NumericClub=>{const c=clubs[id];if(!c)throw Error('Unknown club');return c;}};
const rng:Rng={shuffle<T>(a:T[]){a.reverse();}};
const cup=(winners:number,skipped:number):CupState=>({rounds:[{clubs:[],winners:Array.from({length:winners},(_,i)=>String(i)),phase:0,twoLegged:false,formatCode:2129}],skippedClubs:Array.from({length:skipped},(_,i)=>String(40+i)),round:0,leg:2});
test('cup fase 2: 40 vencedores, 20 melhores x 20 fracos',()=>{
 const c=cup(40,0),r=new NationalCupPort(c,resolver,rng).nextPhase(2129,0)!;
 assert.equal(r.clubs.length,40);assert.equal(r.twoLegged,false);assert.equal(r.formatCode,2229);assert.equal(c.leg,1);
 assert.equal(r.clubs[0],'39');assert.equal(r.clubs[1],'19');assert.equal(c.rounds.length,2);
});
test('cup fase 3: 20 vencedores + 12 isentos, sorteio 32',()=>{
 const c=cup(20,12),r=new NationalCupPort(c,resolver,rng).nextPhase(2229,0)!;
 assert.equal(r.clubs.length,32);assert.equal(r.formatCode,2329);assert.equal(r.phase,2);assert.equal(r.twoLegged,true);
});
test('cup de 32: número incorreto não muda o estado',()=>{
 const c=cup(19,12);assert.equal(new NationalCupPort(c,resolver,rng).round32(0),undefined);assert.equal(c.rounds.length,1);
});
test('cup: dispatch rodadas finais e ordem RNG',()=>{
 const cases:[[number,number,number],...Array<[number,number,number]>]=[[2329,3,2429],[2429,4,2529],[2529,5,2629],[2629,6,2729]];
 for(const [fmt,phase,next] of cases){const c=cup(8,0),r=new NationalCupPort(c,resolver,rng).nextPhase(fmt,0)!;
  assert.equal(r.phase,phase);assert.equal(r.formatCode,next);assert.equal(r.clubs[0],'7');}
});
test('cup: formato desconhecido não cria nova rodada',()=>{const c=cup(5,0);assert.equal(new NationalCupPort(c,resolver,rng).nextPhase(9999,0),undefined);assert.equal(c.rounds.length,1);});
test('cup: IDs duplicados bloqueados antes de criar uma rodada',()=>{
 const c=cup(8,0);c.rounds[0]!.winners[5]='0';assert.throws(()=>new NationalCupPort(c,resolver,rng).draw(0,4,2529),/Duplicate/);assert.equal(c.rounds.length,1);
});
function stages(){let step=0;const calls:string[]=[];
 const ops:NationStageOps={newKnockoutStage:(_c,ids,mode,kind)=>{calls.push(`stage ${mode} ${ids.length} ${kind}`);return 'stage'+ ++step;},
 newKnockoutRound:(id,ids,phase,two,kind)=>calls.push(`round ${id} ${ids.length} ${phase} ${two} ${kind}`)};
 return {ops,calls};
}
test('nations: quatro vencedores da Liga A; estádio do primeiro após shuffle',()=>{
 const x=stages(),n=new NationCompetitionsPort(resolver,rng,x.ops),comp:NationCompetition={id:'nl',kind:5};
 const g={groups:Array.from({length:4},(_,i)=>({clubs:[String(i)]}))};
 assert.equal(n.finals(comp,g),'stage1');assert.equal(comp.valueAgy,clubs['3']?.country);
 assert.deepEqual(x.calls,['stage finals 4 5','round stage1 4 0 false 5']);
});
test('nations: play-off do descenso com quartos da Liga C',()=>{
 const x=stages(),n=new NationCompetitionsPort(resolver,rng,x.ops),c:NationCompetition={id:'nl',kind:5};
 const g={groups:Array.from({length:4},(_,i)=>({clubs:[String(i*4),String(i*4+1),String(i*4+2),String(i*4+3)]}))};
 n.relegation(c,g);assert.equal(c.knockoutAgx,'stage1');assert.equal(x.calls[0],'stage relegation 4 14006');
});
test('nations: Mundial 8 grupos segue ordem fixa Zw',()=>{
 const x=stages(),record:string[][]=[];
 const ops={...x.ops,newKnockoutRound:(_id:string,ids:readonly string[])=>record.push([...ids])};
 const n=new NationCompetitionsPort(resolver,rng,ops),comp:NationCompetition={id:'wc',kind:8};
 const groups:NationStage={groups:Array.from({length:8},(_,i)=>({clubs:[String(i*2),String(i*2+1)]}))};
 n.worldCup(comp,groups);assert.equal(groups.knockoutId,'stage1');assert.deepEqual(record[0],WORLD_CUP_BRACKET.map(i=>String(i)));
});
test('nations: Mundial 16 grupos gera 32 posições no bracket de dois blocos',()=>{
 const x=stages();let teams:string[]=[];const ops={...x.ops,newKnockoutRound:(_id:string,ids:readonly string[])=>{teams=[...ids];}};
 const n=new NationCompetitionsPort(resolver,rng,ops),c:NationCompetition={id:'wc',kind:8};
 n.worldCup(c,{groups:Array.from({length:16},(_,i)=>({clubs:[String(i*2),String(i*2+1)]}))});
 assert.equal(teams.length,32);assert.equal(teams[0],'0');assert.equal(teams[16],'16');
});
test('nations: falta dos quatro primeiros gera erro claro',()=>{
 const n=new NationCompetitionsPort(resolver,rng,stages().ops);
 assert.throws(()=>n.finals({id:'x',kind:1},{groups:[{clubs:['1']}]}),/Missing/);
});
function g():MatchForGrid{return {id:'m',home:'H',away:'A',homeHuman:false,awayHuman:false,
 homeStarters:['g','d','f'],awayStarters:[],homePlayed:['g','d','f'],awayPlayed:[],
 homeBench:['b'],awayBench:[],homeListFl:['r'],awayListFm:[],events:[]};}
function o(){const slots:Record<string,number>={g:1,d:6,f:20,b:26,r:27},calls:string[]=[];
 const ops:SubstituteOps={getSlot:id=>slots[id]??0,setSlot:(id,s)=>{slots[id]=s;calls.push(`slot ${id} ${s}`);},
 humanSubstitution:(_m,_side,from,to,h,min)=>{calls.push(`sub ${from} ${to} ${h} ${min}`);return true;}};
 return {ops,slots,calls};}
test('substituições: eventos confirmados mudam lista onPitch',()=>{
 const match=g();match.events=[{done:true,kind:'substitution',club:'H',player:'d',otherPlayer:'b'},{done:false,kind:'substitution',club:'H',player:'g',otherPlayer:'r'}];
 assert.deepEqual(onPitchNow(match,0),['g','f','b']);
});
test('substituições: grid 37 posições e reservas a partir de 26',()=>{
 const x=o(),grid=matchGrid(g(),0,x.ops);
 assert.equal(grid.places.length,37);assert.equal(grid.places[1],'g');assert.equal(grid.places[6],'d');
 assert.equal(grid.places[26],'b');assert.equal(grid.places[27],'r');
});
test('substituições: formação desconta goleiro e conta setores',()=>{
 const x=o(),grid=matchGrid(g(),0,x.ops);assert.deepEqual(formation(grid),[1,0,1]);
});
test('substituições: troca de dois em campo atualiza slots e mantém IDs',()=>{
 const x=o(),grid=matchGrid(g(),0,x.ops);
 assert.equal(moveInMatch(grid,6,20,1,48,false,x.ops),true);
 assert.equal(grid.places[6],'f');assert.equal(x.slots.f,6);assert.equal(x.slots.d,20);
});
test('substituições: troca banco↔campo usa minuto 1 no intervalo',()=>{
 const x=o(),grid=matchGrid(g(),0,x.ops);
 assert.equal(moveInMatch(grid,6,26,1,45,true,x.ops),true);
 assert.equal(grid.places[6],'b');assert.equal(grid.places[26],undefined);
 assert.ok(x.calls.includes('sub d b 1 1'));
});
test('substituições: rejeição da engine não modifica grid',()=>{
 const x=o(),grid=matchGrid(g(),0,x.ops),before=JSON.stringify(grid);
 assert.equal(moveInMatch(grid,6,26,1,45,false,{...x.ops,humanSubstitution:()=>false}),false);
 assert.equal(JSON.stringify(grid),before);
});
test('substituições: índices fora de 1..36 retornam falso',()=>{
 const x=o(),grid=matchGrid(g(),0,x.ops);
 for(const a of [-1,0,37])assert.equal(moveInMatch(grid,a,6,1,1,false,x.ops),false);
});
test('human: por padrão mantém shootout order e recusa todas as propostas',()=>{
 const order=['x','y'];assert.equal(noChanges.shootoutOrder('m','H',order),order);
 assert.equal(noChanges.jobOffer('c',['a','b']),undefined);
});
test('human: callback fornecido sobrescreve somente decisão específica',()=>{
 const result=askHuman({jobOffer:(_c,clubs)=>clubs[1]},h=>[h.jobOffer('c',['a','b']),h.penaltyTaker('m','H')]);
 assert.deepEqual(result,['b',undefined]);
});
import {STATE_CODES,trophyPicture,clubGallery,coachGallery,divisionPicture} from '../src/simulation/trophy';
test('trophy: 27 UFs brasileiras, SP índice 25',()=>{
 assert.equal(STATE_CODES.length,27);assert.equal(STATE_CODES[25],'SP');
});
test('trophy: fallback da 1ª divisão e nome d2 para 2ª',()=>{
 const known=new Set(['tr_nacional_BR','tr_nacional_BR_d2']);
 assert.equal(divisionPicture('tr_nacional_BR',1,'generic',s=>known.has(s)),'tr_nacional_BR');
 assert.equal(divisionPicture('tr_nacional_BR',2,'generic',s=>known.has(s)),'tr_nacional_BR_d2');
 assert.equal(divisionPicture('missing',2,'generic',()=>false),'generic');
});
test('trophy: Copa Nacional usa país da liga, não país do World',()=>{
 const c={id:'l',class:'NationalCup',country:19,leagueCountry:29,division:1};
 assert.equal(trophyPicture(c,s=>s==='tr_copa_BR',id=>id===29?'BR':''),'tr_copa_BR');
 assert.equal(trophyPicture(c,()=>false,()=>''),'tr_copa');
});
test('trophy: classes internacionais têm arquivo fixo',()=>{
 assert.equal(trophyPicture({id:'a',class:'WorldCup',country:0,division:1},()=>false,()=>''),'tr_copamundo');
 assert.equal(trophyPicture({id:'a',class:'NotKnown',country:0,division:1},()=>false,()=>''),'');
});
test('trophy: galeria de clube agrupa por temporada, não duplicata de troféu',()=>{
 const trophies=[{season:2024,competitionKind:1,competitionSubkind:1,competition:'l'},
 {season:2025,competitionKind:1,competitionSubkind:1,competition:'l'},
 {season:2025,competitionKind:1,competitionSubkind:1,competition:'l'}];
 const gallery=clubGallery(trophies,false,0);
 assert.equal(gallery[0]?.count,2);assert.deepEqual(gallery[0]?.seasons,[2025,2024]);
});
test('trophy: galeria de seleção inclui títulos continentais',()=>{
 const t=[{season:2026,competitionKind:14,competitionSubkind:0,competition:'a'}];
 const cards=clubGallery(t,true,0);assert.equal(cards.length,1);assert.equal(cards[0]?.count,1);
});
test('trophy: galeria de técnico mantém 3 colunas e campeão por id do jogo',()=>{
 const result=coachGallery(7,[{season:2025,competitionKind:1,competitionSubkind:1,competition:'BRA',clubId:'A'}],
  {WorldCup:[{season:2026,championCoach:7,competition:'WC'}]});
 assert.equal(result[0].length,1);assert.equal(result[1].length,1);assert.equal(result[2].length,0);
});
import {javaDoubleCompare,seasonAwards,countBestPlayerAward,endSeason,SeasonWorld,SEASON_TEAM_SLOTS} from '../src/simulation/season';
function seasonWorld():SeasonWorld {return {season:2026,leagues:[{id:'L',divIndex:0,minimumRatedGames:10}],
 leagueById:{L:{id:'L',ratings:[{player:'p',valueAc:0,average:9,ratedGames:12},
  {player:'q',valueAc:2,average:8,ratedGames:11},{player:'r',valueAc:5,average:7,ratedGames:9}],
  selections:[],bestPlayers:[]}},players:{p:{id:'p',age:24,star:false,worldClass:false,club:'A'},
  q:{id:'q',age:23,star:false,worldClass:false,club:'A'},r:{id:'r',age:36,star:false,worldClass:true,club:'A'}},
 clubs:{A:{id:'A',country:29}},calls:{},confederation:(country)=>country===29?1:0};}
test('season Java Double.compare diferencia zeros e NaN',()=>{
 assert.equal(javaDoubleCompare(-0,+0),-1);assert.equal(javaDoubleCompare(+0,-0),1);
 assert.equal(javaDoubleCompare(NaN,5),1);assert.equal(javaDoubleCompare(NaN,NaN),0);
});
test('season: seleção da liga respeita 11 slots e mínimo de avaliações',()=>{
 const s=seasonWorld();seasonAwards(s,'L',0,10);
 assert.equal(SEASON_TEAM_SLOTS.length,11);
 assert.deepEqual(s.leagueById.L!.selections[0]!.players,['p','q']);
 assert.equal(s.leagueById.L!.bestPlayers[0],'p');assert.equal(s.players.p!.star,true);
});
test('season: premiação dois ou quatro clubes e força de classe mundial',()=>{
 const s=seasonWorld();s.clubs.A!.country=29;
 for(let i=0;i<3;i++){countBestPlayerAward(s,'p');assert.equal(s.players.p!.worldClass,false);}
 countBestPlayerAward(s,'p');assert.equal(s.players.p!.worldClass,true);
});
test('season: encerra status world class após 34 anos e reinicia chamadas',()=>{
 const s=seasonWorld();s.calls.r=8;endSeason(s);
 assert.equal(s.players.r!.worldClass,false);assert.equal(s.calls.r,0);
 assert.equal(s.leagueById.L!.selections.length,1);
});
import {compareStandings,compareByLevel,compareCoaches,compareLevelAndReputation} from '../src/simulation/sorting';
test('sorting: desempate por número de clube em vez de ID',()=>{
 const a={id:'a',level:50,reputation:2,tiebreakNumber:5,country:29};
 const b={id:'b',level:50,reputation:2,tiebreakNumber:7,country:29};
 assert.ok(compareByLevel(a,b)>0);assert.ok(compareLevelAndReputation(b,a)<0);
});
test('sorting: pontos, vitórias, saldo, gols',()=>{
 assert.ok(compareStandings({points:5,wins:2,goalDifference:1,goalsFor:4},
  {points:5,wins:3,goalDifference:0,goalsFor:2})>0);
});
test('sorting: técnicos com mesma pontuação priorizam menos jogos',()=>{
 assert.ok(compareCoaches({points:8,wins:3,games:20},{points:8,wins:3,games:25})<0);
});
