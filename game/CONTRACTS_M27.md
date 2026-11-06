# FMU M27 — CONTRATOS
| Componente | I/O | Tipos e invariantes | Verificação | Compatibilidade |
|---|---|---|---|---|
| BFN→World | bytes → WorldDocument | Zstd+CBOR v1..3, SaveMeta obrigatório, 12 campos raiz, nove arenas, referências indexadas | M27 bfn_world tests | Rust Serde estrutural; game runtime UNVERIFIED |
| World migrations | CborValue + version → migrated copy | v1 números e transfers; v2 torneios, IDs legados, nomes | M27 migration tests | nomes do Rust `migrations.rs` |
| World validator | CborValue → ValidationReport | 89 structs e 956 campos, Option, i64/bigint, tupla, Map, ranges de u32, sem dangling refs | M27 validation tests | fonte gerada de saved.rs/mods.rs |
| Runtime preflight | WorldDocument → blockers | rejeita World sem calendário, clubes e atletas | synthetic fixture + app Linux panic | NÃO garante load jogável |
| World atomic writer | WorldDocument + path.bfn → bytes fsync | valida antes de escrever; tmp exclusivo; bak1..bak3 | round-trip/backups/failure | Node.js >=22, não browser |
| World projection | doc + arena id → view | nomes reais, BigInt financeiro; nunca renderiza demo como original | m27_world_access | read-only; mutate via worldTransaction |
| Rust lib barrels | 4 crates `lib.rs` → TS namespaces | 48 exports públicos, sem afirmar paridade interna | m27_barrels tests | entrypoint compatibility only |
| Datapack CLI | argv/folder → parsed args/summary | opções em ordem, symlinks recusados; convert/pack bloqueados | m27_entrypoints tests | NOT FULL TOML/CSV parser |
