# FMU M29 — funções, contratos e dependências

**Origem canônica Rust:** `crates/simulation/src/game.rs` (`advance`, `human_waiting`, `after_day`, `day_task`, `next_day`), `crates/simulation/src/matchday.rs` (`pick_ai_lineups`, `play_today`, `after_match`) e `crates/model/src/player.rs` (`recover_between_matches`). São ports de rotas específicas, não paridade global.

## `src/m29_world_advance.ts`

| Função | Entrada → saída | Fonte/semântica | Dependências | Garantia/teste |
|---|---|---|---|---|
| `advanceWorldOneDay` | `WorldDocument`, `WorldAdvanceHooks` → `WorldAdvanceResult` | Máquina de rodada Rust. Espera escalação humana, invoca motor externo, pós-jogo, recuperação, tabela, tarefas, mercado e encerra calendário | `worldTransaction`, `world_calendar`, `world_finances`, `world_audit`, hooks | Transação em cópia; só faz commit após validação. 43 testes novos combinados |
| `recoverWorldPlayer` | `RustWorld`, `PlayerId`, `humanClub` → void | `Player::recover_between_matches`; faixas por idade e `started_recently`; máximo 100 | arena `players` | Faixas 20/25/31/36, jovens e inativos |
| `recoverWorldRoster` | `RustWorld`, `kind` → void | Recupera `game.players`, juvenis 100 e seleções nacionais em dias 7/9 | `recoverWorldPlayer`, `game.countries` | Placar não modificado; valida IDs |
| `runWorldDayTask` | `World`, código, dia origem, após, hooks → void | `ds`=salário, `dJ`=juros, `aj`=evolução delegada, códigos agendados | `worldClubWages`, `worldClubExpense`, `worldClubPayment`, `hooks.monthOf` | i64 exact, overflow bloqueia, task desconhecida exige hook |
| `drainTasks` | `World`, ordem, limite, hooks, log → void | Usa ordem definida pelo `game.rs`, retira tarefas de dias até cursor | `runWorldDayTask` | Não apaga tasks se transação falhar |
| `needs`, `int`, `index`, `refs` | tipos/IDs → validação | Guardas para dependências e referências | estruturas CBOR | Sem defaults silenciosos; descarta duplicações |

### Dependências obrigatórias de `WorldAdvanceHooks`

- `playMatch`: necessário para partidas não disputadas. O callback deve registrar um resultado válido e `played=true`.
- `pickAiLineup`: exigido para partidas de IA com `lineup_set=false`.
- `afterMatch`: necessário para todas as partidas do dia, inclusive as já registradas. **Um callback vazio não comprova pós-jogo Rust.**
- `processStage`, `teamOfRound`, `coachChanges`: exigidos quando existem estágios nacionais ou jogos de liga/estaduais.
- `processTask`, `evolvePlayers`: requeridos para tarefas não implementadas localmente.
- `returnLoans`, `finishStadiumWorks`, `sellListed`, `endSeason`: exigidos quando seu evento ocorre.
- `draw100` e `monthOf`: RNG e tempo vêm do runtime, não são reproduzidos por `Math.random()` ou relógio de sistema. **Consumo do RNG externo NÃO participa do rollback.**

## `src/m29_world_driver.ts`

| Função | Entrada → saída | Dependência | Contrato |
|---|---|---|---|
| `assessWorldAdvance` | `WorldDocument` → `AdvanceReadiness` | `world_calendar`, `bfn_world` | Inspeção pura dos bloqueios e callbacks necessários; não altera World nem usa RNG |
| `advanceWorldDays` | documento, hooks, `maxDays=1..1000` → `AdvanceBatchResult` | `advanceWorldOneDay` | Rodadas em memória; se qualquer dia falhar, *não retorna* alterações parciais e a entrada permanece intacta; pausa de humano é explícita |
| `persistAdvancedBatch` | arquivo .bfn, batch → path/bytes/World reaberto | `m28/career_world` | Recusa batch sem dias concluídos ou pausado; grava com atomicidade/backups e reabre para validar |

## `src/m29_world_cli.ts`

- `runM29WorldCli(['inspect','/path/game.bfn'])`: importa via `loadBfnWorld`, audita com `auditWorldSemantics`, usa `assessWorldAdvance` e produz diagnóstico. *Somente leitura*. Comandos de edição/avanço pelo terminal são recusados: a engine externa e a confirmação explícita de partida ainda não estão disponíveis.

## Riscos e limites

1. Os hooks são transacionais **apenas para os campos dentro do clone do World**. Efeitos em sistemas externos, RNG, banco de dados ou rede não podem ser revertidos pela implementação.
2. As regras completas de resultados, árbitro, estádio, cartões, contagem e custos dependem de módulos Rust não portados integralmente; a máquina **não preenche essas lacunas com resultados fictícios**.
3. O término de calendário chama o hook de fim de temporada e marca `season_over`; gerar a temporada seguinte permanece fora do escopo funcional validado.
4. Os testes usam `World` sintético conforme o schema. Não foi fornecido um save oficial real jogável do Brasfoot Next, nem o conjunto original de golden fixtures para comparação.
5. Preservação de inteiros CBOR: inteiros dentro de `Number.MAX_SAFE_INTEGER` podem ser decodificados como `number`, e números maiores como `bigint`; o valor e a identidade das referências numéricas são preservados, não o tipo JS original.

## Reproduzir

```bash
npm run m29:tests  # 43/43 testes novos
npm test          # 612/612, incluindo 569 anteriores
npm run m27:audit # 231 hashes, 89 structs e 956 campos
```

**QA visual:** não aplicável (nenhuma alteração no frontend). **Rust differential parity:** UNVERIFIED.
