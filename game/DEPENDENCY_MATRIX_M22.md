# DEPENDENCY_MATRIX M22

| Componente | depends_on | used_by | Contrato | Impacto | Regressão |
|---|---|---|---|---|---|
| `src/m22/datapack/database.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-001/v1 | datapack e dependentes | `m22_lowlevel` |
| `src/m22/datapack/legacy.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-002/v1 | datapack e dependentes | `m22_lowlevel` |
| `src/m22/datapack/pack.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-003/v1 | datapack e dependentes | `m22_lowlevel` |
| `src/m22/datapack/read.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-004/v1 | datapack e dependentes | `m22_lowlevel` |
| `src/m22/engine/engine.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-005/v1 | engine e dependentes | `m22_wave_fg` |
| `src/m22/engine/lineup.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-006/v1 | engine e dependentes | `m22_wave_fg` |
| `src/m22/engine/simulate.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-007/v1 | engine e dependentes | `m22_wave_fg` |
| `src/m22/engine/tactics.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-008/v1 | engine e dependentes | `m22_wave_fg` |
| `src/m22/engine/value.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-009/v1 | engine e dependentes | `m22_wave_fg` |
| `src/m22/i18n/labels.ts` | ./lib | consumidores `src/m22/index.ts`, testes | CT-M22-010/v1 | i18n e dependentes | `m22_lowlevel` |
| `src/m22/i18n/lib.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-011/v1 | i18n e dependentes | `m22_lowlevel` |
| `src/m22/model/canonical.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-012/v1 | model e dependentes | `m22_wave_de / m22_wave_fg` |
| `src/m22/model/canonical_generated.ts` | ./canonical_fields.generated | consumidores `src/m22/index.ts`, testes | CT-M22-013/v1 | model e dependentes | `m22_wave_de / m22_wave_fg` |
| `src/m22/model/clock.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-014/v1 | model e dependentes | `m22_lowlevel` |
| `src/m22/model/mods.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-015/v1 | model e dependentes | `m22_lowlevel` |
| `src/m22/model/player.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-016/v1 | model e dependentes | `m22_lowlevel` |
| `src/m22/model/rng.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-017/v1 | model e dependentes | `m22_lowlevel` |
| `src/m22/model/save_numbers.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-018/v1 | model e dependentes | `m22_lowlevel` |
| `src/m22/model/saved.ts` | ./saved_fields.generated | consumidores `src/m22/index.ts`, testes | CT-M22-019/v1 | model e dependentes | `m22_wave_de / m22_wave_fg` |
| `src/m22/persistence/game_data.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-020/v1 | persistence e dependentes | `m22_wave_de / m22_wave_fg` |
| `src/m22/persistence/import_context.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-021/v1 | persistence e dependentes | `m22_wave_de / m22_wave_fg` |
| `src/m22/persistence/import_generated.ts` | ./import_generated.fields | consumidores `src/m22/index.ts`, testes | CT-M22-022/v1 | persistence e dependentes | `m22_lowlevel` |
| `src/m22/persistence/javaser.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-023/v1 | persistence e dependentes | `m22_wave_de / m22_wave_fg` |
| `src/m22/persistence/kryo_canonical.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-024/v1 | persistence e dependentes | `m22_wave_de / m22_wave_fg` |
| `src/m22/persistence/kryo_graph.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-025/v1 | persistence e dependentes | `m22_lowlevel` |
| `src/m22/persistence/kryo_input.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-026/v1 | persistence e dependentes | `m22_lowlevel` |
| `src/m22/persistence/kryo_mod.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-027/v1 | persistence e dependentes | `m22_wave_de / m22_wave_fg` |
| `src/m22/persistence/kryo_reader.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-028/v1 | persistence e dependentes | `m22_wave_de / m22_wave_fg` |
| `src/m22/persistence/kryo_schema.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-029/v1 | persistence e dependentes | `m22_lowlevel` |
| `src/m22/persistence/migrations.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-030/v1 | persistence e dependentes | `m22_wave_de / m22_wave_fg` |
| `src/m22/persistence/native.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-031/v1 | persistence e dependentes | `m22_wave_de / m22_wave_fg` |
| `src/m22/simulation/coach_market.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-032/v1 | simulation e dependentes | `m22_simulation` |
| `src/m22/simulation/coaches.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-033/v1 | simulation e dependentes | `m22_simulation` |
| `src/m22/simulation/continental.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-034/v1 | simulation e dependentes | `m22_wave_fg` |
| `src/m22/simulation/evolution.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-035/v1 | simulation e dependentes | `m22_simulation` |
| `src/m22/simulation/game.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-036/v1 | simulation e dependentes | `m22_wave_fg` |
| `src/m22/simulation/human_lineup.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-037/v1 | simulation e dependentes | `m22_simulation` |
| `src/m22/simulation/human_purchase.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-038/v1 | simulation e dependentes | `m22_simulation` |
| `src/m22/simulation/knockout.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-039/v1 | simulation e dependentes | `m22_simulation` |
| `src/m22/simulation/league.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-040/v1 | simulation e dependentes | `m22_simulation` |
| `src/m22/simulation/market.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-041/v1 | simulation e dependentes | `m22_wave_fg` |
| `src/m22/simulation/matchday.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-042/v1 | simulation e dependentes | `m22_simulation` |
| `src/m22/simulation/national_cups.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-043/v1 | simulation e dependentes | `m22_wave_fg` |
| `src/m22/simulation/national_teams.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-044/v1 | simulation e dependentes | `m22_simulation` |
| `src/m22/simulation/new_game.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-045/v1 | simulation e dependentes | `m22_wave_fg` |
| `src/m22/simulation/new_season.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-046/v1 | simulation e dependentes | `m22_wave_fg` |
| `src/m22/simulation/player_gen.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-047/v1 | simulation e dependentes | `m22_simulation` |
| `src/m22/simulation/player_search.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-048/v1 | simulation e dependentes | `m22_simulation` |
| `src/m22/simulation/second_tiers.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-049/v1 | simulation e dependentes | `m22_simulation` |
| `src/m22/simulation/stages.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-050/v1 | simulation e dependentes | `m22_simulation` |
| `src/m22/simulation/titles.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-051/v1 | simulation e dependentes | `m22_simulation` |
| `src/m22/simulation/world_cup_qualifiers.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-052/v1 | simulation e dependentes | `m22_simulation` |
| `src/m22/simulation/youth.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-053/v1 | simulation e dependentes | `m22_simulation` |
| `src/m22/systems/academy.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-054/v1 | systems e dependentes | `m22_systems` |
| `src/m22/systems/assets.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-055/v1 | systems e dependentes | `m22_systems` |
| `src/m22/systems/award_hall_of_fame.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-056/v1 | systems e dependentes | `m22_systems` |
| `src/m22/systems/award_season.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-057/v1 | systems e dependentes | `m22_systems` |
| `src/m22/systems/credit.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-058/v1 | systems e dependentes | `m22_systems` |
| `src/m22/systems/economy.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-059/v1 | systems e dependentes | `m22_systems` |
| `src/m22/systems/lib.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-060/v1 | systems e dependentes | `m22_systems` |
| `src/m22/systems/loans.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-061/v1 | systems e dependentes | `m22_systems` |
| `src/m22/systems/market.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-062/v1 | systems e dependentes | `m22_systems` |
| `src/m22/systems/news.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-063/v1 | systems e dependentes | `m22_systems` |
| `src/m22/systems/performance.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-064/v1 | systems e dependentes | `m22_systems` |
| `src/m22/systems/satellites.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-065/v1 | systems e dependentes | `m22_systems` |
| `src/m22/systems/sponsors.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-066/v1 | systems e dependentes | `m22_systems` |
| `src/m22/systems/stadiums.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-067/v1 | systems e dependentes | `m22_systems` |
| `src/m22/systems/super_mundial.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-068/v1 | systems e dependentes | `m22_systems` |
| `src/m22/systems/windows.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-069/v1 | systems e dependentes | `m22_systems` |
| `src/m22/systems/youth_league.ts` | tipos e estado explícitos; sem import externo | consumidores `src/m22/index.ts`, testes | CT-M22-070/v1 | systems e dependentes | `m22_systems` |
