# Rastreabilidade M19

| Requisito | Contrato | Arquivo | Teste | Evidência | Situação |
|---|---|---|---|---|---|
| Cup rounds | M19-SIM-01 | cup.ts | simulation.test.ts | `docs/test_final.log` | PASS |
| Nations knockouts | M19-SIM-02 | nations.ts | simulation.test.ts | `docs/test_final.log` | PASS |
| Human decisions and substitutions | M19-SIM-03/04 | human_default.ts, human_substitutions.ts | simulation.test.ts | `docs/test_final.log` | PASS |
| Trophies and season | M19-SIM-05/06/07 | trophy.ts, season.ts, sorting.ts | simulation.test.ts | `docs/test_final.log` | PASS |
| Coach, club and award records | M19-SYS-01/02/03/04 | award_*.ts | systems.test.ts | `docs/test_final.log` | PASS |
| Rust reference executable | Native reference | public/*.wasm | compile/export audit | `docs/WASM_RUNTIME_AUDIT.json` | STATIC PASS; browser UNVERIFIED |
| Merge to M18 | M18 contracts | not available | unexecuted | `MISSING_INPUTS.yaml` | BLOCKED |
| +25pp target | mapping reconciled from M18 | 58 new sources | unexecuted | `docs/M19_PROGRESS.json` | NOT MET |
