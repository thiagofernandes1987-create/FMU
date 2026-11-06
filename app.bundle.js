"use strict";
(()=>{const modules={
"src/m23/app/home.js":function(module,exports,__require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HOME_ASCENDING_COLUMNS = void 0;
exports.homeDefaultDescending = homeDefaultDescending;
exports.sortedHomeSquad = sortedHomeSquad;
/** Rust crates/app/src/screens/home.rs: default column sort direction and squad listing.
 * Value extraction is supplied from the game world (do not infer hidden player data). */
exports.HOME_ASCENDING_COLUMNS = ['squad-column-name', 'squad-column-position', 'squad-column-side', 'squad-column-traits', 'squad-column-age'];
function homeDefaultDescending(key) { return !exports.HOME_ASCENDING_COLUMNS.includes(key); }
function sortedHomeSquad(players, key, getValue, descending = homeDefaultDescending(key)) {
    const direction = descending ? -1 : 1;
    return [...players].sort((a, b) => { const x = getValue(a, key), y = getValue(b, key); return direction * (typeof x === 'string' && typeof y === 'string' ? x.localeCompare(y, 'pt-BR') : Number(x) - Number(y)); });
}

},
"src/m23/app/market.js":function(module,exports,__require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seasonDeals = seasonDeals;
function seasonDeals(transfers, economyYear) {
    return transfers.filter(t => t.fee > 0 && t.year === economyYear).map(t => ({ playerId: t.playerId, fromId: t.fromId, toId: t.toId, fee: t.fee, date: `${t.day}/${t.month}/${t.year}` })).sort((a, b) => b.fee - a.fee);
}

},
"src/m23/app/standings.js":function(module,exports,__require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.standingsBand = standingsBand;
function standingsBand(index, count, promoted, relegated) {
    if (index < 0 || count < 0 || promoted < 0 || relegated < 0)
        throw new RangeError('Invalid standings band');
    if (index < promoted)
        return 'promotion';
    if (relegated > 0 && index >= Math.max(0, count - relegated))
        return 'relegation';
    return 'neutral';
}

},
"src/m24/web/browser.js":function(module,exports,__require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * FMU M24 — front-end DOM responsivo sobre a carreira sandbox.
 * Origem funcional: crates/app/src/main.rs, screens/mod.rs e seletores M23.
 * Ao contrário dos view-models M23, renderiza e opera as telas no navegador.
 * Dependências: career_demo.ts, helpers M23 e DOM local; nenhum servidor.
 * Efeitos: DOM, localStorage e downloads JSON mediante interação explícita.
 * NÃO converte o renderizador egui nem abre `.bfn` do jogo original.
 */
const career_demo_1 = __require("src/m24/web/career_demo.js");
const demo_replay_1 = __require("src/m25/web/demo_replay.js");
const SAVE_KEY = 'fmu-m24-demo-save-v1';
let career;
let screen = 'overview', menuOpen = false, query = '', sortKey = 'rating', selectedId;
let sourceId, feedback = '';
/** Estado efêmero: replay não altera nem entra no JSON da carreira. */
let matchReplay;
const root = document.getElementById('app');
if (!root)
    throw Error('Missing app root');
const allScreens = [
    { id: 'overview', label: 'Visão geral', symbol: '◫', group: 'CARREIRA' },
    { id: 'squad', label: 'Elenco', symbol: '♟', group: 'GESTÃO ESPORTIVA' },
    { id: 'tactics', label: 'Táticas', symbol: '◇', group: 'GESTÃO ESPORTIVA' },
    { id: 'calendar', label: 'Calendário', symbol: '▦', group: 'GESTÃO ESPORTIVA' },
    { id: 'replay', label: 'Replay da rodada', symbol: '▶', group: 'GESTÃO ESPORTIVA' },
    { id: 'standings', label: 'Classificação', symbol: '▥', group: 'COMPETIÇÕES' },
    { id: 'market', label: 'Mercado', symbol: '⇄', group: 'CLUBE' },
    { id: 'finances', label: 'Finanças', symbol: '◈', group: 'CLUBE' },
    { id: 'messages', label: 'Central de mensagens', symbol: '✉', group: 'CLUBE' }
];
function esc(v) { return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function myClub() { return career.clubs.find(c => c.id === career.myClubId); }
function short(id) { return career.clubs.find(c => c.id === id)?.short ?? id; }
function clubName(id) { return career.clubs.find(c => c.id === id)?.name ?? id; }
function initials(c) { return c.short.slice(0, 3); }
function crest(c, small = false) { return `<span class="crest${small ? ' crest-sm' : ''}" style="--club-color:${esc(c.color)}" aria-label="Escudo fictício ${esc(c.name)}">${esc(initials(c))}</span>`; }
function money(n) { return (0, career_demo_1.formatMoney)(n); }
function title(h, sub, action = '') { return `<div class="section-header"><div><p class="eyebrow">${esc(sub)}</p><h1>${esc(h)}</h1></div>${action}</div>`; }
function empty(text) { return `<div class="empty"><span aria-hidden="true">◇</span><p>${esc(text)}</p></div>`; }
function getStats() { return (0, career_demo_1.standings)(career).find(r => r.clubId === career.myClubId); }
function future() { return career.fixtures.find(f => !f.played && (f.home === career.myClubId || f.away === career.myClubId)); }
function recent() { return [...career.fixtures].reverse().find(f => f.played && (f.home === career.myClubId || f.away === career.myClubId)); }
function posName(p) { return p.position; }
function positionPill(p) { return `<span class="pos pos-${p.position}">${esc(p.position)}</span>`; }
function rating(p) { return `<span class="rating${p.rating >= 75 ? ' rating-good' : ''}">${p.rating}</span>`; }
function decorateClub(id) { const c = career.clubs.find(x => x.id === id); return c ? `${crest(c, true)}<span>${esc(c.name)}</span>` : esc(id); }
function scoreboard(f, compact = false) {
    const played = f.played;
    return `<div class="scoreboard${compact ? ' compact' : ''}">
  <div class="team-name">${decorateClub(f.home)}</div>
  <div class="match-score">${played ? `${f.homeGoals} <span>:</span> ${f.awayGoals}` : '<span>VS</span>'}</div>
  <div class="team-name team-right">${decorateClub(f.away)}</div>
 </div>`;
}
function button(action, label, variant = 'primary', extra = '') { return `<button type="button" class="btn ${variant}" data-action="${esc(action)}" ${extra}>${label}</button>`; }
function overview() {
    const c = myClub(), stats = getStats(), ranking = (0, career_demo_1.standings)(career), place = ranking.findIndex(x => x.clubId === c.id) + 1;
    const next = future(), last = recent();
    const news = career.notices.slice(0, 4).map(n => `<li><span class="activity-dot"></span><span>${esc(n)}</span></li>`).join('');
    return `${title('Painel do clube', `Temporada ${career.season} · ${esc(c.name)}`, button('advance', career.round <= (0, career_demo_1.roundsInSeason)(career) ? '▶ Avançar rodada' : '↻ Nova temporada'))}
  <div class="kpis"><div class="kpi"><p>Posição na liga</p><strong>${place}<span class="muted">º / ${ranking.length}</span></strong><small>${stats.points} pontos em ${stats.played} jogos</small></div>
  <div class="kpi"><p>Saldo do clube</p><strong class="money-value">${money(c.cash)}</strong><small>Disponível para gestão</small></div>
  <div class="kpi"><p>Campanha</p><strong>${stats.wins} <span class="muted">V</span> <span class="negative">${stats.losses} D</span></strong><small>${stats.draws} empates · Saldo ${stats.gd >= 0 ? '+' : ''}${stats.gd}</small></div>
  <div class="kpi"><p>Força do elenco</p><strong>${Math.round(c.players.reduce((a, p) => a + p.rating, 0) / c.players.length)} <span class="muted">OVR</span></strong><small>${c.players.length} atletas · ${esc(c.formation)}</small></div></div>
  <div class="two-cols"><section class="panel next-match"><div class="panel-heading"><h2>Próximo compromisso</h2><span class="micro-label">${next ? `RODADA ${next.round}` : 'TEMPORADA ENCERRADA'}</span></div>
    ${next ? `<div class="match-context">LIGA NACIONAL · ${next.home === c.id ? 'EM CASA' : 'FORA DE CASA'}</div>${scoreboard(next)}<div class="match-footer"><span>Preparação: ${esc(c.formation)}</span>${button('navigate-tactics', 'Ajustar tática', 'secondary')}</div>` : empty('Todas as rodadas foram disputadas. Inicie uma nova temporada.')}
  </section>
  <section class="panel"><div class="panel-heading"><h2>Último resultado</h2>${last ? `<span class="micro-label">RODADA ${last.round}</span>` : ''}</div>
   ${last ? `${scoreboard(last)}<div class="match-footer"><span>${last.home === c.id ? 'Seu clube jogou em casa' : 'Seu clube jogou fora'}</span>${button('navigate-calendar', 'Ver calendário', 'secondary')}</div>` : empty('Os jogos da temporada ainda não começaram.')}
  </section></div>
  <div class="two-cols below"><section class="panel"><div class="panel-heading"><h2>Classificação</h2>${button('navigate-standings', 'Tabela completa', 'quiet')}</div>${tableMarkup((0, career_demo_1.standings)(career).slice(0, 5), true)}</section>
  <section class="panel"><div class="panel-heading"><h2>Notícias do clube</h2>${button('navigate-messages', 'Ver todas', 'quiet')}</div><ul class="activity-list">${news}</ul></section></div>`;
}
function tableMarkup(rows, compact = false) {
    return `<div class="table-wrap"><table class="league-table"><thead><tr><th>POS</th><th>CLUBE</th><th class="numeric">P</th><th class="numeric">J</th>${!compact ? '<th class="numeric">V</th><th class="numeric">E</th><th class="numeric">D</th><th class="numeric">SG</th>' : ''}</tr></thead><tbody>${rows.map((r, i) => {
        const c = career.clubs.find(x => x.id === r.clubId);
        return `<tr class="${r.clubId === career.myClubId ? 'highlight-row' : ''}"><td><span class="rank ${r.band}">${compact ? i + 1 : (0, career_demo_1.standings)(career).findIndex(x => x.clubId === r.clubId) + 1}</span></td><td><div class="name-cell">${crest(c, true)}<span>${esc(c.name)}</span></div></td><td class="numeric points">${r.points}</td><td class="numeric">${r.played}</td>${!compact ? `<td class="numeric">${r.wins}</td><td class="numeric">${r.draws}</td><td class="numeric">${r.losses}</td><td class="numeric">${r.gd}</td>` : ''}</tr>`;
    }).join('')}</tbody></table></div>`;
}
function squad() {
    const c = myClub(), roster = (0, career_demo_1.sortedPlayers)(c, sortKey).filter(p => !query || p.name.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')) || p.position.toLowerCase().includes(query.toLowerCase()));
    return `${title('Elenco profissional', 'PLANTEL E DESENVOLVIMENTO', button('navigate-tactics', 'Organizar escalação', 'secondary'))}
 <div class="panel"><div class="toolbar"><label class="search-field"><span aria-hidden="true">⌕</span><input id="squad-search" name="search" placeholder="Buscar jogador ou posição" value="${esc(query)}" autocomplete="off" aria-label="Buscar jogador"/></label><label class="filter-label">Ordenar <select id="sort-squad" aria-label="Ordenar elenco"><option value="rating" ${sortKey === 'rating' ? 'selected' : ''}>Força geral</option><option value="name" ${sortKey === 'name' ? 'selected' : ''}>Nome</option><option value="age" ${sortKey === 'age' ? 'selected' : ''}>Idade</option><option value="goals" ${sortKey === 'goals' ? 'selected' : ''}>Gols</option></select></label></div>
 <div class="table-wrap"><table><thead><tr><th>JOGADOR</th><th>POS</th><th class="numeric">OVR</th><th class="numeric">IDADE</th><th class="numeric">FÍSICO</th><th class="numeric">GOLS</th><th class="numeric">SALÁRIO/MÊS</th><th>STATUS</th></tr></thead>
 <tbody>${roster.map(p => `<tr class="row-clickable ${p.id === selectedId ? 'selected-row' : ''}" data-player="${esc(p.id)}" tabindex="0" role="button" aria-label="Ver ${esc(p.name)}"><td><strong>${esc(p.name)}</strong></td><td>${positionPill(p)}</td><td class="numeric">${rating(p)}</td><td class="numeric">${p.age}</td><td class="numeric">${p.fitness}%</td><td class="numeric">${p.goals}</td><td class="numeric">${money(p.salary)}</td><td><span class="status-pill ${c.startingIds.includes(p.id) ? 'active' : 'reserve'}">${c.startingIds.includes(p.id) ? 'Titular' : 'Reserva'}</span></td></tr>`).join('')}</tbody></table></div>
 <div class="table-foot">${roster.length} atletas encontrados · Clique em um jogador para inspecionar</div></div>${playerDetail(c)}`;
}
function playerDetail(c) {
    const p = c.players.find(x => x.id === selectedId);
    if (!p)
        return '';
    return `<section class="panel detail-panel"><div><p class="eyebrow">FICHA DO ATLETA</p><h2>${esc(p.name)}</h2><div class="subtext">${esc(p.position)} · ${p.age} anos · Contrato até ${p.contractUntil}</div></div><div class="detail-stats">${rating(p)}<span>Valor estimado <b>${money(p.price)}</b></span></div></section>`;
}
function formationLineup() {
    const c = myClub(), starting = c.startingIds.map(id => c.players.find(p => p.id === id)).filter(Boolean);
    const groups = [['GOL', 'Goleiros'], ['DEF', 'Defensores'], ['MEI', 'Meias'], ['ATA', 'Atacantes']];
    const reserves = c.players.filter(p => !c.startingIds.includes(p.id));
    return `${title('Preparação tática', 'FORMAÇÃO E TITULARES', button('advance', '▶ Avançar rodada'))}
 <div class="two-cols tactical-layout"><section class="panel"><div class="panel-heading"><h2>Formação escolhida</h2><span class="micro-label">ALTERA A FORÇA NA SIMULAÇÃO</span></div>
 <div class="formation-options" role="group" aria-label="Formações">${career_demo_1.FORMATIONS.map(f => `<button type="button" class="formation ${f === c.formation ? 'on' : ''}" data-formation="${f}" aria-pressed="${f === c.formation}">${f}</button>`).join('')}</div>
 <div class="football-pitch" aria-label="Disposição ilustrativa dos 11 titulares"><div class="pitch-midline"></div><div class="pitch-circle"></div>
 ${groups.map(([pos], idx) => `<div class="pitch-row"><span class="pitch-row-label">${esc(pos)}</span>${starting.filter(p => p.position === pos).slice(0, idx === 1 ? 5 : idx === 2 ? 5 : 4).map(p => `<span class="pitch-player" title="${esc(p.name)}">${esc(p.name.split(' ').at(-1) ?? p.name)}</span>`).join('')}</div>`).join('')}
 </div><p class="help-text">A posição exata no campo é uma representação simplificada. O motor Rust não está ligado a esta demonstração.</p></section>
 <section class="panel"><div class="panel-heading"><h2>Onze titulares</h2><span class="micro-label">ESCALAÇÃO ATUAL</span></div>
 <div class="lineup-list">${starting.map(p => `<div class="lineup-line"><span class="lineup-no">${p.position}</span><span>${esc(p.name)}</span>${rating(p)}</div>`).join('')}</div>
 <div class="lineup-change"><h3>Substituir titular</h3><div class="two-inputs"><label>Retirar<select id="swap-out">${starting.map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('')}</select></label><label>Colocar<select id="swap-in">${reserves.map(p => `<option value="${esc(p.id)}">${esc(p.name)} (${p.rating})</option>`).join('')}</select></label></div>${button('swap', 'Confirmar substituição', 'secondary')}</div></section></div>`;
}
function calendar() {
    const c = myClub(), fixtures = career.fixtures.filter(f => f.home === c.id || f.away === c.id);
    return `${title('Calendário de jogos', `LIGA NACIONAL · ${career.season}`)}<div class="panel"><div class="panel-heading"><h2>Compromissos da temporada</h2><span class="micro-label">${fixtures.filter(f => f.played).length} / ${fixtures.length} JOGADOS</span></div><div class="fixture-list">${fixtures.map(f => `<div class="fixture-row ${f.played ? '' : 'upcoming'}"><span class="round-index">R${String(f.round).padStart(2, '0')}</span><span class="fixture-side">${f.home === c.id ? 'CASA' : 'FORA'}</span><span class="fixture-vs">${esc(short(f.home))} <strong>${f.played ? `${f.homeGoals} : ${f.awayGoals}` : '— : —'}</strong> ${esc(short(f.away))}</span><span class="fixture-state ${f.played ? 'done' : ''}">${f.played ? `${button('open-replay:' + f.id, '▶ Rever', 'quiet')}` : 'Pendente'}</span></div>`).join('')}</div></div>`;
}
/** M25: replay de gols previamente simulados; marcador temporal é ILUSTRATIVO. */
function replayPage() {
    const c = myClub(), played = career.fixtures.filter(f => f.played && (f.home === c.id || f.away === c.id));
    if (!played.length)
        return `${title('Replay da partida', 'CRONOLOGIA ILUSTRATIVA')}<section class="panel">${empty('Avance uma rodada para rever um resultado da carreira fictícia. Nenhuma partida é gerada nesta tela.')}</section>`;
    const current = matchReplay && played.some(f => f.id === matchReplay.matchId) ? matchReplay : new demo_replay_1.DemoMatchReplay(career, played.at(-1).id);
    matchReplay = current;
    const f = played.find(x => x.id === current.matchId), frame = current.frame(), finished = frame.finished;
    const history = frame.history.map(e => `<li><span class="replay-time">${e.half === 1 ? '1º' : '2º'} ${e.minute}'</span><strong>⚽ Gol — ${esc(short(e.clubId))}</strong></li>`).join('');
    return `${title('Replay da partida', 'CAMPANHA · RESULTADOS JÁ DISPUTADOS')}
 <div class="replay-disclaimer" role="note"><strong>Demonstração:</strong> os placares vêm da carreira salva, mas os minutos dos gols são ilustrativos. Não é um replay do motor Rust original.</div>
 <section class="panel replay-panel"><div class="panel-heading"><h2>Partida selecionada</h2><label class="filter-label">Jogo <select id="replay-match" aria-label="Selecionar partida para replay">${played.map(g => `<option value="${esc(g.id)}" ${g.id === f.id ? 'selected' : ''}>Rod. ${g.round} · ${esc(short(g.home))} × ${esc(short(g.away))}</option>`).join('')}</select></label></div>
  <div class="replay-scoreboard"><div><span class="replay-crest">${esc(short(f.home))}</span><strong>${esc(clubName(f.home))}</strong></div><div class="replay-score-center"><div class="replay-live-clock" role="status">${finished ? 'Fim de jogo' : `${frame.half}º tempo · ${frame.minute}'`}</div><div class="replay-score" aria-label="Placar parcial">${frame.homeGoals} <span>:</span> ${frame.awayGoals}</div><small>${finished ? 'RESULTADO FINAL' : 'PLACAR EM EXIBIÇÃO'}</small></div><div><span class="replay-crest">${esc(short(f.away))}</span><strong>${esc(clubName(f.away))}</strong></div></div>
  <div class="replay-controls">${button('replay-5', '+ 5 minutos', 'secondary', finished ? 'disabled' : '')}${button('replay-15', '+ 15 minutos', 'secondary', finished ? 'disabled' : '')}${button('replay-end', '▶ Até o fim', 'primary', finished ? 'disabled' : '')}${button('replay-reset', '↻ Reiniciar', 'quiet')}</div>
 </section><section class="panel replay-timeline"><div class="panel-heading"><h2>Eventos exibidos</h2><span class="micro-label">${frame.history.length} GOLS</span></div><ol class="replay-events" aria-live="polite">${history || '<li class="replay-placeholder">Nenhum gol exibido até este minuto.</li>'}</ol></section>`;
}
function standingsPage() {
    return `${title('Classificação', 'CAMPEONATO NACIONAL · 1ª DIVISÃO')}<div class="panel"><div class="panel-heading"><h2>Tabela da competição</h2><span class="micro-label">TEMPORADA ${career.season}</span></div>${tableMarkup((0, career_demo_1.standings)(career))}
 <div class="legend"><span><i class="legend-dot green"></i> Primeiras posições</span><span><i class="legend-dot red"></i> Zona de risco</span><span>Vitória = 3 pontos</span></div></div>`;
}
function market() {
    const agents = career.freeAgents.filter(p => !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.position.toLowerCase().includes(query.toLowerCase()));
    return `${title('Mercado de atletas', 'CONTRATAÇÕES · JOGADORES LIVRES')}<div class="panel"><div class="panel-heading"><h2>Disponíveis no mercado</h2><span class="micro-label">${career.freeAgents.length} ATLETAS</span></div>
 <div class="toolbar"><label class="search-field"><span aria-hidden="true">⌕</span><input id="market-search" placeholder="Pesquisar atleta ou posição" value="${esc(query)}" aria-label="Pesquisar mercado"/></label><span class="balance-label">Caixa atual <strong>${money(myClub().cash)}</strong></span></div>
 <div class="table-wrap"><table><thead><tr><th>JOGADOR</th><th>POS</th><th class="numeric">OVR</th><th class="numeric">IDADE</th><th class="numeric">VALOR</th><th></th></tr></thead><tbody>${agents.map(p => `<tr><td><strong>${esc(p.name)}</strong></td><td>${positionPill(p)}</td><td class="numeric">${rating(p)}</td><td class="numeric">${p.age}</td><td class="numeric">${money(p.price)}</td><td class="action-cell">${button(`hire:${p.id}`, 'Contratar', 'secondary', myClub().cash < p.price ? 'disabled aria-label="Saldo insuficiente"' : '')}</td></tr>`).join('')}</tbody></table></div><div class="table-foot">Mercado de jogadores livres simulado. Transferências entre clubes não estão implementadas nesta interface.</div></div>`;
}
function finance() {
    const c = myClub(), salaries = c.players.reduce((a, p) => a + p.salary, 0), transfers = (0, career_demo_1.recentDemoDeals)(career);
    return `${title('Finanças do clube', 'GESTÃO ECONÔMICA')}
 <div class="kpis finance-kpis"><div class="kpi"><p>Saldo disponível</p><strong class="money-value">${money(c.cash)}</strong><small>Atualizado a cada rodada</small></div><div class="kpi"><p>Folha salarial</p><strong class="money-value">${money(salaries)}</strong><small>Debitada a cada quatro rodadas</small></div><div class="kpi"><p>Patrimônio do elenco</p><strong class="money-value">${money(c.players.reduce((a, p) => a + p.price, 0))}</strong><small>Valor estimado fictício</small></div></div>
 <div class="two-cols below"><section class="panel"><div class="panel-heading"><h2>Movimentações de mercado</h2><span class="micro-label">TEMPORADA ${career.season}</span></div>
 ${transfers.length ? `<div class="activity-list">${transfers.slice(-8).reverse().map(t => `<div class="finance-line"><span>${esc(t.playerId)}<small>Contratação livre · ${esc(t.date)}</small></span><b class="negative">−${money(t.fee)}</b></div>`).join('')}</div>` : empty('Nenhuma contratação registrada nesta temporada.')}</section>
 <section class="panel"><div class="panel-heading"><h2>Modelo financeiro</h2></div><div class="finance-note"><p>Receita de bilheteria</p><strong>Por partida como mandante</strong><div class="divider"></div><p>Salários de atletas</p><strong>Liquidados a cada 4 rodadas</strong><div class="divider"></div><p>Patrocínio</p><strong>R$ 3,5 milhões no início da temporada</strong><div class="divider"></div><p>Mercado</p><strong>Pagamento imediato na contratação</strong></div><p class="help-text">Este modelo é exclusivo do sandbox M24; não reproduz o Tesouro e as regras completas do FMU.</p></section></div>`;
}
function messages() {
    return `${title('Central de mensagens', 'ATIVIDADE DA CARREIRA')}
 <section class="panel"><div class="panel-heading"><h2>Últimas atualizações</h2><span class="micro-label">${career.notices.length} REGISTROS</span></div>
 <ul class="activity-list full">${career.notices.map(n => `<li><span class="activity-dot"></span><span>${esc(n)}</span></li>`).join('')}</ul></section>`;
}
function page() { switch (screen) {
    case 'overview': return overview();
    case 'squad': return squad();
    case 'tactics': return formationLineup();
    case 'calendar': return calendar();
    case 'replay': return replayPage();
    case 'standings': return standingsPage();
    case 'market': return market();
    case 'finances': return finance();
    case 'messages': return messages();
} }
function nav() {
    let old = '';
    return allScreens.map(s => {
        const heading = s.group !== old ? `<p class="nav-heading">${esc(s.group)}</p>` : '';
        old = s.group;
        return `${heading}<button type="button" class="nav-link ${s.id === screen ? 'active' : ''}" data-nav="${s.id}" ${s.id === screen ? 'aria-current="page"' : ''}><span class="nav-icon" aria-hidden="true">${s.symbol}</span>${esc(s.label)}</button>`;
    }).join('');
}
function render() {
    const c = myClub(), round = Math.min(career.round, (0, career_demo_1.roundsInSeason)(career));
    root.innerHTML = `<div class="app-layout"><aside class="sidebar ${menuOpen ? 'is-open' : ''}" id="sidebar"><div class="brand"><span class="brand-mark">FMU<span class="brand-dot">.</span></span><span class="brand-caption">FOOTBALL MANAGER<br>UNIVERSE</span></div>
 <div class="side-nav">${nav()}</div><div class="sidebar-footer"><div class="demo-pill"><span class="live-dot"></span> Sandbox M25</div><small>Implementação experimental<br>não equivalente ao motor Rust</small></div></aside>
 ${menuOpen ? '<button type="button" class="scrim" data-action="menu" aria-label="Fechar menu"></button>' : ''}
 <div class="workspace"><header class="topbar"><div class="topbar-start"><button type="button" class="mobile-menu" data-action="menu" aria-label="Abrir menu">☰</button><span class="breadcrumb">CARREIRA <span>/</span> ${esc(allScreens.find(s => s.id === screen)?.label)}</span></div>
 <div class="top-actions"><span class="top-season">TEMPORADA <b>${career.season}</b> <span>·</span> RODADA <b>${round}/${(0, career_demo_1.roundsInSeason)(career)}</b></span>
 <label class="club-picker">${crest(c, true)}<select id="club-switch" aria-label="Clube controlado">${career.clubs.map(x => `<option value="${esc(x.id)}" ${x.id === c.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>
 <button type="button" class="icon-button" data-action="save" title="Exportar carreira JSON" aria-label="Salvar carreira">⇩</button>
 <label class="icon-button import-label" title="Importar carreira JSON" aria-label="Importar carreira">⇧<input type="file" id="load-file" accept=".json,application/json" hidden></label>
 </div></header><main class="page-content" id="main-content">
 <div class="page-banner"><div><span class="banner-dot"></span> AMBIENTE DE DEMONSTRAÇÃO</div><span>Dados fictícios · progresso salvo localmente</span></div>
 ${feedback ? `<div class="toast" role="status">${esc(feedback)} <button data-action="dismiss" aria-label="Fechar aviso">×</button></div>` : ''}
 ${page()}
 <footer class="footer"><span>FMU / Versão M25 · Carreira demonstrativa</span><div>${button('newgame', 'Nova carreira', 'quiet')}${button('save', 'Exportar JSON', 'quiet')}</div></footer></main></div></div>`;
}
function persist() { try {
    window.localStorage.setItem(SAVE_KEY, (0, career_demo_1.serializeDemoCareer)(career));
}
catch {
    feedback = 'Não foi possível salvar localmente neste navegador.';
} }
function apply(next, message) { career = next; matchReplay = undefined; feedback = message; selectedId = undefined; persist(); render(); }
function navigate(id) { if (!allScreens.some(s => s.id === id))
    return; screen = id; menuOpen = false; query = ''; selectedId = undefined; feedback = ''; render(); }
function saveFile() {
    const blob = new Blob([(0, career_demo_1.serializeDemoCareer)(career)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url;
    a.download = `fmu-sandbox-${career.season}-${career.round}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    feedback = 'Carreira JSON exportada.';
    render();
}
async function loadFile(input) {
    const file = input.files?.[0];
    if (!file)
        return;
    if (file.size > 2_000_000) {
        feedback = 'Arquivo inválido: excede 2 MB.';
        render();
        return;
    }
    try {
        apply((0, career_demo_1.restoreDemoCareer)(await file.text()), 'Carreira importada com sucesso.');
        screen = 'overview';
        render();
    }
    catch (e) {
        feedback = 'Não foi possível importar: ' + (e instanceof Error ? e.message : 'arquivo inválido');
        render();
    }
}
function attempt(action) { try {
    action();
}
catch (e) {
    feedback = (e instanceof Error ? e.message : 'Operação não concluída');
    render();
} }
root.addEventListener('click', e => {
    const target = e.target;
    if (!(target instanceof Element))
        return;
    const navButton = target.closest('[data-nav]');
    if (navButton) {
        navigate(navButton.dataset.nav);
        return;
    }
    const player = target.closest('[data-player]');
    if (player) {
        selectedId = player.dataset.player;
        render();
        return;
    }
    const formation = target.closest('[data-formation]');
    if (formation) {
        attempt(() => apply((0, career_demo_1.setDemoFormation)(career, formation.dataset.formation), `Formação definida: ${formation.dataset.formation}`));
        return;
    }
    const button = target.closest('[data-action]');
    if (!button)
        return;
    const action = button.dataset.action ?? '';
    if (action.startsWith('navigate-')) {
        navigate(action.slice(9));
        return;
    }
    if (action.startsWith('open-replay:')) {
        attempt(() => { matchReplay = new demo_replay_1.DemoMatchReplay(career, action.slice(12)); navigate('replay'); });
        return;
    }
    if (action.startsWith('hire:')) {
        attempt(() => apply((0, career_demo_1.hireDemoFreeAgent)(career, action.slice(5)), 'Contratação registrada no clube.'));
        return;
    }
    switch (action) {
        case 'replay-5':
            attempt(() => { matchReplay?.advance(5); render(); });
            break;
        case 'replay-15':
            attempt(() => { matchReplay?.advance(15); render(); });
            break;
        case 'replay-end':
            attempt(() => { matchReplay?.finish(); render(); });
            break;
        case 'replay-reset':
            attempt(() => { if (matchReplay)
                matchReplay = new demo_replay_1.DemoMatchReplay(career, matchReplay.matchId); render(); });
            break;
        case 'advance':
            attempt(() => apply(career.round > (0, career_demo_1.roundsInSeason)(career) ? (0, career_demo_1.nextDemoSeason)(career) : (0, career_demo_1.advanceDemoRound)(career), career.round > (0, career_demo_1.roundsInSeason)(career) ? 'Temporada iniciada.' : 'Rodada concluída.'));
            break;
        case 'menu':
            menuOpen = !menuOpen;
            render();
            break;
        case 'save':
            attempt(saveFile);
            break;
        case 'newgame':
            if (window.confirm('Criar uma nova carreira fictícia? A carreira local atual será substituída.'))
                attempt(() => { apply((0, career_demo_1.createDemoCareer)(career.coachName, career.myClubId), 'Nova carreira iniciada.'); navigate('overview'); });
            break;
        case 'swap':
            attempt(() => { const out = document.getElementById('swap-out')?.value, into = document.getElementById('swap-in')?.value; apply((0, career_demo_1.swapDemoStarter)(career, out, into), 'Titulares atualizados.'); });
            break;
        case 'dismiss':
            feedback = '';
            render();
            break;
    }
});
root.addEventListener('keydown', e => {
    const target = e.target;
    if (!(target instanceof Element))
        return;
    if ((e.key === 'Enter' || e.key === ' ') && target.closest('[data-player]')) {
        e.preventDefault();
        selectedId = (target.closest('[data-player]'))?.dataset.player;
        render();
    }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && menuOpen) {
    menuOpen = false;
    render();
} });
root.addEventListener('change', e => {
    const target = e.target;
    if (!(target instanceof Element))
        return;
    if (target.id === 'replay-match') {
        attempt(() => { matchReplay = new demo_replay_1.DemoMatchReplay(career, target.value); render(); });
        return;
    }
    if (target.id === 'club-switch')
        attempt(() => { apply((0, career_demo_1.switchDemoClub)(career, target.value), 'Clube controlado alterado.'); });
    if (target.id === 'sort-squad') {
        sortKey = target.value;
        render();
    }
    if (target.id === 'load-file')
        void loadFile(target);
    if (target.id === 'squad-search' || target.id === 'market-search') {
        query = target.value;
        render();
    }
});
function boot() {
    let saved = null;
    try {
        saved = window.localStorage.getItem(SAVE_KEY);
    }
    catch { /* Storage denied in file/embedded contexts. */ }
    try {
        career = saved ? (0, career_demo_1.restoreDemoCareer)(saved) : (0, career_demo_1.createDemoCareer)();
    }
    catch {
        career = (0, career_demo_1.createDemoCareer)();
        feedback = 'Save anterior incompatível; iniciada carreira fictícia nova.';
    }
    render();
}
boot();

},
"src/m24/web/career_demo.js":function(module,exports,__require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORMATIONS = void 0;
exports.createFixtures = createFixtures;
exports.createDemoCareer = createDemoCareer;
exports.roundsInSeason = roundsInSeason;
exports.standings = standings;
exports.playerIsStarter = playerIsStarter;
exports.sortedPlayers = sortedPlayers;
exports.advanceDemoRound = advanceDemoRound;
exports.nextDemoSeason = nextDemoSeason;
exports.setDemoFormation = setDemoFormation;
exports.swapDemoStarter = swapDemoStarter;
exports.hireDemoFreeAgent = hireDemoFreeAgent;
exports.recentDemoDeals = recentDemoDeals;
exports.switchDemoClub = switchDemoClub;
exports.formatMoney = formatMoney;
exports.validateDemoCareer = validateDemoCareer;
exports.serializeDemoCareer = serializeDemoCareer;
exports.restoreDemoCareer = restoreDemoCareer;
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
const home_1 = __require("src/m23/app/home.js");
const standings_1 = __require("src/m23/app/standings.js");
const market_1 = __require("src/m23/app/market.js");
exports.FORMATIONS = ['4-3-3', '4-4-2', '3-5-2'];
const CLUBS = [
    ['Aurora Futebol Clube', 'AUR', '#dca353'], ['União do Vale', 'UVA', '#69b7b6'], ['Estrela do Norte', 'ENO', '#9eabec'],
    ['Serra Azul', 'SAZ', '#92b777'], ['Ferroviário Central', 'FEC', '#d58085'], ['Atlético Litoral', 'ATL', '#76a6d9'],
    ['Monte Verde', 'MVE', '#b1a4da'], ['Horizonte Esporte Clube', 'HOR', '#d6b27e'],
    ['Vila Imperial', 'VIM', '#9cd0ab'], ['Real Pinhal', 'RPI', '#d194ae']
];
const FIRST = ['Lucas', 'Gabriel', 'Rafael', 'Arthur', 'Pedro', 'Matheus', 'André', 'Vitor', 'Miguel', 'Henrique', 'Caio', 'Davi', 'Bruno', 'Leonardo', 'Felipe', 'Thiago', 'João', 'Daniel', 'Hugo', 'Gustavo', 'Enzo', 'Nicolas'];
const LAST = ['Silva', 'Almeida', 'Costa', 'Oliveira', 'Ribeiro', 'Martins', 'Ferreira', 'Lopes', 'Azevedo', 'Santos', 'Barros', 'Moura', 'Souza', 'Pereira', 'Carvalho', 'Rocha'];
const STARTING = ['GOL', 'GOL', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'MEI', 'MEI', 'MEI', 'MEI', 'MEI', 'MEI', 'MEI', 'ATA', 'ATA', 'ATA', 'ATA', 'ATA', 'ATA'];
const MAX_MONEY = Number.MAX_SAFE_INTEGER;
function xorshift(seed) { let x = seed | 0; x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return x | 0; }
function draw(state, limit) { if (!Number.isInteger(limit) || limit < 1)
    throw Error('Invalid RNG bound'); state.seed = xorshift(state.seed || 0x6d2b79f5); return (state.seed >>> 0) % limit; }
function clone(v) { return JSON.parse(JSON.stringify(v)); }
function getClub(state, id) { const c = state.clubs.find(x => x.id === id); if (!c)
    throw Error(`Clube não encontrado: ${id}`); return c; }
function ensureMoney(value) { if (!Number.isSafeInteger(value) || Math.abs(value) > MAX_MONEY)
    throw Error('Saldo inválido'); }
function makePlayer(id, index, clubIndex, seed, season) {
    const p = STARTING[index % STARTING.length];
    const strength = 49 + draw(seed, 25) + Math.floor(clubIndex / 2);
    const name = `${FIRST[draw(seed, FIRST.length)]} ${LAST[draw(seed, LAST.length)]}`;
    const age = 17 + draw(seed, 19);
    return { id, name, position: p, rating: Math.min(strength, 99), age, salary: 14000 + strength * 550,
        price: Math.round((strength ** 2) * 380), fitness: 90 + draw(seed, 11), goals: 0, games: 0, contractUntil: season + 2 };
}
/** Agendamento circular: N clubes × 2 turnos, uma partida por clube/rodada. */
function createFixtures(clubIds) {
    if (clubIds.length < 4 || clubIds.length % 2 !== 0 || new Set(clubIds).size !== clubIds.length)
        throw Error('Quantidade de clubes inválida');
    const rotation = [...clubIds];
    const first = [];
    for (let round = 1; round < clubIds.length; round++) {
        for (let i = 0; i < rotation.length / 2; i++) {
            let a = rotation[i], b = rotation[rotation.length - 1 - i];
            if ((round + i) % 2 === 0)
                [a, b] = [b, a];
            first.push({ id: `s1-r${round}-${i}`, round, home: a, away: b, played: false });
        }
        rotation.splice(1, 0, rotation.pop());
    }
    return [...first, ...first.map((f, i) => ({ id: `s1-r${clubIds.length + f.round - 1}-${i}`, round: clubIds.length + f.round - 1, home: f.away, away: f.home, played: false }))];
}
/** Demo reproduzível com 10 clubes fictícios; não importa dados privados. */
function createDemoCareer(coachName = 'Técnico FMU', clubId = 'c0', seedValue = 2026) {
    if (coachName.trim().length < 2 || coachName.trim().length > 35)
        throw Error('Informe um nome de técnico entre 2 e 35 caracteres');
    const seed = { seed: seedValue | 0 };
    const season = 2026;
    const clubs = CLUBS.map(([name, short, color], i) => {
        const players = STARTING.map((_, j) => makePlayer(`c${i}-p${j}`, j, i, seed, season));
        // Titulares equilibrados: 1 goleiro, 4 defensores, 3 meias e 3 atacantes.
        const startingIds = [0, 2, 3, 4, 5, 9, 10, 11, 16, 17, 18].map(j => players[j].id);
        return { id: `c${i}`, name, short, color, cash: 11_000_000 + i * 520_000, reputation: 2 + (i % 5), players, formation: '4-3-3', startingIds };
    });
    const freeAgents = Array.from({ length: 16 }, (_, i) => makePlayer(`free-${i}`, i, i % 8, seed, season));
    if (!clubs.some(c => c.id === clubId))
        throw Error('Clube escolhido não existe');
    return { schema: 'fmu-demo-v1', season, round: 1, seed: seed.seed, myClubId: clubId, coachName: coachName.trim(), clubs,
        freeAgents, fixtures: createFixtures(clubs.map(c => c.id)), transfers: [], notices: ['Bem-vindo à demonstração de carreira. O mundo e os atletas são fictícios.'] };
}
function roundsInSeason(s) { return s.clubs.length * 2 - 2; }
/** Classificação viva. `standingsBand` é o seletor portado no M23. */
function standings(s) {
    const rows = s.clubs.map(c => ({ clubId: c.id, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, gd: 0, points: 0, band: 'neutral' }));
    const map = new Map(rows.map(r => [r.clubId, r]));
    for (const f of s.fixtures.filter(x => x.played)) {
        const h = map.get(f.home), a = map.get(f.away);
        if (!h || !a || f.homeGoals === undefined || f.awayGoals === undefined)
            throw Error('Partida inválida na classificação');
        h.played++;
        a.played++;
        h.goalsFor += f.homeGoals;
        h.goalsAgainst += f.awayGoals;
        a.goalsFor += f.awayGoals;
        a.goalsAgainst += f.homeGoals;
        if (f.homeGoals > f.awayGoals) {
            h.points += 3;
            h.wins++;
            a.losses++;
        }
        else if (f.homeGoals < f.awayGoals) {
            a.points += 3;
            a.wins++;
            h.losses++;
        }
        else {
            h.points++;
            a.points++;
            h.draws++;
            a.draws++;
        }
    }
    for (const r of rows)
        r.gd = r.goalsFor - r.goalsAgainst;
    rows.sort((a, b) => b.points - a.points || b.wins - a.wins || b.gd - a.gd || b.goalsFor - a.goalsFor || a.clubId.localeCompare(b.clubId));
    rows.forEach((r, i) => { r.band = (0, standings_1.standingsBand)(i, rows.length, 2, 2); });
    return rows;
}
function playerIsStarter(club, id) { return club.startingIds.includes(id); }
/** M23: `sortedHomeSquad` reutilizado para a ordem por atributo. */
function sortedPlayers(club, field = 'rating') {
    return (0, home_1.sortedHomeSquad)(club.players, field, (p, key) => key === 'position' ? p.position : key === 'name' ? p.name : key === 'rating' ? p.rating : key === 'age' ? p.age : p.goals);
}
function teamStrength(club) {
    const selected = club.startingIds.map(id => club.players.find(p => p.id === id));
    if (selected.some(x => !x) || selected.length !== 11)
        throw Error('Escalação incompleta');
    const average = selected.reduce((sum, p) => sum + p.rating * (0.85 + p.fitness / 650), 0) / 11;
    const tactical = club.formation === '4-3-3' ? 1.2 : club.formation === '4-4-2' ? 0.7 : 0.9;
    return average + tactical;
}
function goals(strength, rival, seed) {
    const chance = 0.23 + (strength - rival) / 220;
    let total = 0;
    for (let k = 0; k < 5; k++)
        if (draw(seed, 10000) / 10000 < Math.max(.08, Math.min(.64, chance)))
            total++;
    return total;
}
/** Uma rodada inteira e despesas reais do sandbox; clone evita mutação parcial. */
function advanceDemoRound(s) {
    validateDemoCareer(s);
    if (s.round > roundsInSeason(s))
        throw Error('Temporada encerrada. Inicie a próxima temporada.');
    const next = clone(s), source = next.fixtures.filter(f => f.round === next.round);
    if (source.length !== next.clubs.length / 2 || source.some(f => f.played))
        throw Error('Rodada inválida');
    const rng = { seed: next.seed };
    for (const f of source) {
        const home = getClub(next, f.home), away = getClub(next, f.away);
        f.homeGoals = goals(teamStrength(home) + 2, teamStrength(away), rng);
        f.awayGoals = goals(teamStrength(away), teamStrength(home) + 2, rng);
        f.played = true;
        const tickets = 180000 + draw(rng, 110000);
        home.cash += tickets;
        for (const club of [home, away]) {
            // Salários de um mês a cada quatro rodadas; atletas na escalação consomem energia.
            for (const p of club.players) {
                if (playerIsStarter(club, p.id)) {
                    p.games++;
                    p.fitness = Math.min(100, Math.max(63, p.fitness - 2 + draw(rng, 4)));
                }
                else
                    p.fitness = Math.min(100, p.fitness + 2);
            }
            if (next.round % 4 === 0) {
                club.cash -= club.players.reduce((acc, p) => acc + p.salary, 0);
            }
            ensureMoney(club.cash);
        }
        for (const [club, count] of [[home, f.homeGoals], [away, f.awayGoals]]) {
            const attackers = club.players.filter(p => club.startingIds.includes(p.id) && p.position === 'ATA');
            for (let i = 0; i < count; i++)
                if (attackers.length)
                    attackers[draw(rng, attackers.length)].goals++;
        }
    }
    next.round++;
    next.seed = rng.seed;
    const mine = source.find(f => f.home === next.myClubId || f.away === next.myClubId);
    next.notices = [`Rodada ${s.round}: ${getClub(next, mine.home).short} ${mine.homeGoals} × ${mine.awayGoals} ${getClub(next, mine.away).short}`, ...next.notices].slice(0, 20);
    return next;
}
/** Novo calendário; envelhece atletas, aumenta a força jovem e repõe energia. */
function nextDemoSeason(s) {
    validateDemoCareer(s);
    if (s.round <= roundsInSeason(s))
        throw Error('Conclua todas as rodadas antes de mudar de temporada');
    const next = clone(s);
    next.season++;
    next.round = 1;
    for (const club of next.clubs) {
        club.cash += 3_500_000;
        ensureMoney(club.cash);
        for (const p of club.players) {
            p.age++;
            p.games = 0;
            p.goals = 0;
            p.fitness = 100;
            if (p.age <= 24)
                p.rating = Math.min(99, p.rating + 1);
            else if (p.age >= 33)
                p.rating = Math.max(30, p.rating - 1);
        }
    }
    next.fixtures = createFixtures(next.clubs.map(c => c.id));
    next.notices = [`Temporada ${next.season}: aporte fictício de patrocínio de R$ 3.500.000.`, ...next.notices].slice(0, 20);
    return next;
}
function setDemoFormation(s, formation) {
    if (!exports.FORMATIONS.includes(formation))
        throw Error('Formação inválida');
    const next = clone(s);
    getClub(next, next.myClubId).formation = formation;
    return next;
}
/** Reserva ocupa exatamente a vaga do titular escolhido. */
function swapDemoStarter(s, outId, inId) {
    const next = clone(s), club = getClub(next, next.myClubId);
    if (!club.players.some(x => x.id === inId) || !club.startingIds.includes(outId) || club.startingIds.includes(inId))
        throw Error('Troca de escalação inválida');
    club.startingIds.splice(club.startingIds.indexOf(outId), 1, inId);
    return next;
}
/** Contratação com caixa, limite de elenco, registro financeiro e posse. */
function hireDemoFreeAgent(s, id) {
    validateDemoCareer(s);
    const next = clone(s), club = getClub(next, next.myClubId);
    const index = next.freeAgents.findIndex(p => p.id === id);
    if (index < 0)
        throw Error('Jogador não disponível');
    const player = next.freeAgents[index];
    if (club.players.length >= 30)
        throw Error('Elenco atingiu o limite de 30 jogadores');
    if (club.cash < player.price)
        throw Error('Saldo insuficiente para a contratação');
    club.cash -= player.price;
    ensureMoney(club.cash);
    club.players.push(next.freeAgents.splice(index, 1)[0]);
    next.transfers.push({ id: `trade-${next.transfers.length + 1}`, playerId: id, playerName: player.name, toId: club.id, fee: player.price,
        year: next.season, month: 1, day: next.round });
    next.notices = [`${player.name} contratado por ${formatMoney(player.price)}.`, ...next.notices].slice(0, 20);
    return next;
}
/** Consulta ao seletor de transferências M23 com formato de data. */
function recentDemoDeals(s) { return (0, market_1.seasonDeals)(s.transfers, s.season); }
function switchDemoClub(s, id) { const next = clone(s); getClub(next, id); next.myClubId = id; return next; }
function formatMoney(value) {
    if (!Number.isFinite(value))
        return '—';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
}
/** Validar saves ANTES de utilizar em render/execução; nunca importar `.bfn` como JSON. */
function validateDemoCareer(x) {
    if (!x || typeof x !== 'object' || Array.isArray(x))
        throw Error('Arquivo de carreira inválido');
    const s = x;
    if (s.schema !== 'fmu-demo-v1' || !Number.isInteger(s.season) || s.season < 2026 || s.season > 2300 ||
        !Number.isInteger(s.round) || !Number.isInteger(s.seed) || !Array.isArray(s.clubs) || s.clubs.length !== CLUBS.length ||
        !Array.isArray(s.fixtures) || !Array.isArray(s.freeAgents) || !Array.isArray(s.transfers) || !Array.isArray(s.notices) ||
        typeof s.coachName !== 'string' || s.coachName.length < 2 || s.coachName.length > 35 || !s.clubs.some(c => c.id === s.myClubId))
        throw Error('Estrutura de carreira incompatível');
    if (s.round < 1 || s.round > roundsInSeason(s) + 1 || s.fixtures.length !== s.clubs.length * (s.clubs.length - 1))
        throw Error('Calendário inválido');
    const ids = new Set(), playerIds = new Set();
    for (const c of s.clubs) {
        if (!c || typeof c.id !== 'string' || ids.has(c.id) || typeof c.name !== 'string' || !exports.FORMATIONS.includes(c.formation) ||
            !Number.isSafeInteger(c.cash) || c.cash < -5_000_000 || !Array.isArray(c.players) || !Array.isArray(c.startingIds) || c.startingIds.length !== 11 || c.players.length > 30)
            throw Error('Clube inválido na carreira');
        ids.add(c.id);
        const roster = new Set();
        for (const p of c.players) {
            validatePlayer(p);
            if (roster.has(p.id) || playerIds.has(p.id))
                throw Error('Jogador duplicado');
            roster.add(p.id);
            playerIds.add(p.id);
        }
        if (new Set(c.startingIds).size !== 11 || c.startingIds.some(id => !roster.has(id)))
            throw Error('Escalação inválida');
    }
    for (const p of s.freeAgents) {
        validatePlayer(p);
        if (playerIds.has(p.id))
            throw Error('Jogador livre duplicado');
        playerIds.add(p.id);
    }
    const matches = new Set();
    for (const f of s.fixtures) {
        if (!f || typeof f.id !== 'string' || matches.has(f.id) || !ids.has(f.home) || !ids.has(f.away) || f.home === f.away ||
            !Number.isInteger(f.round) || f.round < 1 || f.round > roundsInSeason(s) || typeof f.played !== 'boolean' ||
            f.played && (!Number.isInteger(f.homeGoals) || !Number.isInteger(f.awayGoals) || f.homeGoals < 0 || f.awayGoals < 0 || f.homeGoals > 20 || f.awayGoals > 20))
            throw Error('Partida inválida');
        matches.add(f.id);
    }
    for (const t of s.transfers)
        if (typeof t.id !== 'string' || typeof t.playerName !== 'string' || !Number.isSafeInteger(t.fee) || !ids.has(t.toId))
            throw Error('Transferência inválida');
}
function validatePlayer(p) {
    if (!p || typeof p.id !== 'string' || typeof p.name !== 'string' || p.name.length > 90 ||
        !['GOL', 'DEF', 'MEI', 'ATA'].includes(p.position) || !Number.isInteger(p.rating) || p.rating < 1 || p.rating > 100 ||
        !Number.isInteger(p.age) || p.age < 14 || p.age > 80 || ![p.salary, p.price, p.fitness, p.goals, p.games, p.contractUntil].every(Number.isSafeInteger) ||
        p.price < 0 || p.salary < 0 || p.fitness < 0 || p.fitness > 100)
        throw Error('Dados de jogador inválidos');
}
function serializeDemoCareer(s) { validateDemoCareer(s); return JSON.stringify(s, null, 2); }
function restoreDemoCareer(text) {
    if (text.length > 2_000_000)
        throw Error('Arquivo de carreira excede 2 MB');
    const value = JSON.parse(text);
    validateDemoCareer(value);
    return clone(value);
}

},
"src/m25/simulation/live_round.js":function(module,exports,__require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveRound = exports.LIVE_EVENT = void 0;
exports.humanPlays = humanPlays;
exports.countryHasHumanLeague = countryHasHumanLeague;
exports.countryPlaysToday = countryPlaysToday;
exports.roundShows = roundShows;
exports.leagueGroups = leagueGroups;
exports.cupGroups = cupGroups;
exports.fixPenaltyTaker = fixPenaltyTaker;
exports.fixCaptain = fixCaptain;
exports.shootoutRule = shootoutRule;
exports.shootoutWinner = shootoutWinner;
exports.playShootout = playShootout;
exports.resolveLivePenalty = resolveLivePenalty;
/**
 * FMU M25 — port COMPORTAMENTAL de `crates/simulation/src/human/round.rs`.
 * Fonte: Brasfoot Next `bd2ccbd`, licença GPL-3.0-only.
 *
 * Responsabilidades: compor grupos de competições, linhas de uma rodada, avançar
 *   relógio 2 tempos, exibir eventos, reprocessar gols, pênaltis em jogo e
 *   disputas de pênaltis, com hooks para decisões humanas e engine original.
 * Dependências: `LiveWorld` com DTOs explícitos, `RoundHooks` para RNG, motor,
 *   decisões, notificações e fechamento do dia. NÃO instancia World/Rust.
 * Efeitos: altera o `LiveWorld` passado (event.done, placar, stats e winner) e
 *   estado `LiveRoundState`; `onFinished` chamado uma vez ao terminar os grupos.
 * Invariantes: relógio segundo tempo até 51, eventos sem duplicação, sorteios
 *   com mesma ORDEM do Rust, sem pontuação inventada, IDs permanentes strings.
 * Limites importantes: `rust unported!` para tipos 3/7/8/10 e fallback de copas
 *   são erros explícitos. `MatchEngine.play_minute` deve ser fornecido pelo
 *   consumidor; não é o motor de partidas portado. Testes M25 e matriz M25.
 */
exports.LIVE_EVENT = { GOAL: 1, YELLOW: 2, SECOND_YELLOW: 3, RED: 4, INJURY: 5, SUBSTITUTION: 6, MISSED_PENALTY: 7, ASSIST: 8 };
function need(v, kind, id) {
    if (v === undefined)
        throw new Error(`Missing ${kind}: ${id}`);
    return v;
}
function asMatch(w, id) { return need(w.matches[id], 'match', id); }
function asClub(w, id) { return need(w.clubs[id], 'club', id); }
function asPlayer(w, id) { return need(w.players[id], 'player', id); }
function asCompetition(w, id) { return need(w.competitions[id], 'competition', id); }
function asCountry(w, id) { return need(w.countries[id], 'country', id); }
/** Hook RNG validado para rejeitar geradores incompatíveis antes de efeitos de gol. */
function fresh(h, bound) {
    const n = h.freshInt(bound);
    if (!Number.isSafeInteger(n) || n < 0 || n >= bound)
        throw new RangeError(`Invalid freshInt(${bound})`);
    return n;
}
/** `human_plays(m)`: ao menos um clube sob controle humano. */
function humanPlays(w, id) {
    const m = asMatch(w, id);
    return asClub(w, m.home).human || asClub(w, m.away).human;
}
/** `country_has_human_club`: busca todo o elenco das ligas do país,
 * inclusive clube humano que NÃO joga hoje; não aproxima por partidas do dia. */
function countryHasHumanLeague(w, countryId) {
    const c = asCountry(w, countryId);
    return c.leagueClubIds.some(id => asClub(w, id).human);
}
/** `country_plays_today`: liga desse país disputada na data atual. */
function countryPlaysToday(w, countryId) {
    const c = asCountry(w, countryId);
    return w.todayMatches.some(id => { const m = asMatch(w, id); return m.competitionId !== undefined && c.divisions.includes(m.competitionId); });
}
/** `round_shows`: o Rust não porta opções internacionais; mantém erro explícito. */
function roundShows(w, competitionId) {
    if (w.todayMatches.some(id => asMatch(w, id).competitionId === competitionId && humanPlays(w, id)))
        return true;
    if (asCompetition(w, competitionId).kind === 0)
        return false;
    throw new Error('Rust unported: international round options');
}
/** `league_groups`: um grupo por país seguido com humanos; fallback favorito. */
function leagueGroups(w) {
    const groups = [];
    let last = [];
    for (const id of w.leagueCountries) {
        const c = asCountry(w, id);
        if ((countryHasHumanLeague(w, id) || c.followed) && countryPlaysToday(w, id)) {
            last = w.todayCompetitions.filter(comp => asCompetition(w, comp).countryId === id);
            if (last.length)
                groups.push([...last]);
        }
    }
    if (!last.length)
        for (const id of [...w.leagueCountries].reverse()) {
            const c = asCountry(w, id);
            if (c.code === w.favouriteCountryCode && countryPlaysToday(w, id)) {
                const g = w.todayCompetitions.filter(comp => asCompetition(w, comp).countryId === id);
                if (g.length)
                    groups.push(g);
            }
        }
    return groups;
}
/** `cup_groups`: somente copas com time humano; fallback da fonte é `unported!`. */
function cupGroups(w) {
    const groups = [];
    let last = [];
    for (const id of w.leagueCountries) {
        const cup = asCountry(w, id).cup;
        if (!cup)
            continue;
        if (w.todayMatches.some(mid => asMatch(w, mid).competitionId === cup && humanPlays(w, mid))) {
            last = w.todayCompetitions.filter(x => x === cup);
            if (last.length)
                groups.push(last);
        }
    }
    if (!last.length)
        throw new Error('Rust unported: cup without human club');
    return groups;
}
/** `ah.Q/R`: cobrar prioridade à habilidade e trait de pênalti 9, sem goleiro. */
function fixPenaltyTaker(w, clubId, onPitch) {
    const c = asClub(w, clubId);
    if (c.penaltyTaker && onPitch.includes(c.penaltyTaker))
        return;
    const sorted = [...onPitch].sort((a, b) => asPlayer(w, b).strength - asPlayer(w, a).strength);
    const id = sorted.find(x => asPlayer(w, x).trait1 === 9) ?? sorted.find(x => asPlayer(w, x).position !== 0);
    if (id)
        c.penaltyTaker = id;
}
/** `ah.O/P`: capitão mais forte, o mais velho como desempate, e do mesmo clube. */
function fixCaptain(w, clubId, onPitch) {
    const c = asClub(w, clubId);
    if (c.captain && onPitch.includes(c.captain))
        return;
    const sorted = [...onPitch].sort((a, b) => asPlayer(w, b).strength - asPlayer(w, a).strength || asPlayer(w, b).age - asPlayer(w, a).age);
    const id = sorted[0];
    if (id && asPlayer(w, id).clubId === clubId)
        c.captain = id;
}
/** Ordem da IA em shootout: comparador original pode não ser transitivo; NÃO
 * trocar por comparador de força comum, pois isso mudaria a ordem dos sorteios. */
function shootoutRule(w, a, b) {
    const pa = asPlayer(w, a), pb = asPlayer(w, b);
    if (pa.position > pb.position)
        return -1;
    if (pa.strength > pb.strength)
        return -1;
    if (pa.strength < pb.strength)
        return 1;
    if (pa.fitness > pb.fitness)
        return -1;
    if (pa.fitness < pb.fitness)
        return 1;
    return 0;
}
/** `bg.cP`: determina o vencedor quando já não é possível alcançar ou, após
 * as cinco cobranças, na morte súbita, apenas depois do chute visitante. */
function shootoutWinner(side, scored, score, kicks) {
    if (side === 1 && kicks[1] <= 5) {
        if (scored && score[0] > 5 - kicks[2] + score[1])
            return 1;
        if (5 - kicks[1] + score[0] < score[1])
            return 2;
    }
    else if (side === 2 && kicks[2] <= 5) {
        if (scored && 5 - kicks[1] + score[0] < score[1])
            return 2;
        if (score[0] > 5 - kicks[2] + score[1])
            return 1;
    }
    else if (side === 2 && kicks[2] > 5) {
        if (score[0] > score[1])
            return 1;
        if (score[0] < score[1])
            return 2;
    }
    return undefined;
}
/** `bg` e `a.bg`: cinco cobranças por equipe + morte súbita, chance de 70%.
 * A engine não é substituída; apenas o desempate já sinalizado pelo World. */
function playShootout(w, h, matchId) {
    const game = asMatch(w, matchId);
    const sides = [game.home, game.away];
    const lists = [...game.homePlayed], away = [...game.awayPlayed];
    const rosters = [lists, away];
    for (let i = 0; i < 2; i++) {
        const id = sides[i];
        if (asClub(w, id).human) {
            const selected = h.shootoutOrder?.(matchId, id, [...rosters[i]]) ?? rosters[i];
            if (selected.length !== rosters[i].length || new Set(selected).size !== selected.length || selected.some(p => !rosters[i].includes(p)))
                throw new Error('Invalid human shootout order');
            rosters[i] = [...selected];
        }
        else
            rosters[i].sort((a, b) => shootoutRule(w, a, b));
        if (!rosters[i].length)
            throw new Error('Shootout requires on-field players');
    }
    const next = [0, 0], score = [0, 0], kicks = [0, 0, 0];
    let side = 1;
    for (let step = 0; step < 300; step++) {
        const i = side - 1, list = rosters[i];
        if (next[i] >= list.length)
            next[i] = 0;
        const scored = fresh(h, 100) < 70;
        next[i]++;
        if (scored)
            score[i]++;
        kicks[side]++;
        const winner = shootoutWinner(side, scored, score, kicks);
        if (winner) {
            game.winnerId = sides[winner - 1];
            game.penaltyShootout = [...score];
            return winner;
        }
        side = side === 1 ? 2 : 1;
    }
    throw new Error('Shootout exceeded 300 kicks');
}
/** Resolve `a.gb` reproduzindo consumo RNG de comentários 6,5, chance 100 e
 * comentário final 7. Atualiza event kind, chute, placar e estatísticas. */
function resolveLivePenalty(w, h, g, event, side) {
    const keeperId = (side === 1 ? g.awayPlayed : g.homePlayed).find(x => asPlayer(w, x).slot === 1);
    const taker = asPlayer(w, need(event.playerId, 'penalty taker', g.id));
    // Comentários do motor sempre sorteados PRIMEIRO.
    fresh(h, 6);
    fresh(h, 5);
    let odds = 70;
    if (taker.trait1 === 9 || taker.trait2 === 9 || taker.worldClass)
        odds += 10;
    if (taker.star)
        odds += 5;
    if (keeperId) {
        const k = asPlayer(w, keeperId);
        if (k.trait1 === 1 || k.trait2 === 1)
            odds -= 10;
        if (k.worldClass)
            odds -= 10;
        if (k.star)
            odds -= 5;
    }
    const scored = fresh(h, 100) + 1 <= odds, i = side - 1;
    if (scored) {
        fresh(h, 7);
        if (side === 1)
            g.homeGoals++;
        else
            g.awayGoals++;
        g.shots[i]++;
        g.shotsOnTarget[i]++;
        taker.goals++;
        h.addEngineGoal?.(g.id, i);
    }
    else {
        g.shots[i]++;
        taker.missedPenalties++;
        const how = fresh(h, 7);
        if (how !== 2 && how !== 6)
            g.shotsOnTarget[i]++;
        else
            g.valuesGa[i]++;
        event.kind = exports.LIVE_EVENT.MISSED_PENALTY;
        if (how === 0 || how === 3 || how === 5) {
            if (!keeperId)
                throw new Error('Rust penalty save without goalkeeper');
            event.otherPlayerId = keeperId;
            asPlayer(w, keeperId).penaltySaves++;
        }
    }
    event.flagDg = true;
    return scored;
}
/** `LiveRound`: avança eventos por minuto; usa World+hooks reais do consumidor.
 * Não cria eventos de partida: recebe os produzidos pelo motor/fixture. */
class LiveRound {
    world;
    hooks;
    state;
    constructor(world, hooks) {
        this.world = world;
        this.hooks = hooks;
        for (const id of world.todayMatches)
            asMatch(world, id);
        const first = world.todayCompetitions[0];
        let groups = [];
        if (first) {
            const kind = asCompetition(world, first).kind;
            switch (kind) {
                case 1:
                    groups = leagueGroups(world);
                    break;
                case 2:
                    groups = cupGroups(world);
                    break;
                case 9:
                case 11:
                    groups = [world.todayCompetitions];
                    break;
                case 3:
                case 7:
                case 8:
                case 10: throw new Error(`Rust unported round kind: ${kind}`);
                default: groups = world.todayCompetitions.filter(id => roundShows(world, id)).map(id => [id]);
            }
        }
        this.state = { on: true, over: false, half: 1, minute: 0, groups: groups.map(ids => ({ ids: [...ids], pending: true })), rows: [], finished: false };
        this.nextGroup();
    }
    /** `s.dJ`: consome próximo grupo, ou encerra dia uma única vez. */
    nextGroup() {
        const next = this.state.groups.find(g => g.pending);
        if (!next) {
            this.state.on = false;
            this.state.finished = true;
            this.hooks.onFinished();
            return;
        }
        next.pending = false;
        this.showGroup(next.ids);
    }
    /** `dV.Y`: título e linhas de jogos, em ordem original da competição. */
    showGroup(ids) {
        this.state.minute = 0;
        this.state.half = 1;
        this.state.over = false;
        this.state.rows = [];
        for (const id of ids) {
            let first = true;
            for (const mid of this.world.todayMatches) {
                const game = asMatch(this.world, mid);
                if (game.competitionId !== id)
                    continue;
                if (first) {
                    this.state.rows.push({ competitionId: id, human: false, goals: [0, 0] });
                    first = false;
                }
                const human = humanPlays(this.world, mid);
                fixPenaltyTaker(this.world, game.home, game.homePlayed);
                fixCaptain(this.world, game.home, game.homePlayed);
                fixPenaltyTaker(this.world, game.away, game.awayPlayed);
                fixCaptain(this.world, game.away, game.awayPlayed);
                this.state.rows.push({ matchId: mid, competitionId: id, human, goals: [0, 0] });
            }
        }
    }
    /** `dV.qa`: 49 ticks no primeiro tempo, 51 no segundo. */
    tick() {
        if (!this.state.on)
            return;
        this.hooks.checkpoint(`tick ${this.state.half} ${this.state.minute}`);
        this.state.minute++;
        if (this.state.half === 1 && this.state.minute > 48)
            this.halfTime();
        if (this.state.half === 2 && this.state.minute >= 51) {
            this.over();
            return;
        }
        this.minuteEvents();
    }
    halfTime() {
        this.state.minute = 0;
        this.state.half = 2;
        if (this.world.showHalfTimeSubstitutions)
            for (const row of this.state.rows)
                if (row.human && row.matchId)
                    this.hooks.substitutions?.(row.matchId, true);
        for (const row of this.state.rows)
            if (row.human && row.matchId)
                this.hooks.halfTimeChanges?.(row.matchId);
    }
    minuteEvents() {
        for (const row of this.state.rows)
            if (row.human && row.matchId) {
                const game = asMatch(this.world, row.matchId);
                if ((game.addedByHalf[this.state.half] ?? 0) <= this.state.minute)
                    this.hooks.playMinute?.(row.matchId, this.state.minute, this.state.half);
            }
        for (const row of this.state.rows) {
            if (!row.matchId)
                continue;
            const game = asMatch(this.world, row.matchId);
            for (const event of game.events)
                if (!event.done && event.half === this.state.half && event.minute <= this.state.minute)
                    this.showEvent(row, game, event);
        }
    }
    showEvent(row, g, event) {
        // ASSIST fica feito, mas não tem efeito adicional no placar.
        event.done = true;
        const side = event.clubId === g.home ? 1 : event.clubId === g.away ? 2 : 0;
        if (side === 0)
            return;
        const human = asClub(this.world, event.clubId).human;
        if (event.kind === exports.LIVE_EVENT.GOAL) {
            if (event.detail === 3 && row.human) {
                if (human) {
                    const choose = this.hooks.choosePenaltyTaker?.(g.id, event.clubId);
                    if (choose !== undefined) {
                        if (!this.world.players[choose])
                            throw new Error('Human selected missing penalty taker');
                        event.playerId = choose;
                    }
                }
                if (resolveLivePenalty(this.world, this.hooks, g, event, side))
                    row.goals[side - 1]++;
            }
            else
                row.goals[side - 1]++;
        }
        else if (human && (event.kind === exports.LIVE_EVENT.RED || event.kind === exports.LIVE_EVENT.SECOND_YELLOW || event.kind === exports.LIVE_EVENT.INJURY)) {
            if (!asClub(this.world, g.home).human)
                asClub(this.world, g.home).kit = 0;
            if (!asClub(this.world, g.away).human)
                asClub(this.world, g.away).kit = 1;
            this.hooks.substitutions?.(g.id, false);
        }
    }
    /** `dV.qc`: reconcilia placar por eventos se mandante divergiu; shootout. */
    over() {
        if (this.state.over)
            return;
        this.state.over = true;
        for (const row of this.state.rows) {
            if (!row.matchId)
                continue;
            const g = asMatch(this.world, row.matchId);
            if (g.homeGoals !== row.goals[0]) {
                g.homeGoals = g.events.filter(e => e.kind === exports.LIVE_EVENT.GOAL && e.clubId === g.home).length;
                g.awayGoals = g.events.filter(e => e.kind === exports.LIVE_EVENT.GOAL && e.clubId === g.away).length;
            }
        }
        for (const row of this.state.rows) {
            if (!row.matchId)
                continue;
            const g = asMatch(this.world, row.matchId);
            if (g.knockout && g.needsShootout && (row.human || this.world.showAIShootouts))
                playShootout(this.world, this.hooks, g.id);
        }
        this.nextGroup();
    }
    /** Snapshot de estado de UI; o World do jogo deve ser salvo separadamente. */
    snapshot() { return JSON.parse(JSON.stringify(this.state)); }
}
exports.LiveRound = LiveRound;

},
"src/m25/web/demo_replay.js":function(module,exports,__require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemoMatchReplay = void 0;
exports.replayGoalEvents = replayGoalEvents;
exports.replayWorld = replayWorld;
const live_round_1 = __require("src/m25/simulation/live_round.js");
function hash(text) {
    let value = 2166136261;
    for (let i = 0; i < text.length; i++)
        value = Math.imul(value ^ text.charCodeAt(i), 16777619);
    return value >>> 0;
}
function playerId(p) { return p.id; }
/** Converte as 11 posições reais do squad demo em atletas de jogo sem mutar fonte. */
function playersFor(s, clubId, store) {
    const club = s.clubs.find(x => x.id === clubId);
    if (!club)
        throw Error('Replay club missing: ' + clubId);
    return club.startingIds.map((id, index) => {
        const p = club.players.find(x => x.id === id);
        if (!p)
            throw Error('Replay starter missing: ' + id);
        store[id] = { id: playerId(p), clubId, position: p.position === 'GOL' ? 0 : p.position === 'DEF' ? 2 : p.position === 'MEI' ? 3 : 4,
            strength: p.rating, age: p.age, fitness: p.fitness, slot: p.position === 'GOL' ? 1 : index + 2,
            trait1: 0, trait2: 0, star: false, worldClass: false, goals: 0, missedPenalties: 0, penaltySaves: 0 };
        return id;
    });
}
/** Marcadores ilustrativos, sem números aleatórios nem acesso à engine de partidas. */
function replayGoalEvents(f) {
    if (!f.played || f.homeGoals === undefined || f.awayGoals === undefined)
        throw Error('Replay requires finished fixture');
    const events = [];
    for (const [side, count] of [[f.home, f.homeGoals], [f.away, f.awayGoals]]) {
        for (let n = 0; n < count; n++) {
            const draw = hash(f.id + '|' + side + '|' + n), half = n % 2 === 0 ? 1 : 2, minute = 5 + draw % 39;
            events.push({ kind: live_round_1.LIVE_EVENT.GOAL, half, minute, detail: 0, clubId: side, done: false });
        }
    }
    return events.sort((a, b) => a.half - b.half || a.minute - b.minute || String(a.clubId).localeCompare(String(b.clubId)));
}
/** Estado seguro com representação de apenas uma partida; nenhuma fonte foi atualizada. */
function replayWorld(s, matchId) {
    const g = s.fixtures.find(x => x.id === matchId);
    if (!g || !g.played || g.homeGoals === undefined || g.awayGoals === undefined)
        throw Error('Apenas partidas encerradas podem ser revistas');
    const players = {}, homePlayed = playersFor(s, g.home, players), awayPlayed = playersFor(s, g.away, players);
    const match = { id: g.id, competitionId: 'liga-demo', home: g.home, away: g.away, homePlayed, awayPlayed,
        events: replayGoalEvents(g), homeGoals: g.homeGoals, awayGoals: g.awayGoals, knockout: false, needsShootout: false,
        addedByHalf: [0, 0, 0], shots: [0, 0], shotsOnTarget: [0, 0], valuesGa: [0, 0] };
    const allClubIds = [g.home, g.away];
    return { players, clubs: Object.fromEntries(allClubIds.map(id => [id, { id, countryId: 'demo', human: id === s.myClubId }])),
        competitions: { 'liga-demo': { id: 'liga-demo', kind: 9, countryId: 'demo' } }, countries: {},
        matches: { [g.id]: match }, todayMatches: [g.id], todayCompetitions: ['liga-demo'], leagueCountries: [],
        favouriteCountryCode: 29, showAIShootouts: false, showHalfTimeSubstitutions: false };
}
/** Controlador efêmero de replay; `advance()` e `finish()` não tocam no save. */
class DemoMatchReplay {
    career;
    matchId;
    world;
    round;
    constructor(career, matchId) {
        this.career = career;
        this.matchId = matchId;
        this.world = replayWorld(career, matchId);
        const hooks = { checkpoint: () => { }, freshInt: () => 0, onFinished: () => { } };
        this.round = new live_round_1.LiveRound(this.world, hooks);
    }
    advance(steps) {
        if (!Number.isSafeInteger(steps) || steps < 0 || steps > 100)
            throw Error('Quantidade inválida de minutos para replay');
        for (let i = 0; i < steps && this.round.state.on; i++)
            this.round.tick();
        return this.frame();
    }
    finish() { for (let i = 0; i < 100 && this.round.state.on; i++)
        this.round.tick(); return this.frame(); }
    frame() {
        const m = this.world.matches[this.matchId];
        const row = this.round.state.rows.find(x => x.matchId === this.matchId);
        const displayed = row?.goals ?? [0, 0];
        return { matchId: this.matchId, half: this.round.state.half, minute: this.round.state.minute,
            finished: !this.round.state.on, homeGoals: displayed[0], awayGoals: displayed[1],
            history: m.events.filter(e => e.done && e.kind === live_round_1.LIVE_EVENT.GOAL).map(e => ({ half: e.half, minute: e.minute, clubId: e.clubId, type: 'goal' })) };
    }
}
exports.DemoMatchReplay = DemoMatchReplay;

}
};const cache={};function __require(id){if(cache[id])return cache[id].exports;const fn=modules[id];if(!fn)throw Error("Module not found "+id);const module={exports:{}};cache[id]=module;fn(module,module.exports,__require);return module.exports;}__require("src/m24/web/browser.js");})();
