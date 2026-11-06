# Rastreabilidade

| Req | comp | contrato | teste | regressão | artefato |
|---|---|---|---|---|---|
| TXR-01 RNG Java exato | rng | TX-01/02 | `tools/java_parity.js` + `tests/rng.test.ts` | comparação Java independente 5124 | `src/rng.ts` |
| TXR-02 rollback integrado | advance | TX-04 | `tests/advance.test.ts` engines/afterStage falhos | seeded retry | `src/advance.ts` |
| TXR-03 calendário completo | advance/demo | TX-04 | 18 rodadas x 2 temporadas | Ids, 90 jogos, fases | `src/demo.ts` (fictício) |
| TXR-04 salários e juros | world/advance | TX-03/04 | test month wages + interest | bigint | `src/world.ts` |
| TXR-05 H2H Rust | records | TX-05 | `tests/records.test.ts` | cap bug retained | `src/records.ts` |
| TXR-06 checkpoint | persistence | TX-06 | `tests/persistence.test.ts` | backup, integrity | `.fmu-day` próprio |
| TXR-07 bridge do World | bridge | TX-07 | `tests/bridge.test.ts` | lossless i64 refs | `src/bridge.ts` |
| TXR-08 release standalone | manifest | package | `npm test`, `npm run parity:java`, sha ZIP | fresh extract | ZIP M29R |
