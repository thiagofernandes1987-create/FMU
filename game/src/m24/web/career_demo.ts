/**
 * FMU M24 — Núcleo local de demonstração da carreira, não engine Rust.
 * Origem conceitual: crates/app/src/main.rs, screens/mod.rs e seletores
 * `src/m23/app/*`; contratos de liga, mercado e save JSON são adaptações.
 *
 * Responsabilidades: gerar temporada fictícia reproduzível, classificar equipes,
 * avançar uma rodada inteira sem mutações parciais, contratar jogadores livres,
 * gerir titulares, tática, custos e salvar/restaurar a carreira.
 * Dependências: `sortedHomeSquad`, `standingsBand` e `seasonDeals` do M23.
 * Efeitos: operações retornam uma NOVA cópia serializável de DemoCareer;
 * nenhum banco, servidor ou arquivo `.bfn` é modificado. `seed` é persistido.
 * Limite: não há paridade de partidas com o Brasfoot Next. Dados são fictícios.
 */
import {sortedHomeSquad} from '../../m23/app/home';
import {standingsBand} from '../../m23/app/standings';
import {seasonDeals} from '../../m23/app/market';
export type Position='GOL'|'DEF'|'MEI'|'ATA';
export type Formation='4-3-3'|'4-4-2'|'3-5-2';
export const FORMATIONS:readonly Formation[]=['4-3-3','4-4-2','3-5-2'];
export interface DemoPlayer {id:string;name:string;position:Position;rating:number;age:number;salary:number;price:number;fitness:number;goals:number;games:number;contractUntil:number;}
export interface DemoClub {id:string;name:string;short:string;color:string;cash:number;reputation:number;players:DemoPlayer[];formation:Formation;startingIds:string[];}
export interface DemoFixture {id:string;round:number;home:string;away:string;played:boolean;homeGoals?:number;awayGoals?:number;}
export interface DemoTransfer {id:string;playerId:string;playerName:string;fromId?:string;toId:string;fee:number;year:number;month:number;day:number;}
export interface DemoCareer {schema:'fmu-demo-v1';season:number;round:number;seed:number;myClubId:string;coachName:string;clubs:DemoClub[];freeAgents:DemoPlayer[];fixtures:DemoFixture[];transfers:DemoTransfer[];notices:string[];}
export interface Standing {clubId:string;played:number;wins:number;draws:number;losses:number;goalsFor:number;goalsAgainst:number;gd:number;points:number;band:'promotion'|'relegation'|'neutral';}
const CLUBS:[string,string,string][]=[
 ['Aurora Futebol Clube','AUR','#dca353'],['União do Vale','UVA','#69b7b6'],['Estrela do Norte','ENO','#9eabec'],
 ['Serra Azul','SAZ','#92b777'],['Ferroviário Central','FEC','#d58085'],['Atlético Litoral','ATL','#76a6d9'],
 ['Monte Verde','MVE','#b1a4da'],['Horizonte Esporte Clube','HOR','#d6b27e'],
 ['Vila Imperial','VIM','#9cd0ab'],['Real Pinhal','RPI','#d194ae']
];
const FIRST=['Lucas','Gabriel','Rafael','Arthur','Pedro','Matheus','André','Vitor','Miguel','Henrique','Caio','Davi','Bruno','Leonardo','Felipe','Thiago','João','Daniel','Hugo','Gustavo','Enzo','Nicolas'];
const LAST=['Silva','Almeida','Costa','Oliveira','Ribeiro','Martins','Ferreira','Lopes','Azevedo','Santos','Barros','Moura','Souza','Pereira','Carvalho','Rocha'];
const STARTING:readonly Position[]=['GOL','GOL','DEF','DEF','DEF','DEF','DEF','DEF','DEF','MEI','MEI','MEI','MEI','MEI','MEI','MEI','ATA','ATA','ATA','ATA','ATA','ATA'];
const MAX_MONEY=Number.MAX_SAFE_INTEGER;
function xorshift(seed:number):number {let x=seed|0;x^=x<<13;x^=x>>>17;x^=x<<5;return x|0;}
function draw(state:{seed:number},limit:number):number {if(!Number.isInteger(limit)||limit<1)throw Error('Invalid RNG bound');state.seed=xorshift(state.seed||0x6d2b79f5);return (state.seed>>>0)%limit;}
function clone<T>(v:T):T {return JSON.parse(JSON.stringify(v)) as T;}
function getClub(state:DemoCareer,id:string):DemoClub {const c=state.clubs.find(x=>x.id===id);if(!c)throw Error(`Clube não encontrado: ${id}`);return c;}
function ensureMoney(value:number):void {if(!Number.isSafeInteger(value)||Math.abs(value)>MAX_MONEY)throw Error('Saldo inválido');}
function makePlayer(id:string,index:number,clubIndex:number,seed:{seed:number},season:number):DemoPlayer {
 const p=STARTING[index%STARTING.length]!;
 const strength=49+draw(seed,25)+Math.floor(clubIndex/2);
 const name=`${FIRST[draw(seed,FIRST.length)]} ${LAST[draw(seed,LAST.length)]}`;
 const age=17+draw(seed,19);
 return {id,name,position:p,rating:Math.min(strength,99),age,salary:14000+strength*550,
   price:Math.round((strength**2)*380),fitness:90+draw(seed,11),goals:0,games:0,contractUntil:season+2};
}
/** Agendamento circular: N clubes × 2 turnos, uma partida por clube/rodada. */
export function createFixtures(clubIds:readonly string[]):DemoFixture[] {
 if(clubIds.length<4||clubIds.length%2!==0||new Set(clubIds).size!==clubIds.length)throw Error('Quantidade de clubes inválida');
 const rotation=[...clubIds];const first:DemoFixture[]=[];
 for(let round=1;round<clubIds.length;round++){
  for(let i=0;i<rotation.length/2;i++){
   let a=rotation[i]!,b=rotation[rotation.length-1-i]!;
   if((round+i)%2===0)[a,b]=[b,a];
   first.push({id:`s1-r${round}-${i}`,round,home:a,away:b,played:false});
  }
  rotation.splice(1,0,rotation.pop()!);
 }
 return [...first,...first.map((f,i)=>({id:`s1-r${clubIds.length+f.round-1}-${i}`,round:clubIds.length+f.round-1,home:f.away,away:f.home,played:false}))];
}
/** Demo reproduzível com 10 clubes fictícios; não importa dados privados. */
export function createDemoCareer(coachName='Técnico FMU',clubId='c0',seedValue=2026):DemoCareer {
 if(coachName.trim().length<2||coachName.trim().length>35)throw Error('Informe um nome de técnico entre 2 e 35 caracteres');
 const seed={seed:seedValue|0};const season=2026;
 const clubs=CLUBS.map(([name,short,color],i)=>{
  const players=STARTING.map((_,j)=>makePlayer(`c${i}-p${j}`,j,i,seed,season));
  // Titulares equilibrados: 1 goleiro, 4 defensores, 3 meias e 3 atacantes.
  const startingIds=[0,2,3,4,5,9,10,11,16,17,18].map(j=>players[j]!.id);
  return {id:`c${i}`,name,short,color,cash:11_000_000+i*520_000,reputation:2+(i%5),players,formation:'4-3-3' as Formation,startingIds};
 });
 const freeAgents=Array.from({length:16},(_,i)=>makePlayer(`free-${i}`,i,i%8,seed,season));
 if(!clubs.some(c=>c.id===clubId))throw Error('Clube escolhido não existe');
 return {schema:'fmu-demo-v1',season,round:1,seed:seed.seed,myClubId:clubId,coachName:coachName.trim(),clubs,
  freeAgents,fixtures:createFixtures(clubs.map(c=>c.id)),transfers:[],notices:['Bem-vindo à demonstração de carreira. O mundo e os atletas são fictícios.']};
}
export function roundsInSeason(s:DemoCareer):number {return s.clubs.length*2-2;}
/** Classificação viva. `standingsBand` é o seletor portado no M23. */
export function standings(s:DemoCareer):Standing[] {
 const rows=s.clubs.map(c=>({clubId:c.id,played:0,wins:0,draws:0,losses:0,goalsFor:0,goalsAgainst:0,gd:0,points:0,band:'neutral' as Standing['band']}));
 const map=new Map(rows.map(r=>[r.clubId,r]));
 for(const f of s.fixtures.filter(x=>x.played)){
  const h=map.get(f.home),a=map.get(f.away);if(!h||!a||f.homeGoals===undefined||f.awayGoals===undefined)throw Error('Partida inválida na classificação');
  h.played++;a.played++;h.goalsFor+=f.homeGoals;h.goalsAgainst+=f.awayGoals;a.goalsFor+=f.awayGoals;a.goalsAgainst+=f.homeGoals;
  if(f.homeGoals>f.awayGoals){h.points+=3;h.wins++;a.losses++;}
  else if(f.homeGoals<f.awayGoals){a.points+=3;a.wins++;h.losses++;}
  else {h.points++;a.points++;h.draws++;a.draws++;}
 }
 for(const r of rows)r.gd=r.goalsFor-r.goalsAgainst;
 rows.sort((a,b)=>b.points-a.points||b.wins-a.wins||b.gd-a.gd||b.goalsFor-a.goalsFor||a.clubId.localeCompare(b.clubId));
 rows.forEach((r,i)=>{r.band=standingsBand(i,rows.length,2,2);});return rows;
}
export function playerIsStarter(club:DemoClub,id:string):boolean{return club.startingIds.includes(id);}
/** M23: `sortedHomeSquad` reutilizado para a ordem por atributo. */
export function sortedPlayers(club:DemoClub,field:'rating'|'age'|'name'|'position'|'goals'='rating'):DemoPlayer[] {
 return sortedHomeSquad(club.players,field,(p,key)=>key==='position'?p.position:key==='name'?p.name:key==='rating'?p.rating:key==='age'?p.age:p.goals);
}
function teamStrength(club:DemoClub):number {
 const selected=club.startingIds.map(id=>club.players.find(p=>p.id===id));
 if(selected.some(x=>!x)||selected.length!==11)throw Error('Escalação incompleta');
 const average=selected.reduce((sum,p)=>sum+p!.rating*(0.85+p!.fitness/650),0)/11;
 const tactical=club.formation==='4-3-3'?1.2:club.formation==='4-4-2'?0.7:0.9;
 return average+tactical;
}
function goals(strength:number,rival:number,seed:{seed:number}):number {
 const chance=0.23+(strength-rival)/220;
 let total=0;
 for(let k=0;k<5;k++)if(draw(seed,10000)/10000<Math.max(.08,Math.min(.64,chance)))total++;
 return total;
}
/** Uma rodada inteira e despesas reais do sandbox; clone evita mutação parcial. */
export function advanceDemoRound(s:DemoCareer):DemoCareer {
 validateDemoCareer(s);
 if(s.round>roundsInSeason(s))throw Error('Temporada encerrada. Inicie a próxima temporada.');
 const next=clone(s),source=next.fixtures.filter(f=>f.round===next.round);
 if(source.length!==next.clubs.length/2||source.some(f=>f.played))throw Error('Rodada inválida');
 const rng={seed:next.seed};
 for(const f of source){
  const home=getClub(next,f.home),away=getClub(next,f.away);
  f.homeGoals=goals(teamStrength(home)+2,teamStrength(away),rng);
  f.awayGoals=goals(teamStrength(away),teamStrength(home)+2,rng);f.played=true;
  const tickets=180000+draw(rng,110000);home.cash+=tickets;
  for(const club of [home,away]){
   // Salários de um mês a cada quatro rodadas; atletas na escalação consomem energia.
   for(const p of club.players){if(playerIsStarter(club,p.id)){p.games++;p.fitness=Math.min(100,Math.max(63,p.fitness-2+draw(rng,4)));}else p.fitness=Math.min(100,p.fitness+2);}
   if(next.round%4===0){club.cash-=club.players.reduce((acc,p)=>acc+p.salary,0);}
   ensureMoney(club.cash);
  }
  for(const [club,count] of [[home,f.homeGoals],[away,f.awayGoals]] as const){
   const attackers=club.players.filter(p=>club.startingIds.includes(p.id)&&p.position==='ATA');
   for(let i=0;i<count;i++)if(attackers.length)attackers[draw(rng,attackers.length)]!.goals++;
  }
 }
 next.round++;next.seed=rng.seed;
 const mine=source.find(f=>f.home===next.myClubId||f.away===next.myClubId)!;
 next.notices=[`Rodada ${s.round}: ${getClub(next,mine.home).short} ${mine.homeGoals} × ${mine.awayGoals} ${getClub(next,mine.away).short}`, ...next.notices].slice(0,20);
 return next;
}
/** Novo calendário; envelhece atletas, aumenta a força jovem e repõe energia. */
export function nextDemoSeason(s:DemoCareer):DemoCareer {
 validateDemoCareer(s);
 if(s.round<=roundsInSeason(s))throw Error('Conclua todas as rodadas antes de mudar de temporada');
 const next=clone(s);next.season++;next.round=1;
 for(const club of next.clubs){
  club.cash+=3_500_000;ensureMoney(club.cash);
  for(const p of club.players){p.age++;p.games=0;p.goals=0;p.fitness=100;if(p.age<=24)p.rating=Math.min(99,p.rating+1);else if(p.age>=33)p.rating=Math.max(30,p.rating-1);}
 }
 next.fixtures=createFixtures(next.clubs.map(c=>c.id));next.notices=[`Temporada ${next.season}: aporte fictício de patrocínio de R$ 3.500.000.`, ...next.notices].slice(0,20);
 return next;
}
export function setDemoFormation(s:DemoCareer,formation:Formation):DemoCareer {
 if(!FORMATIONS.includes(formation))throw Error('Formação inválida');const next=clone(s);getClub(next,next.myClubId).formation=formation;return next;
}
/** Reserva ocupa exatamente a vaga do titular escolhido. */
export function swapDemoStarter(s:DemoCareer,outId:string,inId:string):DemoCareer {
 const next=clone(s),club=getClub(next,next.myClubId);
 if(!club.players.some(x=>x.id===inId)||!club.startingIds.includes(outId)||club.startingIds.includes(inId))throw Error('Troca de escalação inválida');
 club.startingIds.splice(club.startingIds.indexOf(outId),1,inId);return next;
}
/** Contratação com caixa, limite de elenco, registro financeiro e posse. */
export function hireDemoFreeAgent(s:DemoCareer,id:string):DemoCareer {
 validateDemoCareer(s);const next=clone(s),club=getClub(next,next.myClubId);
 const index=next.freeAgents.findIndex(p=>p.id===id);if(index<0)throw Error('Jogador não disponível');
 const player=next.freeAgents[index]!;if(club.players.length>=30)throw Error('Elenco atingiu o limite de 30 jogadores');
 if(club.cash<player.price)throw Error('Saldo insuficiente para a contratação');
 club.cash-=player.price;ensureMoney(club.cash);club.players.push(next.freeAgents.splice(index,1)[0]!);
 next.transfers.push({id:`trade-${next.transfers.length+1}`,playerId:id,playerName:player.name,toId:club.id,fee:player.price,
  year:next.season,month:1,day:next.round});
 next.notices=[`${player.name} contratado por ${formatMoney(player.price)}.`,...next.notices].slice(0,20);
 return next;
}
/** Consulta ao seletor de transferências M23 com formato de data. */
export function recentDemoDeals(s:DemoCareer){return seasonDeals(s.transfers,s.season);}
export function switchDemoClub(s:DemoCareer,id:string):DemoCareer {const next=clone(s);getClub(next,id);next.myClubId=id;return next;}
export function formatMoney(value:number):string {
 if(!Number.isFinite(value))return '—';return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(value);
}
/** Validar saves ANTES de utilizar em render/execução; nunca importar `.bfn` como JSON. */
export function validateDemoCareer(x:unknown):asserts x is DemoCareer {
 if(!x||typeof x!=='object'||Array.isArray(x))throw Error('Arquivo de carreira inválido');
 const s=x as DemoCareer;
 if(s.schema!=='fmu-demo-v1'||!Number.isInteger(s.season)||s.season<2026||s.season>2300||
    !Number.isInteger(s.round)||!Number.isInteger(s.seed)||!Array.isArray(s.clubs)||s.clubs.length!==CLUBS.length||
    !Array.isArray(s.fixtures)||!Array.isArray(s.freeAgents)||!Array.isArray(s.transfers)||!Array.isArray(s.notices)||
    typeof s.coachName!=='string'||s.coachName.length<2||s.coachName.length>35||!s.clubs.some(c=>c.id===s.myClubId))throw Error('Estrutura de carreira incompatível');
 if(s.round<1||s.round>roundsInSeason(s)+1||s.fixtures.length!==s.clubs.length*(s.clubs.length-1))throw Error('Calendário inválido');
 const ids=new Set<string>(),playerIds=new Set<string>();
 for(const c of s.clubs){
  if(!c||typeof c.id!=='string'||ids.has(c.id)||typeof c.name!=='string'||!FORMATIONS.includes(c.formation)||
      !Number.isSafeInteger(c.cash)||c.cash< -5_000_000||!Array.isArray(c.players)||!Array.isArray(c.startingIds)||c.startingIds.length!==11||c.players.length>30)throw Error('Clube inválido na carreira');
  ids.add(c.id);const roster=new Set<string>();
  for(const p of c.players){validatePlayer(p);if(roster.has(p.id)||playerIds.has(p.id))throw Error('Jogador duplicado');roster.add(p.id);playerIds.add(p.id);}
  if(new Set(c.startingIds).size!==11||c.startingIds.some(id=>!roster.has(id)))throw Error('Escalação inválida');
 }
 for(const p of s.freeAgents){validatePlayer(p);if(playerIds.has(p.id))throw Error('Jogador livre duplicado');playerIds.add(p.id);}
 const matches=new Set<string>();for(const f of s.fixtures){
  if(!f||typeof f.id!=='string'||matches.has(f.id)||!ids.has(f.home)||!ids.has(f.away)||f.home===f.away||
    !Number.isInteger(f.round)||f.round<1||f.round>roundsInSeason(s)||typeof f.played!=='boolean'||
    f.played && (!Number.isInteger(f.homeGoals)||!Number.isInteger(f.awayGoals)||f.homeGoals!<0||f.awayGoals!<0||f.homeGoals!>20||f.awayGoals!>20))throw Error('Partida inválida');
  matches.add(f.id);
 }
 for(const t of s.transfers)if(typeof t.id!=='string'||typeof t.playerName!=='string'||!Number.isSafeInteger(t.fee)||!ids.has(t.toId))throw Error('Transferência inválida');
}
function validatePlayer(p:DemoPlayer):void {
 if(!p||typeof p.id!=='string'||typeof p.name!=='string'||p.name.length>90||
  !['GOL','DEF','MEI','ATA'].includes(p.position)||!Number.isInteger(p.rating)||p.rating<1||p.rating>100||
  !Number.isInteger(p.age)||p.age<14||p.age>80||![p.salary,p.price,p.fitness,p.goals,p.games,p.contractUntil].every(Number.isSafeInteger)||
  p.price<0||p.salary<0||p.fitness<0||p.fitness>100)throw Error('Dados de jogador inválidos');
}
export function serializeDemoCareer(s:DemoCareer):string {validateDemoCareer(s);return JSON.stringify(s,null,2);}
export function restoreDemoCareer(text:string):DemoCareer {
 if(text.length>2_000_000)throw Error('Arquivo de carreira excede 2 MB');
 const value:unknown=JSON.parse(text);validateDemoCareer(value);return clone(value);
}
