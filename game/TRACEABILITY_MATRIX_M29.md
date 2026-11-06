# TRACEABILITY_MATRIX M29

| requirement | component | contract | test | regression | artifact |
|---|---|---|---|---|---|
| M29-R1: partida só pode avançar com engine | advanceWorldOneDay | CT-M29-01 | no hook/error; AI lineup; human waiting; score validation | M28 calendar + M25 live round | TS+JS |
| M29-R2: efeitos concretos do pós-jogo | recoverWorldPlayer, runWorldDayTask | CT-M29-02/03 | idade, juvenis, DS, DJ, BigInt, overflow, tasks after | finance M28 | TS+JS |
| M29-R3: N rodadas com rollback | advanceWorldDays | CT-M29-04 | 2 jogos, falha do segundo, pausa, limite | m27 `worldTransaction` | TS+JS |
| M29-R4: salvar/recuperar IDs e histórico | persistAdvancedBatch | CT-M29-05 | .bfn em disco e reabertura; unknown fields | m27+m28 CBOR save | .bfn sintético testes |
| M29-R5: relatório de bloqueios | inspect CLI | CT-M29-06 | read-only e reject mutating command | m28 world CLI | dist CLI |
| M29-R6: mapeamento e rastreabilidade | docs/M29_PORTING_MATRIX.csv | M29 source integrity | 231 SHA-256, 89 structs | M27 audit | JSON+CSV |
| M29-R7: pacote reproduzível | Git bundle, patch, ZIP | integrity contract | clone, replay, full tests, ZIP sha | baseline 569 | bundle+patch+ZIP |
