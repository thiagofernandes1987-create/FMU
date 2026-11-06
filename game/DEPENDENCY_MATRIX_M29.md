# DEPENDENCY_MATRIX M29

| comp | depends_on | used_by | contract/ver | impact | regressions |
|---|---|---|---|---|---|
| `src/m29_world_advance.ts` | `bfn_world`, `worldTransaction`, `world_calendar`, `world_finances`, `world_audit`, engine hooks | batch driver | CT-M29-01..03/v1 | alteração de calendário, dinheiro, fitness | 43 testes M29 e 569 anteriores |
| `src/m29_world_driver.ts` | `m29_world_advance`, `m28/career_world`, calendar | CLI, persistência da carreira | CT-M29-04/05/v1 | progressão multi-dia e save | testes batch/round-trip |
| `src/m29_world_cli.ts` | `m27/bfn_world`, `m28/world_audit`, driver | operadores/debuggers | CT-M29-06/v1 | leitura e verificação .bfn | inspect read-only |
| `src/m28/career_world.ts` | codec Zstd/CBOR, save numbers, validação | M29 | CT-M29-05 + M28/v1 | migrações e backup | todos testes m26/27/28/29 |
| `src/m27/persistence/world_schema.generated.json` | Rust upstream `bd2ccbd` | validação 89/956 fields | CT-M29-01/v1 | referências arena | `npm run m27:audit` |
