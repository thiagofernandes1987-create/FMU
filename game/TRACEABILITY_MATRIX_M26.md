# TRACEABILITY MATRIX M26

| req | comp | contract | test | regressions | artifact |
|---|---|---|---|---|---|
| M26-R01 decode BFN | cbor/bfn_codec | CT-M26-01/02 | m26_bfn_codec + fixture | m22 persistence | `src/m26/persistence/*` |
| M26-R02 exemplos sim | simulation_examples | CT-M26-03 | m26_diagnostics | m24 career | `src/m26/diagnostics/simulation_examples.ts` |
| M26-R03 exemplos systems | systems_examples | CT-M26-04 | m26_diagnostics | m25 demo replay | `src/m26/diagnostics/systems_examples.ts` |
| M26-R04 inspecionar save | persistence_examples | CT-M26-05 | m26_diagnostics + fixture | m24 bfn inspect | `persistence_examples.ts` |
| M26-R05 CLI read-only | cli | CT-M26-06 | m26_cli | m25 save | `cli.ts` |
| M26-R06 matriz 231 | tools/m26_audit | CT-M26-07 | `--check` | M25 matrix | `docs/M26_PORTING_MATRIX.csv` |
| M26-R07 regressões | npm test | all | 453 tests | full M25 | QA_REPORT_M26 |
| M26-R08 entrega íntegra | Git bundle + ZIP + patch | all | replay/CRC/checksums | M25 clone | release manifest M26 |
