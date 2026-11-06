# Contratos M20

| Componente | Entradas → Saídas | Invariantes | Efeitos | Regressões |
|---|---|---|---|---|
| Rust tables generator | Rust const → TS const | nomes/valores exatos; SHA da fonte | grava `.ts` apenas quando solicitado | `--check`, m20_engine |
| systems.config | texto → ModConfig | ausente = ligado, `0` desliga; último valor prevalece | apenas Map privado | m20_systems/config |
| systems.cash | DTO i64 e Clock → CashBook/flows | bigint, 5 receitas +6 despesas, 400 dias | muta book ao tick | m20_systems/cash |
| systems.staff | estado, RNG → candidatos/nível | 3 cargos×3, nível 1–5, comissão segue técnico | muda elenco de staff, despesa por callback | m20_systems/staff |
| systems.scouts | ScoutContext → relatório | 3 simultâneos, 14 dias, hash determinístico | desconta somente após validações | m20_systems/scouts |
| systems.fans | elenco, coach → FanState | clamp 0..100, últimos 10 motivos, não confundir empréstimo/venda | fanSupport, receita via callback | m20_systems/fans |
| systems.investor | investidores, RNG, relógio → oferta/decisão | chance 15%, duas temporadas ruins, aportes anuais | Owner por callback | m20_systems/investor |
| engine.clubs | clube, jogadores → ID/None | batedor deve estar no clube, exceção seleção convocada | remove referência obsoleta | m20_engine/clubs |
| engine.events | player stats → stats | lazy por competição e (temporada, clube), assistências só fora da base | muta stats | m20_engine/events |
| engine.messages | inbox, data, ID, texto → mensagem | valor de multa 10%, mensagens de títulos | append na inbox | m20_engine/messages |
| engine.injury | player, RNG, calendário → dias | sorteios em ordem 14/20/100, mensagens por duração | lesão, stats, força, inbox | m20_engine/injury |
| simulation.fixtures | World/RNG + dia → jogo | índices de dia, planos táticos e estádio da final | agenda e pools RNG | m20_simulation |
| simulation.fixture_schedule | ID[] e tabela → partidas | 3/4/5/6/9/11/25, sem auto-confronto | puro | m20_engine/fixtures |
| model.names | leitor UTF-8, ID país → nomes[] | cache 221/223→85, 222→72, sem entradas artificiais | cache local | m20_engine/names |
