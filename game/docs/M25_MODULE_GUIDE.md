# FMU M25 — Portes verificados de rodada, pré-importação Kryo e replay web

**Fonte canônica:** Brasfoot Next Rust commit `bd2ccbdd5f1aaacb6437b58b198d7963c61b3780` (GPL-3.0-only). **Base TS:** FMU M24 commit `7bf52ee`. **Estado:** incremento parcial testado; não é port integral do motor.

## M25-1 — `src/m25/simulation/live_round.ts`

**Origem Rust:** `crates/simulation/src/human/round.rs` (644 linhas); `engine/src/simulate.rs` define valores de tipos de evento. **Responsabilidade:** seleção de competições exibidas, grupos de rodadas, timer 1º/2º tempo, exibição de gols/eventos, cobrança e decisão de pênaltis. **Dependências:** `LiveWorld` com clubes, atletas, jogos, eventos e competições; `RoundHooks` com RNG, checkpoint, engine `play_minute`, decisões do humano, substituições e término. **Efeitos:** modifica somente `LiveWorld`/`LiveRoundState` passados. Sem simular partidas sem hooks nem mutar outro estado da carreira.

| Função | Entrada → saída | Efeitos / invariantes | Dependências | Testes |
|---|---|---|---|---|
| `humanPlays` | World, MatchId → boolean | Puro; um clube do confronto é humano | `clubs`, `matches` | M25 humanos |
| `countryHasHumanLeague` | World, CountryId → boolean | Puro; inclui clube humano que não disputa partida hoje | `leagueClubIds` da lista canônica | M25 país |
| `countryPlaysToday` | World, CountryId → boolean | Puro; procura divisão do país | `todayMatches`, `divisions` | M25 país |
| `roundShows` | World, CompId → boolean | Recusa tipo internacional não portado | `humanPlays`, `kind` | M25 unported |
| `leagueGroups` | World → CompId[][] | Puro; favoritos + ligas humanas; ordem Rust | `countries`, `todayCompetitions` | M25 grupos |
| `cupGroups` | World → CompId[][] | Puro; ausência de humano vai para erro do Rust | `countries[].cup` | M25 copa |
| `fixPenaltyTaker` | World, ClubId, 11 onPitch → void | Prioriza trait 9; escolhe mais forte não goleiro; muta clube | `players`, `clubs` | M25 cobrador |
| `fixCaptain` | World, ClubId, 11 onPitch → void | Mais forte, depois mais velho; somente vinculado ao clube | `players`, `clubs` | M25 capitão |
| `shootoutRule` | World, PlayerA/B → -1/0/1 | Comparador original deliberadamente assimétrico | posição/força/físico | M25 sort |
| `shootoutWinner` | lado, gol, placar, cobranças → vencedor? | 5 rodadas + morte súbita, sem vitória prematura | dados numéricos explícitos | M25 shootout winner |
| `playShootout` | World, RNG, MatchId → lado vencedor | Chance 70%, atribui winner e shootout; 300 cobranças de proteção | `freshInt`, `shootoutOrder` | M25 shootout |
| `resolveLivePenalty` | World, hooks, Match, Event, side → scored | Ordem RNG 6→5→100→7; chances por traits, estatísticas | `freshInt`, `addEngineGoal` | M25 pênalti |
| `LiveRound` | World, hooks → controlador | Agrupa jogos, abre eventos, substituições e finaliza uma vez | `playMinute`, `halfTimeChanges`, `onFinished` | M25 tick/half/finish |
| `LiveRound.snapshot` | nenhum → LiveRoundState | Cópia de UI; **não** snapshot do World | JSON DTO | M25 clone |

**Limites de paridade:** o Rust ainda possui `crate::unported!` para alguns tipos e para fallback de copas; tais lacunas permanecem erros explícitos. Os métodos reais `MatchEngine.play_minute`, `Sim.pick_ai_lineups`, `Sim.advance` e `GameData` devem ser conectados ao World canônico. O TS acima **não** é motor de partidas autonomamente jogável.

## M25-2 — `src/m25/web/demo_replay.ts`

**Fonte de integração:** o port acima, consumindo `src/m24/web/career_demo.ts` (sandbox com dez clubes fictícios).

| Função | Entrada → saída | Efeito | Limite | Testes |
|---|---|---|---|---|
| `replayGoalEvents` | DemoFixture disputado → LiveEvent[] | Puro; tempo do gol derivado de hash estável | Horários **ilustrativos**, não do motor | M25 determinismo |
| `replayWorld` | DemoCareer, FixtureId → LiveWorld | Cria DTO separado, não modifica a carreira | Só partidas encerradas | M25 score/restore |
| `DemoMatchReplay.advance` | 0..100 minutos → ReplayFrame | Avança controlador efêmero | Não toca save JSON | M25 steps |
| `DemoMatchReplay.finish` | nenhum → ReplayFrame | Mostra eventos até fim, sem gols novos | Não altera resultado canônico | M25 finish |
| `DemoMatchReplay.frame` | nenhum → ReplayFrame | Puro; relógio, placar e lista de gols | Apenas exibição | M25 frame |

**UI M25:** `src/m24/web/browser.ts`, `public/fmu-m24/app.css`, navegador com nova rota `replay`. Exibe a origem fictícia explicitamente; botões 5/15 minutos, até fim, reiniciar, seleção de partida e botão “Rever” no calendário. QA Chromium: `tools/m25_browser_qa.py`.

## M25-3 — `src/m25/persistence/import_s22_graph.ts`

**Origem Rust:** `crates/persistence/src/import/mod.rs` (80 linhas). **Responsabilidade:** validar as raízes da conversão de `.s22` já decodificado e preparar as nove arenas antes dos conversores gerados.

| Função | Entrada → saída | Efeitos, validações e limites | Dependências | Testes |
|---|---|---|---|---|
| `s22RootNode` | KryoGraph22, raiz, índice 0/1 → NodeId | Exige `best.f` e `best.ay`, recusa classe/ID incorretos | `kryo_graph` | M25 raízes |
| `stageS22Import` | Grafo decodificado + duas raízes → S22ImportPlan | Enumera arenas na ordem do grafo; `worldLoaded:false` obrigatório | `import_context::buildArenaIndex` | M25 staging |
| `validateS22NodeReferences` | Grafo, limite de profundidade → relatório | Conta referências, identifica ponteiro inválido e profundidade > limite | DTO grafo | M25 refs |

**Limitações:** não existe decodificador integral `.s22`, mapeamento de todos os campos nem `World` de jogo carregado por este módulo. Não marcar como importação nativa concluída. A entrada **já precisa ser um grafo Kryo decodificado**. O `.bfn` (Zstd/CBOR) não é coberto aqui.

## Dependências cruzadas

```text
Game World Rust (ainda não ligado)
     │
     ├─ MatchEngine.play_minute / Sim.advance -- PENDENTE
     │              │
     │              ▼
     └──> m25/simulation/live_round.ts ───────────> decisões/minutos/pênaltis
                      ▲
             m25/web/demo_replay.ts ←── m24/web/career_demo.ts
                      │                    └─ estado salvo JSON
                      ▼
             m24/web/browser.ts, 9ª tela

Kryo bytes .s22 -- [full decoder PENDENTE] --> KryoGraph22
                                                  │
                                                  ▼
                             m25/persistence/import_s22_graph.ts
                                                  │
                                   convert_world/11 conversores PENDENTES
```

## Regressões e QA

```bash
npm run build
npm run m25:tests
npm test
npm run m25:bundle
npm run m25:browser-qa
npm run m24:two-seasons
python3 tools/m25_audit.py --check
```

O `npm run m25:browser-qa` requer Chromium+Playwright locais e gera screenshots desktop, tablet e mobile; se não disponível, QA visual **UNVERIFIED**. O `npm test` é QA técnico, não comprova UI visual.

**Cobertura nominal:** M24 194/231 = 83,98%, M25 196/231 = **84,85%** (+0,87 ponto); restam 35 fontes `UNPORTED`. Vários dos 196 são adaptadores ou mapeamentos de UI e **não são implementações integrais**. A paridade funcional não pode ser expressa por porcentagem confiável.
