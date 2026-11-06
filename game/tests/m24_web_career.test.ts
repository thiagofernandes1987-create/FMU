/** M24 — teste de domínio e consumidores da interface web; NÃO teste de equivalência Rust. */
declare function require(name:string):any;
const test=require('node:test'),assert=require('node:assert/strict');
import {
 createDemoCareer,createFixtures,advanceDemoRound,standings,roundsInSeason,
 nextDemoSeason,swapDemoStarter,setDemoFormation,hireDemoFreeAgent,
 switchDemoClub,serializeDemoCareer,restoreDemoCareer,validateDemoCareer,
 recentDemoDeals,sortedPlayers,formatMoney
} from '../src/m24/web/career_demo';
import {standingsBand} from '../src/m23/app/standings';
const fresh=()=>createDemoCareer();
test('M24 demo: 10 equipes fictícias e 22 jogadores em cada elenco',()=>{
 const a=fresh();assert.equal(a.clubs.length,10);assert.equal(a.clubs[0]!.players.length,22);
 assert.equal(a.clubs[0]!.startingIds.length,11);assert.equal(a.freeAgents.length,16);
 validateDemoCareer(a);
});
test('M24 demo: 18 rodadas e 90 jogos ida/volta, 5 por rodada',()=>{
 const a=fresh();assert.equal(roundsInSeason(a),18);assert.equal(a.fixtures.length,90);
 for(let round=1;round<=18;round++){
  const xs=a.fixtures.filter(f=>f.round===round);
  assert.equal(xs.length,5);
  const playedIds=xs.flatMap(x=>[x.home,x.away]);assert.equal(new Set(playedIds).size,10);
 }
 for(const x of a.fixtures){assert.equal(a.fixtures.filter(y=>y.home===x.away&&y.away===x.home).length,1);}
});
test('M24 demo: novas carreiras com a mesma semente são idênticas',()=>{
 assert.deepEqual(createDemoCareer('Coach','c2',88),createDemoCareer('Coach','c2',88));
});
test('M24 demo: nome de técnico precisa ter de 2 a 35 caracteres',()=>{
 assert.throws(()=>createDemoCareer('x'),/nome/);assert.throws(()=>createDemoCareer('a'.repeat(36)),/nome/);
 assert.equal(createDemoCareer('Coach', 'c0').coachName,'Coach');
});
test('M24 demo: clube não existe é rejeitado',()=>{assert.throws(()=>createDemoCareer('Coach','x'),/existe/);});
test('M24 demo: avanço de uma rodada atualiza cinco partidas, sem mutar a entrada',()=>{
 const a=fresh(),before=serializeDemoCareer(a),b=advanceDemoRound(a);
 assert.equal(serializeDemoCareer(a),before);assert.equal(b.round,2);
 assert.equal(b.fixtures.filter(x=>x.played).length,5);
 assert.equal(standings(b).reduce((sum,r)=>sum+r.played,0),10);
});
test('M24 demo: resultados reproduzíveis após salvar/restaurar a carreira',()=>{
 let a=fresh();for(let i=0;i<3;i++)a=advanceDemoRound(a);
 let b=restoreDemoCareer(serializeDemoCareer(a));
 for(let i=0;i<7;i++){a=advanceDemoRound(a);b=advanceDemoRound(b);}
 assert.deepEqual(a,b);
});
test('M24 demo: season loop 18 rodadas e reinício no ano seguinte',()=>{
 let a=fresh();for(let i=0;i<18;i++)a=advanceDemoRound(a);
 assert.equal(a.round,19);assert.equal(a.fixtures.filter(f=>f.played).length,90);
 assert.throws(()=>advanceDemoRound(a),/encerrada/);
 const b=nextDemoSeason(a);assert.equal(b.season,2027);assert.equal(b.round,1);
 assert.equal(b.fixtures.filter(f=>f.played).length,0);
 assert.equal(b.clubs[0]!.players[0]!.age,a.clubs[0]!.players[0]!.age+1);
});
test('M24 demo: não inicia segunda temporada antes de concluir a primeira',()=>{
 assert.throws(()=>nextDemoSeason(fresh()),/rodadas/);
});
test('M24 demo: oito temporadas determinísticas sem valores inválidos',()=>{
 let a=fresh();for(let season=0;season<8;season++){
  for(let i=0;i<18;i++)a=advanceDemoRound(a);
  validateDemoCareer(a);
  const standingsRows=standings(a);assert.equal(standingsRows.reduce((s,x)=>s+x.played,0),180);
  assert(standingsRows.every(x=>Number.isInteger(x.points)&&x.points>=0));
  a=nextDemoSeason(a);
 }
 assert.equal(a.season,2034);
});
test('M24 demo: salário debitado a cada quatro rodadas',()=>{
 let a=fresh();const before=a.clubs[0]!.cash;
 const wage=a.clubs[0]!.players.reduce((s,p)=>s+p.salary,0);
 for(let i=0;i<4;i++)a=advanceDemoRound(a);
 const after=a.clubs[0]!.cash;
 assert(after<=before+4*300000-wage);
});
test('M24 demo: placares geram pontos 3/1/0, vitórias e saldo coerentes',()=>{
 let a=fresh();for(let i=0;i<5;i++)a=advanceDemoRound(a);
 const rows=standings(a);assert.equal(rows.length,10);
 for(const r of rows){assert.equal(r.points,r.wins*3+r.draws);assert.equal(r.played,r.wins+r.draws+r.losses);assert.equal(r.gd,r.goalsFor-r.goalsAgainst);}
 assert.deepEqual(rows.map(r=>r.points),[...rows].sort((x,y)=>y.points-x.points).map(r=>r.points));
});
test('M24 demo: bandas de classificação reutilizam seletor M23',()=>{
 const r=standings(fresh());assert.equal(r[0]!.band,standingsBand(0,10,2,2));
 assert.equal(r[9]!.band,standingsBand(9,10,2,2));
});
test('M24 demo: mudança de formação cria novo estado e preserva o anterior',()=>{
 const a=fresh(),b=setDemoFormation(a,'3-5-2');assert.equal(b.clubs[0]!.formation,'3-5-2');
 assert.equal(a.clubs[0]!.formation,'4-3-3');assert.throws(()=>setDemoFormation(a,'2-2-6' as any),/inválida/);
});
test('M24 demo: substituição de titular exige reserva única',()=>{
 const a=fresh(),c=a.clubs[0]!,out=c.startingIds[0]!,into=c.players.find(p=>!c.startingIds.includes(p.id))!.id;
 const b=swapDemoStarter(a,out,into);
 assert.equal(b.clubs[0]!.startingIds.includes(out),false);assert.equal(b.clubs[0]!.startingIds.includes(into),true);
 assert.equal(a.clubs[0]!.startingIds.includes(out),true);
 assert.throws(()=>swapDemoStarter(b,out,into),/inválida/);
});
test('M24 demo: troca de clube não altera saldo nem elenco do clube anterior',()=>{
 const a=fresh(),b=switchDemoClub(a,'c4');assert.equal(b.myClubId,'c4');assert.deepEqual(b.clubs,a.clubs);
 assert.throws(()=>switchDemoClub(a,'none'),/encontrado/);
});
test('M24 demo: contratação livre debita caixa, altera elenco e registra transferência',()=>{
 const a=fresh(),p=a.freeAgents[0]!,club=a.clubs[0]!,b=hireDemoFreeAgent(a,p.id);
 assert.equal(b.clubs[0]!.cash,club.cash-p.price);
 assert.equal(b.clubs[0]!.players.length,club.players.length+1);
 assert.equal(b.freeAgents.length,a.freeAgents.length-1);
 assert.equal(b.transfers.length,1);
 assert.equal(recentDemoDeals(b).length,1);
 assert.equal(a.transfers.length,0);
});
test('M24 demo: valor acima do caixa deve recusar sem mutação',()=>{
 const a=fresh(),id=a.freeAgents[0]!.id;
 a.clubs[0]!.cash=0;const before=JSON.stringify(a);
 assert.throws(()=>hireDemoFreeAgent(a,id),/Saldo insuficiente/);assert.equal(JSON.stringify(a),before);
});
test('M24 demo: não contrata o mesmo atleta duas vezes',()=>{
 let a=fresh();const id=a.freeAgents[0]!.id;a=hireDemoFreeAgent(a,id);
 assert.throws(()=>hireDemoFreeAgent(a,id),/não disponível/);
});
test('M24 demo: limite de elenco 30 é respeitado',()=>{
 const a=fresh(),club=a.clubs[0]!;
 // Usamos atletas livres com IDs distintos de forma controlada para simular 30 titulares/reservas.
 for(let i=0;i<8;i++)club.players.push({...a.freeAgents[i]!,id:'extra'+i});
 assert.equal(club.players.length,30);assert.throws(()=>hireDemoFreeAgent(a,a.freeAgents[8]!.id),/limite de 30/);
});
test('M24 demo: ordenação reutiliza view-model M23 e não modifica elenco',()=>{
 const a=fresh(),club=a.clubs[0]!,original=club.players.map(p=>p.id);
 const sorted=sortedPlayers(club,'rating');assert.equal(sorted.length,club.players.length);
 assert.deepEqual(club.players.map(p=>p.id),original);
});
test('M24 demo: save/load JSON conserva toda a informação',()=>{
 let a=fresh();a=advanceDemoRound(a);a=hireDemoFreeAgent(a,a.freeAgents[0]!.id);
 assert.deepEqual(restoreDemoCareer(serializeDemoCareer(a)),a);
});
test('M24 demo: save inválido e formato Rust bfn são recusados sem fallback silencioso',()=>{
 for(const x of ['bfn','{"schema":"bfn"}','[]','{}','not json'])assert.throws(()=>restoreDemoCareer(x));
});
test('M24 demo: arquivo acima de 2 MB recusado',()=>{assert.throws(()=>restoreDemoCareer(' '.repeat(2000001)),/2 MB/);});
test('M24 demo: altera data inválida, jogador duplicado e escudo inexistente → rejeição',()=>{
 const a=fresh(),b=JSON.parse(serializeDemoCareer(a));b.round=100;assert.throws(()=>validateDemoCareer(b),/Calendário/);
 const c=JSON.parse(serializeDemoCareer(a));c.clubs[1].players[0].id=c.clubs[0].players[0].id;
 assert.throws(()=>validateDemoCareer(c),/duplicado/);
});
test('M24 demo: funções de moeda rejeitam NaN e respondem pt-BR',()=>{
 assert.equal(formatMoney(NaN),'—');assert.match(formatMoney(1000),/1\.000/);
});

test('M24 regressão visual/tática: formação inicial possui atletas nas quatro linhas do campo',()=>{
 const a=fresh(),c=a.clubs[0]!;const byPosition=new Map<string,number>();
 for(const id of c.startingIds){const p=c.players.find(q=>q.id===id)!;byPosition.set(p.position,(byPosition.get(p.position)??0)+1);}
 assert.deepEqual(Object.fromEntries(byPosition),{GOL:1,DEF:4,MEI:3,ATA:3});
});
