# TRACEABILITY_MATRIX M28

| Requisito | Componente | Contract | Teste | Regressão | Artefato |
|---|---|---|---|---|---|
| R28-01 save number / refs corretos | save_numbers | M28-01 | 14 casos + 6 ciclo | M27 fixtures/migrations | `src/m28/save_numbers.ts` |
| R28-02 pagamentos exatos | world_finances | M28-02 | 8 casos | M27 World validation | `src/m28/world_finances.ts` |
| R28-03 ler dia sem inventar jogos | world_calendar | M28-03 | 10 casos | M22/M25 calendar | `src/m28/world_calendar.ts` |
| R28-04 comprar preservando World | world_transfer | M28-04 | 17 casos | M27 transaction | `src/m28/world_transfer.ts` |
| R28-05 sem dados semanticamente quebrados | world_audit | M28-05 | 8 casos | Rust schema refs | `src/m28/world_audit.ts` |
| R28-06 read/write/backup/copy | career_world | M28-06 | 6 casos | M26 codec+M27 writer | `src/m28/career_world.ts` |
| R28-07 CLI e QA | world_cli | M28-06 | 4 casos | full 569 tests | CLI, README, ZIP |
