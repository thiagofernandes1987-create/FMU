# Contratos de componentes M19

| Contrato | Origem Rust | Implementação TypeScript | Entradas / Saídas | Invariantes | Efeitos | Testes |
|---|---|---|---|---|---|---|
| M19-SIM-01 | simulation/cup.rs | `src/simulation/cup.ts` | `CupState`, `Rng`, `ClubResolver` → `CupRound?` | 40 → 20x20; 32 → 16x16; sem clube duplicado | Atualiza vencedores/rodada | Cup tests |
| M19-SIM-02 | simulation/nations.rs | `src/simulation/nations.ts` | grupos/competição → ID estágio | 4 líderes, 4 rebaixados, bracket Zw de 16/32 | `newKnockout*` externo; referência à fase | Nations tests |
| M19-SIM-03 | simulation/human/mod.rs | `src/simulation/human_default.ts` | decisão opcional → resposta | Padrão sem mudar estado | Nenhum | Human tests |
| M19-SIM-04 | simulation/human/substitutions.rs | `src/simulation/human_substitutions.ts` | grid 37 posições + engine callback → bool | Substituição autorizada só aplica após retorno true | Slots e grid | Substitution tests |
| M19-SIM-05 | simulation/trophy.rs | `src/simulation/trophy.ts` | catálogos e títulos → imagens/galerias | 27 UFs; 16 cartões clube; 3 colunas técnico | Nenhum | Trophy tests |
| M19-SIM-06 | simulation/season.rs | `src/simulation/season.ts` | ratings, temporadas, players → registros | 11 slots, mínimo de avaliações, WorldClass por país | Flags e registros | Season tests |
| M19-SIM-07 | simulation/sorting.rs | `src/simulation/sorting.ts` | tabelas, clubes e coaches → comparações | Empate preserva estabilidade, usa tiebreakNumber | Nenhum | Sorting tests |
| M19-SYS-01 | systems/awards/coaches.rs | `src/systems/award_coaches.ts` | classificação e títulos → ranking | Esperado por média dos 16 melhores, títulos e peso | Nenhum | Coach tests |
| M19-SYS-02 | systems/awards/history.rs | `src/systems/award_history.ts` | SeasonAwardsInput → AwardEntry[] | Substitui categoria só com replace; ordena ano/tipo | Lista de prêmios | Awards tests |
| M19-SYS-03 | systems/awards/mod.rs | `src/systems/award_lifecycle.ts` | ciclo/13 callbacks → bool | Mesma temporada executa uma vez; ordem fixa | Hook chain | Lifecycle tests |
| M19-SYS-04 | systems/awards/clubs.rs | `src/systems/award_clubs.ts` | temporadas, players, idols → históricos | Top 10 gols + top 10 jogos; record por temporada | Atualiza histórico/idols | Club awards tests |

**Compatibilidade:** IDs TypeScript são strings estáveis; o World original Rust usa arena tipada. Hooks precisam ser ligados no app M18 após receber seu código-fonte. As 11 fontes não equivalem à migração integral dos 88 arquivos dos dois crates.
