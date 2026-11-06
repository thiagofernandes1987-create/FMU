# TRACEABILITY M22 — fonte → implementação → teste

| Requisito | Fonte Rust | Componente TS | Teste/QA | Estado |
|---|---|---|---|---|
| R-M22-001 | `crates/datapack/src/database.rs` | `src/m22/datapack/database.ts` | `m22_lowlevel` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-002 | `crates/datapack/src/legacy.rs` | `src/m22/datapack/legacy.ts` | `m22_lowlevel` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-003 | `crates/datapack/src/pack.rs` | `src/m22/datapack/pack.ts` | `m22_lowlevel` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-004 | `crates/datapack/src/read.rs` | `src/m22/datapack/read.ts` | `m22_lowlevel` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-005 | `crates/engine/src/engine.rs` | `src/m22/engine/engine.ts` | `m22_wave_fg` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-006 | `crates/engine/src/lineup.rs` | `src/m22/engine/lineup.ts` | `m22_wave_fg` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-007 | `crates/engine/src/simulate.rs` | `src/m22/engine/simulate.ts` | `m22_wave_fg` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-008 | `crates/engine/src/tactics.rs` | `src/m22/engine/tactics.ts` | `m22_wave_fg` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-009 | `crates/engine/src/value.rs` | `src/m22/engine/value.ts` | `m22_wave_fg` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-010 | `crates/i18n/src/labels.rs` | `src/m22/i18n/labels.ts` | `m22_lowlevel` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-011 | `crates/i18n/src/lib.rs` | `src/m22/i18n/lib.ts` | `m22_lowlevel` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-012 | `crates/model/src/canonical.rs` | `src/m22/model/canonical.ts` | `m22_wave_de / m22_wave_fg` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-013 | `crates/model/src/canonical_generated.rs` | `src/m22/model/canonical_generated.ts` | `m22_wave_de / m22_wave_fg` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-014 | `crates/model/src/clock.rs` | `src/m22/model/clock.ts` | `m22_lowlevel` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-015 | `crates/model/src/mods.rs` | `src/m22/model/mods.ts` | `m22_lowlevel` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-016 | `crates/model/src/player.rs` | `src/m22/model/player.ts` | `m22_lowlevel` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-017 | `crates/model/src/rng.rs` | `src/m22/model/rng.ts` | `m22_lowlevel` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-018 | `crates/model/src/save_numbers.rs` | `src/m22/model/save_numbers.ts` | `m22_lowlevel` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-019 | `crates/model/src/saved.rs` | `src/m22/model/saved.ts` | `m22_wave_de / m22_wave_fg` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-020 | `crates/persistence/src/game_data.rs` | `src/m22/persistence/game_data.ts` | `m22_wave_de / m22_wave_fg` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-021 | `crates/persistence/src/import/context.rs` | `src/m22/persistence/import_context.ts` | `m22_wave_de / m22_wave_fg` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-022 | `crates/persistence/src/import/generated.rs` | `src/m22/persistence/import_generated.ts` | `m22_lowlevel` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-023 | `crates/persistence/src/javaser.rs` | `src/m22/persistence/javaser.ts` | `m22_wave_de / m22_wave_fg` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-024 | `crates/persistence/src/kryo/canonical.rs` | `src/m22/persistence/kryo_canonical.ts` | `m22_wave_de / m22_wave_fg` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-025 | `crates/persistence/src/kryo/graph.rs` | `src/m22/persistence/kryo_graph.ts` | `m22_lowlevel` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-026 | `crates/persistence/src/kryo/input.rs` | `src/m22/persistence/kryo_input.ts` | `m22_lowlevel` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-027 | `crates/persistence/src/kryo/mod.rs` | `src/m22/persistence/kryo_mod.ts` | `m22_wave_de / m22_wave_fg` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-028 | `crates/persistence/src/kryo/reader.rs` | `src/m22/persistence/kryo_reader.ts` | `m22_wave_de / m22_wave_fg` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-029 | `crates/persistence/src/kryo/schema.rs` | `src/m22/persistence/kryo_schema.ts` | `m22_lowlevel` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-030 | `crates/persistence/src/migrations.rs` | `src/m22/persistence/migrations.ts` | `m22_wave_de / m22_wave_fg` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-031 | `crates/persistence/src/native.rs` | `src/m22/persistence/native.ts` | `m22_wave_de / m22_wave_fg` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-032 | `crates/simulation/src/coach_market.rs` | `src/m22/simulation/coach_market.ts` | `m22_simulation` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-033 | `crates/simulation/src/coaches.rs` | `src/m22/simulation/coaches.ts` | `m22_simulation` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-034 | `crates/simulation/src/continental.rs` | `src/m22/simulation/continental.ts` | `m22_wave_fg` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-035 | `crates/simulation/src/evolution.rs` | `src/m22/simulation/evolution.ts` | `m22_simulation` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-036 | `crates/simulation/src/game.rs` | `src/m22/simulation/game.ts` | `m22_wave_fg` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-037 | `crates/simulation/src/human/lineup.rs` | `src/m22/simulation/human_lineup.ts` | `m22_simulation` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-038 | `crates/simulation/src/human/purchase.rs` | `src/m22/simulation/human_purchase.ts` | `m22_simulation` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-039 | `crates/simulation/src/knockout.rs` | `src/m22/simulation/knockout.ts` | `m22_simulation` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-040 | `crates/simulation/src/league.rs` | `src/m22/simulation/league.ts` | `m22_simulation` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-041 | `crates/simulation/src/market.rs` | `src/m22/simulation/market.ts` | `m22_wave_fg` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-042 | `crates/simulation/src/matchday.rs` | `src/m22/simulation/matchday.ts` | `m22_simulation` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-043 | `crates/simulation/src/national_cups.rs` | `src/m22/simulation/national_cups.ts` | `m22_wave_fg` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-044 | `crates/simulation/src/national_teams.rs` | `src/m22/simulation/national_teams.ts` | `m22_simulation` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-045 | `crates/simulation/src/new_game.rs` | `src/m22/simulation/new_game.ts` | `m22_wave_fg` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-046 | `crates/simulation/src/new_season.rs` | `src/m22/simulation/new_season.ts` | `m22_wave_fg` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-047 | `crates/simulation/src/player_gen.rs` | `src/m22/simulation/player_gen.ts` | `m22_simulation` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-048 | `crates/simulation/src/player_search.rs` | `src/m22/simulation/player_search.ts` | `m22_simulation` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-049 | `crates/simulation/src/second_tiers.rs` | `src/m22/simulation/second_tiers.ts` | `m22_simulation` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-050 | `crates/simulation/src/stages.rs` | `src/m22/simulation/stages.ts` | `m22_simulation` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-051 | `crates/simulation/src/titles.rs` | `src/m22/simulation/titles.ts` | `m22_simulation` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-052 | `crates/simulation/src/world_cup_qualifiers.rs` | `src/m22/simulation/world_cup_qualifiers.ts` | `m22_simulation` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-053 | `crates/simulation/src/youth.rs` | `src/m22/simulation/youth.ts` | `m22_simulation` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-054 | `crates/systems/src/academy.rs` | `src/m22/systems/academy.ts` | `m22_systems` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-055 | `crates/systems/src/assets.rs` | `src/m22/systems/assets.ts` | `m22_systems` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-056 | `crates/systems/src/awards/hall_of_fame.rs` | `src/m22/systems/award_hall_of_fame.ts` | `m22_systems` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-057 | `crates/systems/src/awards/season.rs` | `src/m22/systems/award_season.ts` | `m22_systems` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-058 | `crates/systems/src/credit.rs` | `src/m22/systems/credit.ts` | `m22_systems` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-059 | `crates/systems/src/economy.rs` | `src/m22/systems/economy.ts` | `m22_systems` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-060 | `crates/systems/src/lib.rs` | `src/m22/systems/lib.ts` | `m22_systems` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-061 | `crates/systems/src/loans.rs` | `src/m22/systems/loans.ts` | `m22_systems` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-062 | `crates/systems/src/market.rs` | `src/m22/systems/market.ts` | `m22_systems` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-063 | `crates/systems/src/news.rs` | `src/m22/systems/news.ts` | `m22_systems` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-064 | `crates/systems/src/performance.rs` | `src/m22/systems/performance.ts` | `m22_systems` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-065 | `crates/systems/src/satellites.rs` | `src/m22/systems/satellites.ts` | `m22_systems` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-066 | `crates/systems/src/sponsors.rs` | `src/m22/systems/sponsors.ts` | `m22_systems` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-067 | `crates/systems/src/stadiums.rs` | `src/m22/systems/stadiums.ts` | `m22_systems` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-068 | `crates/systems/src/super_mundial.rs` | `src/m22/systems/super_mundial.ts` | `m22_systems` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-069 | `crates/systems/src/windows.rs` | `src/m22/systems/windows.ts` | `m22_systems` + `npm test` | PARTIAL_M22_TESTED |
| R-M22-070 | `crates/systems/src/youth_league.rs` | `src/m22/systems/youth_league.ts` | `m22_systems` + `npm test` | PARTIAL_M22_TESTED |
