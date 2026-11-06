# FMU M27 — RASTREABILIDADE
| req | comp | contrato | teste | regressão | artifact |
|---|---|---|---|---|---|
| BFN v1/v2/v3 → World | bfn_world + schema | native.rs/migrations.rs/world.rs | m27_bfn_world.test.ts | M26 CBOR/Zstd | world_cli.ts |
| IDs preservados e verificáveis | validateRustWorld, relinkWorldReferences | ArenaId 9 types | m27_bfn_world.test.ts (9 arenas) | M21 ids/save_numbers | M27_WORLD_SCHEMA |
| World persistente | writeBfnWorldAtomic | fsync, rename, backups 1..3 | m27_bfn_world.test.ts | M26 Codec | .bfn válido |
| Transação e visualizações reais | world_access | copy-on-write, BigInt | m27_world_access.test.ts | M24 sandbox untouched | world_access.ts |
| Mapear últimas 26 fontes | tools/m27_audit.py | 231 source hashes/26 individual records | QA audit + npm | M26 matrix | M27_LAST_26_GAP_MATRIX.csv |
| Port entrypoints | lib barrels, datapack cli, simulation entrypoint | namespace + partial functions | m27_barrels + m27_entrypoints | M22 libs | src/m27 |
