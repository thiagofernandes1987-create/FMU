/**
 * FMU M24 — front-end DOM responsivo sobre a carreira sandbox.
 * Origem funcional: crates/app/src/main.rs, screens/mod.rs e seletores M23.
 * Ao contrário dos view-models M23, renderiza e opera as telas no navegador.
 * Dependências: career_demo.ts, helpers M23 e DOM local; nenhum servidor.
 * Efeitos: DOM, localStorage e downloads JSON mediante interação explícita.
 * NÃO converte o renderizador egui nem abre `.bfn` do jogo original.
 */
import {
  DemoCareer,DemoClub,DemoPlayer,Standing,Formation,Position,FORMATIONS,
  createDemoCareer,advanceDemoRound,nextDemoSeason,roundsInSeason,standings,
  sortedPlayers,setDemoFormation,swapDemoStarter,hireDemoFreeAgent,
  recentDemoDeals,switchDemoClub,formatMoney,restoreDemoCareer,serializeDemoCareer
} from './career_demo';
import {DemoMatchReplay} from '../../m25/web/demo_replay';
const SAVE_KEY='fmu-m24-demo-save-v1';
type Screen='overview'|'squad'|'tactics'|'calendar'|'replay'|'standings'|'market'|'finances'|'messages';
let career:DemoCareer;
let screen:Screen='overview',menuOpen=false,query='',sortKey:'rating'|'name'|'age'|'goals'='rating',selectedId:string|undefined;
let sourceId:string|undefined,feedback='';
/** Estado efêmero: replay não altera nem entra no JSON da carreira. */
let matchReplay:DemoMatchReplay|undefined;
const root=document.getElementById('app');
if(!root)throw Error('Missing app root');
const allScreens:readonly {id:Screen;label:string;symbol:string;group:string}[]=[
 {id:'overview',label:'Visão geral',symbol:'◫',group:'CARREIRA'},
 {id:'squad',label:'Elenco',symbol:'♟',group:'GESTÃO ESPORTIVA'},
 {id:'tactics',label:'Táticas',symbol:'◇',group:'GESTÃO ESPORTIVA'},
 {id:'calendar',label:'Calendário',symbol:'▦',group:'GESTÃO ESPORTIVA'},
 {id:'replay',label:'Replay da rodada',symbol:'▶',group:'GESTÃO ESPORTIVA'},
 {id:'standings',label:'Classificação',symbol:'▥',group:'COMPETIÇÕES'},
 {id:'market',label:'Mercado',symbol:'⇄',group:'CLUBE'},
 {id:'finances',label:'Finanças',symbol:'◈',group:'CLUBE'},
 {id:'messages',label:'Central de mensagens',symbol:'✉',group:'CLUBE'}
];
function esc(v:unknown):string {return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));}
function myClub():DemoClub{return career.clubs.find(c=>c.id===career.myClubId)!;}
function short(id:string):string{return career.clubs.find(c=>c.id===id)?.short??id;}
function clubName(id:string):string{return career.clubs.find(c=>c.id===id)?.name??id;}
function initials(c:DemoClub):string{return c.short.slice(0,3);}
function crest(c:DemoClub,small=false):string{return `<span class="crest${small?' crest-sm':''}" style="--club-color:${esc(c.color)}" aria-label="Escudo fictício ${esc(c.name)}">${esc(initials(c))}</span>`;}
function money(n:number):string{return formatMoney(n);}
function title(h:string,sub:string,action=''):string{return `<div class="section-header"><div><p class="eyebrow">${esc(sub)}</p><h1>${esc(h)}</h1></div>${action}</div>`;}
function empty(text:string):string{return `<div class="empty"><span aria-hidden="true">◇</span><p>${esc(text)}</p></div>`;}
function getStats():Standing{return standings(career).find(r=>r.clubId===career.myClubId)!;}
function future():ReturnType<typeof career.fixtures.find> {return career.fixtures.find(f=>!f.played&&(f.home===career.myClubId||f.away===career.myClubId));}
function recent():ReturnType<typeof career.fixtures.find> {return [...career.fixtures].reverse().find(f=>f.played&&(f.home===career.myClubId||f.away===career.myClubId));}
function posName(p:DemoPlayer):string{return p.position;}
function positionPill(p:DemoPlayer):string{return `<span class="pos pos-${p.position}">${esc(p.position)}</span>`;}
function rating(p:DemoPlayer):string{return `<span class="rating${p.rating>=75?' rating-good':''}">${p.rating}</span>`;}
function decorateClub(id:string):string {const c=career.clubs.find(x=>x.id===id);return c?`${crest(c,true)}<span>${esc(c.name)}</span>`:esc(id);}
function scoreboard(f:NonNullable<ReturnType<typeof future>>,compact=false):string{
 const played=f.played;
 return `<div class="scoreboard${compact?' compact':''}">
  <div class="team-name">${decorateClub(f.home)}</div>
  <div class="match-score">${played?`${f.homeGoals} <span>:</span> ${f.awayGoals}`:'<span>VS</span>'}</div>
  <div class="team-name team-right">${decorateClub(f.away)}</div>
 </div>`;
}
function button(action:string,label:string,variant='primary',extra=''):string{return `<button type="button" class="btn ${variant}" data-action="${esc(action)}" ${extra}>${label}</button>`;}
function overview():string {
 const c=myClub(),stats=getStats(),ranking=standings(career),place=ranking.findIndex(x=>x.clubId===c.id)+1;
 const next=future(),last=recent();
 const news=career.notices.slice(0,4).map(n=>`<li><span class="activity-dot"></span><span>${esc(n)}</span></li>`).join('');
 return `${title('Painel do clube',`Temporada ${career.season} · ${esc(c.name)}`,button('advance',career.round<=roundsInSeason(career)?'▶ Avançar rodada':'↻ Nova temporada'))}
  <div class="kpis"><div class="kpi"><p>Posição na liga</p><strong>${place}<span class="muted">º / ${ranking.length}</span></strong><small>${stats.points} pontos em ${stats.played} jogos</small></div>
  <div class="kpi"><p>Saldo do clube</p><strong class="money-value">${money(c.cash)}</strong><small>Disponível para gestão</small></div>
  <div class="kpi"><p>Campanha</p><strong>${stats.wins} <span class="muted">V</span> <span class="negative">${stats.losses} D</span></strong><small>${stats.draws} empates · Saldo ${stats.gd>=0?'+':''}${stats.gd}</small></div>
  <div class="kpi"><p>Força do elenco</p><strong>${Math.round(c.players.reduce((a,p)=>a+p.rating,0)/c.players.length)} <span class="muted">OVR</span></strong><small>${c.players.length} atletas · ${esc(c.formation)}</small></div></div>
  <div class="two-cols"><section class="panel next-match"><div class="panel-heading"><h2>Próximo compromisso</h2><span class="micro-label">${next?`RODADA ${next.round}`:'TEMPORADA ENCERRADA'}</span></div>
    ${next?`<div class="match-context">LIGA NACIONAL · ${next.home===c.id?'EM CASA':'FORA DE CASA'}</div>${scoreboard(next)}<div class="match-footer"><span>Preparação: ${esc(c.formation)}</span>${button('navigate-tactics','Ajustar tática','secondary')}</div>`:empty('Todas as rodadas foram disputadas. Inicie uma nova temporada.')}
  </section>
  <section class="panel"><div class="panel-heading"><h2>Último resultado</h2>${last?`<span class="micro-label">RODADA ${last.round}</span>`:''}</div>
   ${last?`${scoreboard(last)}<div class="match-footer"><span>${last.home===c.id?'Seu clube jogou em casa':'Seu clube jogou fora'}</span>${button('navigate-calendar','Ver calendário','secondary')}</div>`:empty('Os jogos da temporada ainda não começaram.')}
  </section></div>
  <div class="two-cols below"><section class="panel"><div class="panel-heading"><h2>Classificação</h2>${button('navigate-standings','Tabela completa','quiet')}</div>${tableMarkup(standings(career).slice(0,5),true)}</section>
  <section class="panel"><div class="panel-heading"><h2>Notícias do clube</h2>${button('navigate-messages','Ver todas','quiet')}</div><ul class="activity-list">${news}</ul></section></div>`;
}
function tableMarkup(rows:Standing[],compact=false):string {
 return `<div class="table-wrap"><table class="league-table"><thead><tr><th>POS</th><th>CLUBE</th><th class="numeric">P</th><th class="numeric">J</th>${!compact?'<th class="numeric">V</th><th class="numeric">E</th><th class="numeric">D</th><th class="numeric">SG</th>':''}</tr></thead><tbody>${rows.map((r,i)=>{
 const c=career.clubs.find(x=>x.id===r.clubId)!;
 return `<tr class="${r.clubId===career.myClubId?'highlight-row':''}"><td><span class="rank ${r.band}">${compact?i+1:standings(career).findIndex(x=>x.clubId===r.clubId)+1}</span></td><td><div class="name-cell">${crest(c,true)}<span>${esc(c.name)}</span></div></td><td class="numeric points">${r.points}</td><td class="numeric">${r.played}</td>${!compact?`<td class="numeric">${r.wins}</td><td class="numeric">${r.draws}</td><td class="numeric">${r.losses}</td><td class="numeric">${r.gd}</td>`:''}</tr>`;}).join('')}</tbody></table></div>`;
}
function squad():string {
 const c=myClub(),roster=sortedPlayers(c,sortKey).filter(p=>!query||p.name.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))||p.position.toLowerCase().includes(query.toLowerCase()));
 return `${title('Elenco profissional','PLANTEL E DESENVOLVIMENTO',button('navigate-tactics','Organizar escalação','secondary'))}
 <div class="panel"><div class="toolbar"><label class="search-field"><span aria-hidden="true">⌕</span><input id="squad-search" name="search" placeholder="Buscar jogador ou posição" value="${esc(query)}" autocomplete="off" aria-label="Buscar jogador"/></label><label class="filter-label">Ordenar <select id="sort-squad" aria-label="Ordenar elenco"><option value="rating" ${sortKey==='rating'?'selected':''}>Força geral</option><option value="name" ${sortKey==='name'?'selected':''}>Nome</option><option value="age" ${sortKey==='age'?'selected':''}>Idade</option><option value="goals" ${sortKey==='goals'?'selected':''}>Gols</option></select></label></div>
 <div class="table-wrap"><table><thead><tr><th>JOGADOR</th><th>POS</th><th class="numeric">OVR</th><th class="numeric">IDADE</th><th class="numeric">FÍSICO</th><th class="numeric">GOLS</th><th class="numeric">SALÁRIO/MÊS</th><th>STATUS</th></tr></thead>
 <tbody>${roster.map(p=>`<tr class="row-clickable ${p.id===selectedId?'selected-row':''}" data-player="${esc(p.id)}" tabindex="0" role="button" aria-label="Ver ${esc(p.name)}"><td><strong>${esc(p.name)}</strong></td><td>${positionPill(p)}</td><td class="numeric">${rating(p)}</td><td class="numeric">${p.age}</td><td class="numeric">${p.fitness}%</td><td class="numeric">${p.goals}</td><td class="numeric">${money(p.salary)}</td><td><span class="status-pill ${c.startingIds.includes(p.id)?'active':'reserve'}">${c.startingIds.includes(p.id)?'Titular':'Reserva'}</span></td></tr>`).join('')}</tbody></table></div>
 <div class="table-foot">${roster.length} atletas encontrados · Clique em um jogador para inspecionar</div></div>${playerDetail(c)}`;
}
function playerDetail(c:DemoClub):string{
 const p=c.players.find(x=>x.id===selectedId);if(!p)return '';
 return `<section class="panel detail-panel"><div><p class="eyebrow">FICHA DO ATLETA</p><h2>${esc(p.name)}</h2><div class="subtext">${esc(p.position)} · ${p.age} anos · Contrato até ${p.contractUntil}</div></div><div class="detail-stats">${rating(p)}<span>Valor estimado <b>${money(p.price)}</b></span></div></section>`;
}
function formationLineup():string {
 const c=myClub(),starting=c.startingIds.map(id=>c.players.find(p=>p.id===id)!).filter(Boolean);
 const groups:[Position,string][]=[['GOL','Goleiros'],['DEF','Defensores'],['MEI','Meias'],['ATA','Atacantes']];
 const reserves=c.players.filter(p=>!c.startingIds.includes(p.id));
 return `${title('Preparação tática','FORMAÇÃO E TITULARES',button('advance','▶ Avançar rodada'))}
 <div class="two-cols tactical-layout"><section class="panel"><div class="panel-heading"><h2>Formação escolhida</h2><span class="micro-label">ALTERA A FORÇA NA SIMULAÇÃO</span></div>
 <div class="formation-options" role="group" aria-label="Formações">${FORMATIONS.map(f=>`<button type="button" class="formation ${f===c.formation?'on':''}" data-formation="${f}" aria-pressed="${f===c.formation}">${f}</button>`).join('')}</div>
 <div class="football-pitch" aria-label="Disposição ilustrativa dos 11 titulares"><div class="pitch-midline"></div><div class="pitch-circle"></div>
 ${groups.map(([pos],idx)=>`<div class="pitch-row"><span class="pitch-row-label">${esc(pos)}</span>${starting.filter(p=>p.position===pos).slice(0,idx===1?5:idx===2?5:4).map(p=>`<span class="pitch-player" title="${esc(p.name)}">${esc(p.name.split(' ').at(-1)??p.name)}</span>`).join('')}</div>`).join('')}
 </div><p class="help-text">A posição exata no campo é uma representação simplificada. O motor Rust não está ligado a esta demonstração.</p></section>
 <section class="panel"><div class="panel-heading"><h2>Onze titulares</h2><span class="micro-label">ESCALAÇÃO ATUAL</span></div>
 <div class="lineup-list">${starting.map(p=>`<div class="lineup-line"><span class="lineup-no">${p.position}</span><span>${esc(p.name)}</span>${rating(p)}</div>`).join('')}</div>
 <div class="lineup-change"><h3>Substituir titular</h3><div class="two-inputs"><label>Retirar<select id="swap-out">${starting.map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('')}</select></label><label>Colocar<select id="swap-in">${reserves.map(p=>`<option value="${esc(p.id)}">${esc(p.name)} (${p.rating})</option>`).join('')}</select></label></div>${button('swap','Confirmar substituição','secondary')}</div></section></div>`;
}
function calendar():string {
 const c=myClub(),fixtures=career.fixtures.filter(f=>f.home===c.id||f.away===c.id);
 return `${title('Calendário de jogos',`LIGA NACIONAL · ${career.season}`)}<div class="panel"><div class="panel-heading"><h2>Compromissos da temporada</h2><span class="micro-label">${fixtures.filter(f=>f.played).length} / ${fixtures.length} JOGADOS</span></div><div class="fixture-list">${fixtures.map(f=>`<div class="fixture-row ${f.played?'':'upcoming'}"><span class="round-index">R${String(f.round).padStart(2,'0')}</span><span class="fixture-side">${f.home===c.id?'CASA':'FORA'}</span><span class="fixture-vs">${esc(short(f.home))} <strong>${f.played?`${f.homeGoals} : ${f.awayGoals}`:'— : —'}</strong> ${esc(short(f.away))}</span><span class="fixture-state ${f.played?'done':''}">${f.played?`${button('open-replay:'+f.id,'▶ Rever','quiet')}`:'Pendente'}</span></div>`).join('')}</div></div>`;
}
/** M25: replay de gols previamente simulados; marcador temporal é ILUSTRATIVO. */
function replayPage():string {
 const c=myClub(),played=career.fixtures.filter(f=>f.played&&(f.home===c.id||f.away===c.id));
 if(!played.length)return `${title('Replay da partida','CRONOLOGIA ILUSTRATIVA')}<section class="panel">${empty('Avance uma rodada para rever um resultado da carreira fictícia. Nenhuma partida é gerada nesta tela.')}</section>`;
 const current=matchReplay && played.some(f=>f.id===matchReplay!.matchId) ? matchReplay : new DemoMatchReplay(career,played.at(-1)!.id);
 matchReplay=current;
 const f=played.find(x=>x.id===current.matchId)!,frame=current.frame(),finished=frame.finished;
 const history=frame.history.map(e=>`<li><span class="replay-time">${e.half===1?'1º':'2º'} ${e.minute}'</span><strong>⚽ Gol — ${esc(short(e.clubId))}</strong></li>`).join('');
 return `${title('Replay da partida','CAMPANHA · RESULTADOS JÁ DISPUTADOS')}
 <div class="replay-disclaimer" role="note"><strong>Demonstração:</strong> os placares vêm da carreira salva, mas os minutos dos gols são ilustrativos. Não é um replay do motor Rust original.</div>
 <section class="panel replay-panel"><div class="panel-heading"><h2>Partida selecionada</h2><label class="filter-label">Jogo <select id="replay-match" aria-label="Selecionar partida para replay">${played.map(g=>`<option value="${esc(g.id)}" ${g.id===f.id?'selected':''}>Rod. ${g.round} · ${esc(short(g.home))} × ${esc(short(g.away))}</option>`).join('')}</select></label></div>
  <div class="replay-scoreboard"><div><span class="replay-crest">${esc(short(f.home))}</span><strong>${esc(clubName(f.home))}</strong></div><div class="replay-score-center"><div class="replay-live-clock" role="status">${finished?'Fim de jogo':`${frame.half}º tempo · ${frame.minute}'`}</div><div class="replay-score" aria-label="Placar parcial">${frame.homeGoals} <span>:</span> ${frame.awayGoals}</div><small>${finished?'RESULTADO FINAL':'PLACAR EM EXIBIÇÃO'}</small></div><div><span class="replay-crest">${esc(short(f.away))}</span><strong>${esc(clubName(f.away))}</strong></div></div>
  <div class="replay-controls">${button('replay-5','+ 5 minutos','secondary',finished?'disabled':'')}${button('replay-15','+ 15 minutos','secondary',finished?'disabled':'')}${button('replay-end','▶ Até o fim','primary',finished?'disabled':'')}${button('replay-reset','↻ Reiniciar','quiet')}</div>
 </section><section class="panel replay-timeline"><div class="panel-heading"><h2>Eventos exibidos</h2><span class="micro-label">${frame.history.length} GOLS</span></div><ol class="replay-events" aria-live="polite">${history||'<li class="replay-placeholder">Nenhum gol exibido até este minuto.</li>'}</ol></section>`;
}
function standingsPage():string {
 return `${title('Classificação','CAMPEONATO NACIONAL · 1ª DIVISÃO')}<div class="panel"><div class="panel-heading"><h2>Tabela da competição</h2><span class="micro-label">TEMPORADA ${career.season}</span></div>${tableMarkup(standings(career))}
 <div class="legend"><span><i class="legend-dot green"></i> Primeiras posições</span><span><i class="legend-dot red"></i> Zona de risco</span><span>Vitória = 3 pontos</span></div></div>`;
}
function market():string {
 const agents=career.freeAgents.filter(p=>!query||p.name.toLowerCase().includes(query.toLowerCase())||p.position.toLowerCase().includes(query.toLowerCase()));
 return `${title('Mercado de atletas','CONTRATAÇÕES · JOGADORES LIVRES')}<div class="panel"><div class="panel-heading"><h2>Disponíveis no mercado</h2><span class="micro-label">${career.freeAgents.length} ATLETAS</span></div>
 <div class="toolbar"><label class="search-field"><span aria-hidden="true">⌕</span><input id="market-search" placeholder="Pesquisar atleta ou posição" value="${esc(query)}" aria-label="Pesquisar mercado"/></label><span class="balance-label">Caixa atual <strong>${money(myClub().cash)}</strong></span></div>
 <div class="table-wrap"><table><thead><tr><th>JOGADOR</th><th>POS</th><th class="numeric">OVR</th><th class="numeric">IDADE</th><th class="numeric">VALOR</th><th></th></tr></thead><tbody>${agents.map(p=>`<tr><td><strong>${esc(p.name)}</strong></td><td>${positionPill(p)}</td><td class="numeric">${rating(p)}</td><td class="numeric">${p.age}</td><td class="numeric">${money(p.price)}</td><td class="action-cell">${button(`hire:${p.id}`,'Contratar','secondary',myClub().cash<p.price?'disabled aria-label="Saldo insuficiente"':'')}</td></tr>`).join('')}</tbody></table></div><div class="table-foot">Mercado de jogadores livres simulado. Transferências entre clubes não estão implementadas nesta interface.</div></div>`;
}
function finance():string {
 const c=myClub(),salaries=c.players.reduce((a,p)=>a+p.salary,0),transfers=recentDemoDeals(career);
 return `${title('Finanças do clube','GESTÃO ECONÔMICA')}
 <div class="kpis finance-kpis"><div class="kpi"><p>Saldo disponível</p><strong class="money-value">${money(c.cash)}</strong><small>Atualizado a cada rodada</small></div><div class="kpi"><p>Folha salarial</p><strong class="money-value">${money(salaries)}</strong><small>Debitada a cada quatro rodadas</small></div><div class="kpi"><p>Patrimônio do elenco</p><strong class="money-value">${money(c.players.reduce((a,p)=>a+p.price,0))}</strong><small>Valor estimado fictício</small></div></div>
 <div class="two-cols below"><section class="panel"><div class="panel-heading"><h2>Movimentações de mercado</h2><span class="micro-label">TEMPORADA ${career.season}</span></div>
 ${transfers.length?`<div class="activity-list">${transfers.slice(-8).reverse().map(t=>`<div class="finance-line"><span>${esc(t.playerId)}<small>Contratação livre · ${esc(t.date)}</small></span><b class="negative">−${money(t.fee)}</b></div>`).join('')}</div>`:empty('Nenhuma contratação registrada nesta temporada.')}</section>
 <section class="panel"><div class="panel-heading"><h2>Modelo financeiro</h2></div><div class="finance-note"><p>Receita de bilheteria</p><strong>Por partida como mandante</strong><div class="divider"></div><p>Salários de atletas</p><strong>Liquidados a cada 4 rodadas</strong><div class="divider"></div><p>Patrocínio</p><strong>R$ 3,5 milhões no início da temporada</strong><div class="divider"></div><p>Mercado</p><strong>Pagamento imediato na contratação</strong></div><p class="help-text">Este modelo é exclusivo do sandbox M24; não reproduz o Tesouro e as regras completas do FMU.</p></section></div>`;
}
function messages():string{
 return `${title('Central de mensagens','ATIVIDADE DA CARREIRA')}
 <section class="panel"><div class="panel-heading"><h2>Últimas atualizações</h2><span class="micro-label">${career.notices.length} REGISTROS</span></div>
 <ul class="activity-list full">${career.notices.map(n=>`<li><span class="activity-dot"></span><span>${esc(n)}</span></li>`).join('')}</ul></section>`;
}
function page():string{switch(screen){case 'overview':return overview();case 'squad':return squad();case 'tactics':return formationLineup();case 'calendar':return calendar();case 'replay':return replayPage();case 'standings':return standingsPage();case 'market':return market();case 'finances':return finance();case 'messages':return messages();}}
function nav():string {
 let old='';return allScreens.map(s=>{
 const heading=s.group!==old?`<p class="nav-heading">${esc(s.group)}</p>`:'';old=s.group;
 return `${heading}<button type="button" class="nav-link ${s.id===screen?'active':''}" data-nav="${s.id}" ${s.id===screen?'aria-current="page"':''}><span class="nav-icon" aria-hidden="true">${s.symbol}</span>${esc(s.label)}</button>`;
 }).join('');
}
function render():void {
 const c=myClub(),round=Math.min(career.round,roundsInSeason(career));
 root!.innerHTML=`<div class="app-layout"><aside class="sidebar ${menuOpen?'is-open':''}" id="sidebar"><div class="brand"><span class="brand-mark">FMU<span class="brand-dot">.</span></span><span class="brand-caption">FOOTBALL MANAGER<br>UNIVERSE</span></div>
 <div class="side-nav">${nav()}</div><div class="sidebar-footer"><div class="demo-pill"><span class="live-dot"></span> Sandbox M25</div><small>Implementação experimental<br>não equivalente ao motor Rust</small></div></aside>
 ${menuOpen?'<button type="button" class="scrim" data-action="menu" aria-label="Fechar menu"></button>':''}
 <div class="workspace"><header class="topbar"><div class="topbar-start"><button type="button" class="mobile-menu" data-action="menu" aria-label="Abrir menu">☰</button><span class="breadcrumb">CARREIRA <span>/</span> ${esc(allScreens.find(s=>s.id===screen)?.label)}</span></div>
 <div class="top-actions"><span class="top-season">TEMPORADA <b>${career.season}</b> <span>·</span> RODADA <b>${round}/${roundsInSeason(career)}</b></span>
 <label class="club-picker">${crest(c,true)}<select id="club-switch" aria-label="Clube controlado">${career.clubs.map(x=>`<option value="${esc(x.id)}" ${x.id===c.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select></label>
 <button type="button" class="icon-button" data-action="save" title="Exportar carreira JSON" aria-label="Salvar carreira">⇩</button>
 <label class="icon-button import-label" title="Importar carreira JSON" aria-label="Importar carreira">⇧<input type="file" id="load-file" accept=".json,application/json" hidden></label>
 </div></header><main class="page-content" id="main-content">
 <div class="page-banner"><div><span class="banner-dot"></span> AMBIENTE DE DEMONSTRAÇÃO</div><span>Dados fictícios · progresso salvo localmente</span></div>
 ${feedback?`<div class="toast" role="status">${esc(feedback)} <button data-action="dismiss" aria-label="Fechar aviso">×</button></div>`:''}
 ${page()}
 <footer class="footer"><span>FMU / Versão M25 · Carreira demonstrativa</span><div>${button('newgame','Nova carreira','quiet')}${button('save','Exportar JSON','quiet')}</div></footer></main></div></div>`;
}
function persist():void {try {window.localStorage.setItem(SAVE_KEY,serializeDemoCareer(career));}catch{feedback='Não foi possível salvar localmente neste navegador.';}}
function apply(next:DemoCareer,message:string):void {career=next;matchReplay=undefined;feedback=message;selectedId=undefined;persist();render();}
function navigate(id:Screen):void {if(!allScreens.some(s=>s.id===id))return;screen=id;menuOpen=false;query='';selectedId=undefined;feedback='';render();}
function saveFile():void {
 const blob=new Blob([serializeDemoCareer(career)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`fmu-sandbox-${career.season}-${career.round}.json`;document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);
 feedback='Carreira JSON exportada.';render();
}
async function loadFile(input:HTMLInputElement):Promise<void>{
 const file=input.files?.[0];if(!file)return;
 if(file.size>2_000_000){feedback='Arquivo inválido: excede 2 MB.';render();return;}
 try{apply(restoreDemoCareer(await file.text()),'Carreira importada com sucesso.');screen='overview';render();}
 catch(e){feedback='Não foi possível importar: '+(e instanceof Error?e.message:'arquivo inválido');render();}
}
function attempt(action:()=>void):void {try{action();}catch(e){feedback=(e instanceof Error?e.message:'Operação não concluída');render();}}
root.addEventListener('click',e=>{
 const target=e.target;if(!(target instanceof Element))return;
 const navButton=target.closest<HTMLElement>('[data-nav]');if(navButton){navigate(navButton.dataset.nav as Screen);return;}
 const player=target.closest<HTMLElement>('[data-player]');if(player){selectedId=player.dataset.player;render();return;}
 const formation=target.closest<HTMLElement>('[data-formation]');if(formation){attempt(()=>apply(setDemoFormation(career,formation.dataset.formation as Formation),`Formação definida: ${formation.dataset.formation}`));return;}
 const button=target.closest<HTMLElement>('[data-action]');if(!button)return;
 const action=button.dataset.action??'';
 if(action.startsWith('navigate-')){navigate(action.slice(9) as Screen);return;}
 if(action.startsWith('open-replay:')){attempt(()=>{matchReplay=new DemoMatchReplay(career,action.slice(12));navigate('replay');});return;}
 if(action.startsWith('hire:')){attempt(()=>apply(hireDemoFreeAgent(career,action.slice(5)),'Contratação registrada no clube.'));return;}
 switch(action){
  case 'replay-5':attempt(()=>{matchReplay?.advance(5);render();});break;
  case 'replay-15':attempt(()=>{matchReplay?.advance(15);render();});break;
  case 'replay-end':attempt(()=>{matchReplay?.finish();render();});break;
  case 'replay-reset':attempt(()=>{if(matchReplay)matchReplay=new DemoMatchReplay(career,matchReplay.matchId);render();});break;
  case 'advance':attempt(()=>apply(career.round>roundsInSeason(career)?nextDemoSeason(career):advanceDemoRound(career),career.round>roundsInSeason(career)?'Temporada iniciada.':'Rodada concluída.'));break;
  case 'menu':menuOpen=!menuOpen;render();break;
  case 'save':attempt(saveFile);break;
  case 'newgame':if(window.confirm('Criar uma nova carreira fictícia? A carreira local atual será substituída.'))attempt(()=>{apply(createDemoCareer(career.coachName,career.myClubId),'Nova carreira iniciada.');navigate('overview');});break;
  case 'swap':attempt(()=>{const out=(document.getElementById('swap-out') as HTMLSelectElement)?.value,into=(document.getElementById('swap-in') as HTMLSelectElement)?.value;apply(swapDemoStarter(career,out,into),'Titulares atualizados.');});break;
  case 'dismiss':feedback='';render();break;
 }
});
root.addEventListener('keydown',e=>{
 const target=e.target;if(!(target instanceof Element))return;
 if((e.key==='Enter'||e.key===' ')&&target.closest('[data-player]')){e.preventDefault();selectedId=(target.closest<HTMLElement>('[data-player]'))?.dataset.player;render();}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menuOpen){menuOpen=false;render();}});
root.addEventListener('change',e=>{
 const target=e.target;if(!(target instanceof Element))return;
 if(target.id==='replay-match'){attempt(()=>{matchReplay=new DemoMatchReplay(career,(target as HTMLSelectElement).value);render();});return;}
 if(target.id==='club-switch')attempt(()=>{apply(switchDemoClub(career,(target as HTMLSelectElement).value),'Clube controlado alterado.');});
 if(target.id==='sort-squad'){sortKey=(target as HTMLSelectElement).value as typeof sortKey;render();}
 if(target.id==='load-file')void loadFile(target as HTMLInputElement);
 if(target.id==='squad-search'||target.id==='market-search'){query=(target as HTMLInputElement).value;render();}
});
function boot():void {
 let saved:string|null=null;try{saved=window.localStorage.getItem(SAVE_KEY);}catch{/* Storage denied in file/embedded contexts. */}
 try{career=saved?restoreDemoCareer(saved):createDemoCareer();}
 catch{career=createDemoCareer();feedback='Save anterior incompatível; iniciada carreira fictícia nova.';}
 render();
}
boot();
