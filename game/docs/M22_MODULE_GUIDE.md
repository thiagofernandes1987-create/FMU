# FMU M22 — Guia de manutenção dos 70 ports Rust→TypeScript

**Fonte canônica:** Brasfoot Next `bd2ccbdd5f1aaacb6437b58b198d7963c61b3780` (GPL-3.0-only).
**Base:** M21 `8e5cfbd`; os componentes abaixo usam chamadas diretas e são **opt-in**.
**Estatuto:** toda correspondência nova está `PARTIAL_M22_TESTED`; isto registra comportamento concreto ou esquema exportado, **não** equivalência de crate inteira.

## Contratos comuns

As funções puras evitam modificar o World sem contrato; módulos que precisam de RNG, funções de engine, callbacks de moeda e leitura de arquivos recebem essas dependências explicitamente. Módulos de leitura binária verificam limites antes de acessar bytes. `canonical_generated`, `saved` e `import_generated` extraem metadados de campos da fonte, e não reimplementam serialização integral.

O arquivo `src/m22/index.ts` expõe as rotas por namespace, enquanto `src/m22/interop.ts` prova um consumidor cruzado de `simulation` e `engine` com teste. A carreira principal M21 **não** ativa automaticamente todos esses ports.

## Crate `datapack`

| Rust | TypeScript | Funções exportadas | Dependências | Testes |
|---|---|---|---|---|
| `crates/datapack/src/database.rs` | `src/m22/datapack/database.ts` | removesPath, composeLayers | tipos e estado explícitos; sem import externo | `m22_lowlevel.test.ts` |
| `crates/datapack/src/legacy.rs` | `src/m22/datapack/legacy.ts` | legacySlug, legacyJavaHash, potentialsArePlaces, effectiveRelegatedDirectly | tipos e estado explícitos; sem import externo | `m22_lowlevel.test.ts` |
| `crates/datapack/src/pack.rs` | `src/m22/datapack/pack.ts` | chunkName, packTotalSize, parsePackIndex | tipos e estado explícitos; sem import externo | `m22_lowlevel.test.ts` |
| `crates/datapack/src/read.rs` | `src/m22/datapack/read.ts` | TROPHY_KINDS, NATIONAL_TEAM_PICTURES, isSlug, isDocumentation, isColor, rangeIssue | tipos e estado explícitos; sem import externo | `m22_lowlevel.test.ts` |

## Crate `engine`

| Rust | TypeScript | Funções exportadas | Dependências | Testes |
|---|---|---|---|---|
| `crates/engine/src/engine.rs` | `src/m22/engine/engine.ts` | GOAL_KIND22, ENGINE_SHOT_WEIGHTS22, SCORER_WEIGHTS22, pickWeighted22 | tipos e estado explícitos; sem import externo | `m22_wave_fg.test.ts` |
| `crates/engine/src/lineup.rs` | `src/m22/engine/lineup.ts` | eligibleForLineup22, sortLineupStrength22, lineupFormationDraw22 | tipos e estado explícitos; sem import externo | `m22_wave_fg.test.ts` |
| `crates/engine/src/simulate.rs` | `src/m22/engine/simulate.ts` | sideBehind22, aiChangeDecision22 | tipos e estado explícitos; sem import externo | `m22_wave_fg.test.ts` |
| `crates/engine/src/tactics.rs` | `src/m22/engine/tactics.ts` | BALANCED22, tacticalBeats22, tacticalAdvantage22, tacticalCycle22, tacticalFitLimit22, tacticalSlotAverage22 | tipos e estado explícitos; sem import externo | `m22_wave_fg.test.ts` |
| `crates/engine/src/value.rs` | `src/m22/engine/value.ts` | slotKind22, modAttributeMix22, modPlayerValue22 | tipos e estado explícitos; sem import externo | `m22_wave_fg.test.ts` |

## Crate `i18n`

| Rust | TypeScript | Funções exportadas | Dependências | Testes |
|---|---|---|---|---|
| `crates/i18n/src/labels.rs` | `src/m22/i18n/labels.ts` | collapseSpaces, stageName, countryLabel, nationalLeagueName, cupArticle, seasonTitles | ./lib | `m22_lowlevel.test.ts` |
| `crates/i18n/src/lib.rs` | `src/m22/i18n/lib.ts` | DEFAULT_LOCALE, Translator22, fluentArgs | tipos e estado explícitos; sem import externo | `m22_lowlevel.test.ts` |

## Crate `model`

| Rust | TypeScript | Funções exportadas | Dependências | Testes |
|---|---|---|---|---|
| `crates/model/src/canonical.rs` | `src/m22/model/canonical.ts` | Canonical22, canonicalRoots | tipos e estado explícitos; sem import externo | `m22_wave_de.test.ts` / `m22_wave_fg.test.ts` |
| `crates/model/src/canonical_generated.rs` | `src/m22/model/canonical_generated.ts` | canonicalFieldOrder, canonicalOrderedObject | ./canonical_fields.generated | `m22_wave_de.test.ts` / `m22_wave_fg.test.ts` |
| `crates/model/src/clock.rs` | `src/m22/model/clock.ts` | isLeapYear, daysInMonth, daysOfYear, dateAtUTC | tipos e estado explícitos; sem import externo | `m22_lowlevel.test.ts` |
| `crates/model/src/mods.rs` | `src/m22/model/mods.ts` | youthLeagueAverage, MOD_STATE_SECTIONS, availableModSections | tipos e estado explícitos; sem import externo | `m22_wave_de.test.ts` / `m22_wave_fg.test.ts` |
| `crates/model/src/player.rs` | `src/m22/model/player.ts` | isSuspended, serveSuspension, addRating, averageRating, setAge, setStar, setPotential, setSide (+5) | tipos e estado explícitos; sem import externo | `m22_lowlevel.test.ts` |
| `crates/model/src/rng.rs` | `src/m22/model/rng.ts` | JavaLCG22 | tipos e estado explícitos; sem import externo | `m22_lowlevel.test.ts` |
| `crates/model/src/save_numbers.rs` | `src/m22/model/save_numbers.ts` | MAIN_SAVE_LIST, numberPlayersForSave, relinkTransfers, calendarCompetitionIds | tipos e estado explícitos; sem import externo | `m22_lowlevel.test.ts` |
| `crates/model/src/saved.rs` | `src/m22/model/saved.ts` | savedFieldNames, savedMissingFields | ./saved_fields.generated | `m22_wave_de.test.ts` / `m22_wave_fg.test.ts` |

## Crate `persistence`

| Rust | TypeScript | Funções exportadas | Dependências | Testes |
|---|---|---|---|---|
| `crates/persistence/src/game_data.rs` | `src/m22/persistence/game_data.ts` | legacyPlayer | tipos e estado explícitos; sem import externo | `m22_wave_de.test.ts` / `m22_wave_fg.test.ts` |
| `crates/persistence/src/import/context.rs` | `src/m22/persistence/import_context.ts` | arenaOfClass, buildArenaIndex | tipos e estado explícitos; sem import externo | `m22_wave_de.test.ts` / `m22_wave_fg.test.ts` |
| `crates/persistence/src/import/generated.rs` | `src/m22/persistence/import_generated.ts` | convertGeneratedSimple22 | ./import_generated.fields | `m22_wave_de.test.ts` / `m22_wave_fg.test.ts` |
| `crates/persistence/src/javaser.rs` | `src/m22/persistence/javaser.ts` | javaField, javaInt, javaBool, javaString, javaList | tipos e estado explícitos; sem import externo | `m22_wave_de.test.ts` / `m22_wave_fg.test.ts` |
| `crates/persistence/src/kryo/canonical.rs` | `src/m22/persistence/kryo_canonical.ts` | canonicalGraph | tipos e estado explícitos; sem import externo | `m22_wave_de.test.ts` / `m22_wave_fg.test.ts` |
| `crates/persistence/src/kryo/graph.rs` | `src/m22/persistence/kryo_graph.ts` | KryoGraph22 | tipos e estado explícitos; sem import externo | `m22_lowlevel.test.ts` |
| `crates/persistence/src/kryo/input.rs` | `src/m22/persistence/kryo_input.ts` | KryoInput22 | tipos e estado explícitos; sem import externo | `m22_lowlevel.test.ts` |
| `crates/persistence/src/kryo/mod.rs` | `src/m22/persistence/kryo_mod.ts` | KryoParseError, kryoCheckedSlice | tipos e estado explícitos; sem import externo | `m22_wave_de.test.ts` / `m22_wave_fg.test.ts` |
| `crates/persistence/src/kryo/reader.rs` | `src/m22/persistence/kryo_reader.ts` | KRYO_BUILTIN_CLASSES, KryoClassRegistry | tipos e estado explícitos; sem import externo | `m22_wave_de.test.ts` / `m22_wave_fg.test.ts` |
| `crates/persistence/src/kryo/schema.rs` | `src/m22/persistence/kryo_schema.ts` | parseKryoSchema | tipos e estado explícitos; sem import externo | `m22_lowlevel.test.ts` |
| `crates/persistence/src/migrations.rs` | `src/m22/persistence/migrations.ts` | addSaveNumbers, GAME_RENAMES, renameTournamentFields | tipos e estado explícitos; sem import externo | `m22_wave_de.test.ts` / `m22_wave_fg.test.ts` |
| `crates/persistence/src/native.rs` | `src/m22/persistence/native.ts` | BFN_FORMAT_VERSION, decodeBfnHeader, encodeBfnHeader | tipos e estado explícitos; sem import externo | `m22_wave_de.test.ts` / `m22_wave_fg.test.ts` |

## Crate `simulation`

| Rust | TypeScript | Funções exportadas | Dependências | Testes |
|---|---|---|---|---|
| `crates/simulation/src/coach_market.rs` | `src/m22/simulation/coach_market.ts` | unemployedCoaches22 | tipos e estado explícitos; sem import externo | `m22_simulation.test.ts` |
| `crates/simulation/src/coaches.rs` | `src/m22/simulation/coaches.ts` | coachMatchPoints22 | tipos e estado explícitos; sem import externo | `m22_simulation.test.ts` |
| `crates/simulation/src/continental.rs` | `src/m22/simulation/continental.ts` | makeContinentalTie22, separateContinentalCountries22 | tipos e estado explícitos; sem import externo | `m22_wave_fg.test.ts` |
| `crates/simulation/src/evolution.rs` | `src/m22/simulation/evolution.ts` | countryStrengthCeiling22 | tipos e estado explícitos; sem import externo | `m22_simulation.test.ts` |
| `crates/simulation/src/game.rs` | `src/m22/simulation/game.ts` | humanWaiting22, advanceGameAction22, markDaysDone22 | tipos e estado explícitos; sem import externo | `m22_wave_fg.test.ts` |
| `crates/simulation/src/human/lineup.rs` | `src/m22/simulation/human_lineup.ts` | penaltyTaker22, onLineupGrid22 | tipos e estado explícitos; sem import externo | `m22_wave_fg.test.ts` |
| `crates/simulation/src/human/purchase.rs` | `src/m22/simulation/human_purchase.ts` | transferWillingness, humanPurchaseOffer | tipos e estado explícitos; sem import externo | `m22_simulation.test.ts` |
| `crates/simulation/src/knockout.rs` | `src/m22/simulation/knockout.ts` | knockoutTransition, knockoutPrize | tipos e estado explícitos; sem import externo | `m22_simulation.test.ts` |
| `crates/simulation/src/league.rs` | `src/m22/simulation/league.ts` | leaguePosition, midSeasonRound, leagueRelegationPlaces | tipos e estado explícitos; sem import externo | `m22_simulation.test.ts` |
| `crates/simulation/src/market.rs` | `src/m22/simulation/market.ts` | squadCounts22, clubWants22 | tipos e estado explícitos; sem import externo | `m22_wave_fg.test.ts` |
| `crates/simulation/src/matchday.rs` | `src/m22/simulation/matchday.ts` | todayMatches22, aiLineupPlan22 | tipos e estado explícitos; sem import externo | `m22_simulation.test.ts` |
| `crates/simulation/src/national_cups.rs` | `src/m22/simulation/national_cups.ts` | NATIONAL_CUPS22, fourPotsOrder22 | tipos e estado explícitos; sem import externo | `m22_wave_fg.test.ts` |
| `crates/simulation/src/national_teams.rs` | `src/m22/simulation/national_teams.ts` | nationHasEnoughPlayers22, sortNationalCandidates22 | tipos e estado explícitos; sem import externo | `m22_simulation.test.ts` |
| `crates/simulation/src/new_game.rs` | `src/m22/simulation/new_game.ts` | tournamentCycles22, clubsByLevel22, javaCompareClubName22 | tipos e estado explícitos; sem import externo | `m22_wave_fg.test.ts` |
| `crates/simulation/src/new_season.rs` | `src/m22/simulation/new_season.ts` | assignDayKind22, nthDayOfKind22, addCalendarTask22 | tipos e estado explícitos; sem import externo | `m22_wave_fg.test.ts` |
| `crates/simulation/src/player_gen.rs` | `src/m22/simulation/player_gen.ts` | javaNameLength22, javaWordCount22, youthPotential22 | tipos e estado explícitos; sem import externo | `m22_simulation.test.ts` |
| `crates/simulation/src/player_search.rs` | `src/m22/simulation/player_search.ts` | SEARCH_VALUE_BANDS22, searchPlayer22 | tipos e estado explícitos; sem import externo | `m22_simulation.test.ts` |
| `crates/simulation/src/second_tiers.rs` | `src/m22/simulation/second_tiers.ts` | secondTierCodes22, flattenTies22, groupPlaces22 | tipos e estado explícitos; sem import externo | `m22_simulation.test.ts` |
| `crates/simulation/src/stages.rs` | `src/m22/simulation/stages.ts` | defaultStageOptions22, selectedLeagueClubs22 | tipos e estado explícitos; sem import externo | `m22_simulation.test.ts` |
| `crates/simulation/src/titles.rs` | `src/m22/simulation/titles.ts` | nationalTeamsKind22, competitionDivision22, topScorer22 | tipos e estado explícitos; sem import externo | `m22_simulation.test.ts` |
| `crates/simulation/src/world_cup_qualifiers.rs` | `src/m22/simulation/world_cup_qualifiers.ts` | confederationTeams22 | tipos e estado explícitos; sem import externo | `m22_simulation.test.ts` |
| `crates/simulation/src/youth.rs` | `src/m22/simulation/youth.ts` | generatedPlayerYear22 | tipos e estado explícitos; sem import externo | `m22_simulation.test.ts` |

## Crate `systems`

| Rust | TypeScript | Funções exportadas | Dependências | Testes |
|---|---|---|---|---|
| `crates/systems/src/academy.rs` | `src/m22/systems/academy.ts` | academyCurve22, academyTargetStrength22, academyPotential22, academyNthBest22 | tipos e estado explícitos; sem import externo | `m22_systems.test.ts` |
| `crates/systems/src/assets.rs` | `src/m22/systems/assets.ts` | pillarUpkeep22, sectorLimits22, assetSectorCost22, assetWorkDays22, academyTarget22 | tipos e estado explícitos; sem import externo | `m22_systems.test.ts` |
| `crates/systems/src/awards/hall_of_fame.rs` | `src/m22/systems/award_hall_of_fame.ts` | hallIsLegend22, hallWorthTracking22, hallGreatness22 | tipos e estado explícitos; sem import externo | `m22_systems.test.ts` |
| `crates/systems/src/awards/season.rs` | `src/m22/systems/award_season.ts` | seasonPlayerKey22, weightedGoals22, goldenBoyEligible22 | tipos e estado explícitos; sem import externo | `m22_systems.test.ts` |
| `crates/systems/src/credit.rs` | `src/m22/systems/credit.ts` | CREDIT_RATE22, CREDIT_LEVERAGE22, baseCreditRate22, leverage22, ratingDown22 | tipos e estado explícitos; sem import externo | `m22_systems.test.ts` |
| `crates/systems/src/economy.rs` | `src/m22/systems/economy.ts` | economyYear22, aiClubs22, leagueWeight22 | tipos e estado explícitos; sem import externo | `m22_systems.test.ts` |
| `crates/systems/src/lib.rs` | `src/m22/systems/lib.ts` | STATIC_RANDOM_CLASSES22, staticRandomSeed22 | tipos e estado explícitos; sem import externo | `m22_systems.test.ts` |
| `crates/systems/src/loans.rs` | `src/m22/systems/loans.ts` | loanOf22, loanSeasonNumbers22, loanFee22, loanAgainstOwnerFine22 | tipos e estado explícitos; sem import externo | `m22_systems.test.ts` |
| `crates/systems/src/market.rs` | `src/m22/systems/market.ts` | MARKET_STARTERS22, marketScale22, marketStartersAverage22, marketBuyers22 | tipos e estado explícitos; sem import externo | `m22_systems.test.ts` |
| `crates/systems/src/news.rs` | `src/m22/systems/news.ts` | monthlyTick22 | tipos e estado explícitos; sem import externo | `m22_systems.test.ts` |
| `crates/systems/src/performance.rs` | `src/m22/systems/performance.ts` | playedMatches22 | tipos e estado explícitos; sem import externo | `m22_systems.test.ts` |
| `crates/systems/src/satellites.rs` | `src/m22/systems/satellites.ts` | sameDivision22, partnershipFee22, satelliteSquadValue22 | tipos e estado explícitos; sem import externo | `m22_systems.test.ts` |
| `crates/systems/src/sponsors.rs` | `src/m22/systems/sponsors.ts` | masterSponsorBase22, sponsorEarlyFine22, sponsorSlotsYearly22 | tipos e estado explícitos; sem import externo | `m22_systems.test.ts` |
| `crates/systems/src/stadiums.rs` | `src/m22/systems/stadiums.ts` | stadiumLegends22 | tipos e estado explícitos; sem import externo | `m22_systems.test.ts` |
| `crates/systems/src/super_mundial.rs` | `src/m22/systems/super_mundial.ts` | superMundialEdition22, nextSuperMundial22 | tipos e estado explícitos; sem import externo | `m22_systems.test.ts` |
| `crates/systems/src/windows.rs` | `src/m22/systems/windows.ts` | windowOfDay22, nextOpening22 | tipos e estado explícitos; sem import externo | `m22_systems.test.ts` |
| `crates/systems/src/youth_league.rs` | `src/m22/systems/youth_league.ts` | youthTotalRounds22, youthRoundsPlayed22, youthGamesPlayed22, youthGoalDifference22 | tipos e estado explícitos; sem import externo | `m22_systems.test.ts` |

## Guia de correção e testes

1. Abra o `.ts`: o JSDoc documenta responsabilidade, Rust de origem, entradas, dependências e efeitos. Compare com o arquivo no diretório `upstream/` e cheque `docs/M22_SOURCE_MANIFEST.json`.
2. Reproduza `python3 tools/m22_generate_schemas.py --check` e `python3 tools/m22_audit.py`. Essas rotas falham ao encontrar dados gerados divergentes ou fontes alteradas.
3. Rode `npm run build`, depois o teste M22 específico e `npm test`. Para mudanças na engine, execute a suíte de regressão inteira, não somente os testes da nova função.
4. Não transforme uma falha de integração num placeholder. Os `World`/`ModSystems` do Rust e os formatos `.bfn` inteiros continuam dependências não resolvidas.
5. Ao modificar um contrato de produção, adicione um teste regressivo e atualize `CONTRACTS_M22.md`, `DEPENDENCY_MATRIX_M22.md`, `TRACEABILITY_MATRIX_M22.md` e `KNOWN_ISSUES_M22.md`.

## Lacunas de paridade conhecidas

- `persistence/native.ts` decodifica **apenas o frame de metadados** `.bfn`, não o payload CBOR compactado em Zstandard.
- `persistence/kryo_canonical.ts` fornece um dump diagnóstico de objetos JS, não texto diferencial byte a byte idêntico ao `write_canonical` Rust.
- `model/saved.ts`, `model/canonical_generated.ts`, `persistence/import_generated.ts` são **mapeamentos reais de campos** (37, 37 e 35 tipos), mas não serializadores completos.
- `simulation` inclui seleção, ordens e decisões puras; ainda não aciona automaticamente todos os side effects no `World` Rust.
- `engine/engine.ts` porta pesos e seleção aleatória, não a simulação completa dos 90 minutos.
- Testes diferenciais Rust→TS não executados (Cargo indisponível); `WASM` original não conta como TypeScript.
