# FMU M27 — MATRIZ DE DEPENDÊNCIAS
| comp | depends_on | used_by | contract/version | impact | regression |
|---|---|---|---|---|---|
| m27/world_schema.generated.json | Rust saved.rs/mods.rs | bfn_world | M27 schema 89 structs/956 fields | validação arenas | m27:audit, m27 World |
| m27/bfn_world | m26/bfn_codec, m26/cbor, m22/migrations, schema | world_cli, world_access | M27 typed World | load/upgrade/save | m26+m27 tests |
| m27/world_cli | bfn_world, node fs | importadores e operadores CLI | Rust native format v3 | I/O e backups | m27 CLI, m26 codec |
| m27/world_access | bfn_world, cbor | future FMU Web real World | M27 view/transactions | arenas, contas e logs | m27 world_access |
| m27/simulation/entrypoints | bfn_world, Rust fixed derby tables | future advanceGame | Rust lib.rs entrypoint | calendário/classic rivalry | m27 entrypoint |
| m27/datapack/cli | m22/datapack/database/read | authoring/CI packs | CLI partial | compose, validate | m22 datapack + m27 CLI |
| m27/*/index.ts | 4 crate lib.rs module lists | TS importers | generated barrel | exports | m27 barrels |
