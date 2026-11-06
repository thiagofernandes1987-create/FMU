# DEPENDENCY_MATRIX M28

| Component | depends_on | used_by | contract/ver | impact | linked regressions |
|---|---|---|---|---|---|
| `save_numbers.ts` | RustWorld, M27 transaction, CBOR | `career_world`, CLI | M28-01 | histórico de transferências, scores de competição | save numbers + M27 schema |
| `world_finances.ts` | `model/world.rs`, bigint | `world_transfer`, futuros sistemas | M28-02 | saldo do clube, salários, categorias | calendar finance |
| `world_calendar.ts` | game.days, matches, arena IDs | CLI, futura engine | M28-03 | agenda e human waiting | calendar finance |
| `world_transfer.ts` | world_finances, M27 transaction, clock hook | integrações de mercado | M28-04 | vínculo do atleta, histórico, caixa | transfer + save numbers + M27 |
| `world_audit.ts` | M27 validateRustWorld | career_world, CLI | M28-05 | consistência cross-arena | audit_cli |
| `career_world.ts` | bfn_world, save_numbers, audit, fsync | CLI, persistência | M28-06 | salvar/reabrir, backup, referências | career_world + M26/M27 |
