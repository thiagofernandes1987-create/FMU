# FMU M28 — Guia funcional de modelos, calendário, mercado e World `.bfn`

## Proveniência e escopo

Fontes Rust: snapshot Brasfoot Next `bd2ccbdd`, base M27 Git `97523f9`. Quatro arquivos **já parcialmente mapeados** foram aprofundados. Não foram declaradas novas fontes Rust integralmente equivalentes. A carreira Rust inteira, renderização das telas e simulação diferencial permanecem fora do escopo deste incremento.

## 1. `src/m28/save_numbers.ts`

Origem: `crates/model/src/save_numbers.rs`. Dependências: `RustWorld`/`WorldDocument` M27, CBOR M26, `worldTransaction` copy-on-write.

| Função | Entrada → saída | Efeitos e invariantes | Evidência |
|---|---|---|---|
| `numberPlayersForSave` | World → contagens | Principais primeiro, base depois; números consecutivos; aposentados mantêm o antigo número; históricos registram `player_number/list` | `m28_save_numbers` |
| `indexPlayersBySaveNumber` | World → Map | Primeiro jogador por par (list,number) vence; duplicatas não substituem referência | idem |
| `relinkTransfersFromSaveNumbers` | World → contagem | Zera TODOS os vínculos transitórios e reconecta por número; históricos sem substituto ficam com `player=null` | idem |
| `relinkOneTransfer` | World+índice → bool | Busca em uma lista sem zerar vínculo quando não existe correspondente | idem |
| `calendarCompetitions` | World → índices | Ordem da primeira aparição, sem IDs inventados | idem |
| `numberCompetitionsForSave` | World → contagens | Grava legacy IDs pela agenda; popula `competition_number`, zera transient refs e liga novamente | idem |
| `linkCompetitionStats` | World → contagem | Em números duplicados prevalece **a primeira competição do calendário** (a iteração invertida do Rust sobrescreve pela anterior) | idem |
| `prepareWorldForSave` | WorldDocument → WorldDocument | Cópia validada; erro não muda a origem; pronta para `writeBfnWorldAtomic` | idem |

Os casos dos testes Rust `a_retired_players_transfer_shows_who_took_his_number` e `a_player_never_saved_leaves_his_transfer_empty` foram transpostos para testes TS. A ausência do executável `cargo` impede a comparação diferencial em tempo de execução.

## 2. `src/m28/world_finances.ts`

Origem: `crates/model/src/world.rs`: `club_wages`, `club_income`, `club_payment`, `club_expense`. IDs de clube/jogador são índices reais das arenas. Usa `bigint` para cash, transferências e salários i64, com checagem de overflow e i32 nas outras rubricas. Funciona sobre `RustWorld` e altera o objeto que receber: consumidores devem invocá-lo **dentro de `worldTransaction`** se precisarem de rollback. Não cria taxas do Tesouro FMU que não existem nessas funções Rust.

## 3. `src/m28/world_calendar.ts`

Origem: `crates/simulation/src/game.rs`.

| Função | Regra Rust/alteração proposital | Efeitos |
|---|---|---|
| `findNextPlayableDay` | Próximo dia não concluído, `kind > 0` com jogos; retorna ID em vez de mutar `game.day` (segurança) | Nenhum |
| `firstWaitingHumanLineup` | Primeiro time humano sem escalação confirmada no dia | Nenhum |
| `worldMatchKind` | `competition.kind` se existir; caso contrário, zero | Nenhum |
| `playsWorldMatchInMonth` | Mês via hook do relógio do jogo; não usa o mês do host | Nenhum |
| `inspectWorldDay` | Agenda, times, estado, eventos, tarefas, índice e flag de conclusão | Nenhum; **não** executa `after_match`, `league_round` ou `ModSystems` |

`eligibleForAfterDay=true` significa que os matches já têm `played=true`; **não** significa que processar apenas o cursor seja suficiente para avançar a carreira real.

## 4. `src/m28/world_transfer.ts`

Origem: `crates/simulation/src/market.rs::move_player`, `crates/model/src/world.rs`.

`transferWorldPlayer(WorldDocument, playerId, buyerId, fee, {dateFields})` devolve `WorldDocument` novo; nenhum save de origem é alterado. Transfere o atleta, limpa camisa/listagem/capitão/cobrador, estende contrato por 180 dias desde a data, registra a movimentação com data e taxas Rust (contabiliza a transação **apenas** para clubes humanos nessa rotina Rust). Rejeita transferência de humano para humano por se tratar de `unported!` na fonte. Guardas de segurança adicionais: capacidade 35, caixa suficiente, atletas de base e emprestados exigem rotinas dedicadas, seleção nacional não é clube vendedor ou comprador.

**Limitação:** não completa negociação, proposta de salário, reposição do elenco, loan flow ou leilões. Por isso, esta função não deve ser apresentada como engine de mercado completo ou como sistema econômico FMU com Tesouro/antifraude.

## 5. `src/m28/world_audit.ts`, `career_world.ts`, `world_cli.ts`

- `auditWorldSemantics`: verificação separada do Serde, com erros para referências inválidas, dupla propriedade, atletas duplicados e cursor inválido. Permite inscrições de seleções nacionais e sinaliza divergência atleta↔elenco como **warning** (empréstimo/transição podem explicá-la).
- `openCareerWorld`: M27 Zstd/CBOR → validação completa → reconstrução transitória por save number → auditoria; falha em incoerência forte, sem inventar dados de carreira.
- `persistCareerWorld`: copy-on-write → numeração → auditoria → writer M27 com `fsync` e backups → reabertura → verificação de tamanhos das arenas.
- CLI: `inspect-day` e `audit` (leitura) ou `prepare-save entrada.bfn saida.bfn` (escrita **somente em caminho distinto**).

```bash
npm run build
npm run m28:tests
npm test
npm run m27:audit
node dist/src/m28/world_cli.js audit ./minha-carreira.bfn
node dist/src/m28/world_cli.js inspect-day ./minha-carreira.bfn
node dist/src/m28/world_cli.js prepare-save ./minha-carreira.bfn ./nova-copia.bfn
```

## Critérios de release e limites

- Testes automatizados sintéticos não são fixtures geradas pelo executável original. Nenhum teste `Rust vs TS` completo de mundo, temporada, mercado ou engine foi realizado.
- A compatibilidade da vida real continua `UNVERIFIED` até um save `.bfn` verdadeiro com várias temporadas, importação real `.s22`, confirmação de calendário, end-season e ModSystems.
- Cobertura **nominal** segue 211/231 (91,34%); restam 20 testes/exemplos sem port demonstrável. O avanço M28 é **profundidade funcional**, não aumento numérico de mapeamentos.
