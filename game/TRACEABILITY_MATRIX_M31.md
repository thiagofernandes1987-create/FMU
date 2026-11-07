# Rastreabilidade M31

| Requisito | Componente | Contrato | Teste | Regressão | Artefato |
|---|---|---|---|---|---|
| Kryo 4 stream → grafo com refs | typed reader+graph | CT31-01/02 | `tests/m31_kryo_reader.test.ts` | M22 lowlevel | src/m31/persistence |
| Dump Rust byte textual | canonical.ts | CT31-03 | M31 golden sintético | M22 canonical | fixture M31 |
| Preflight do `.s22` binário | s22_preflight.ts | CT31-04 | `tests/m31_s22_preflight.test.ts` | M25 import graph | src/m31 |
| Golden e divergências | compare.ts / CLI | CT31-05/06/07 | M31 diff+CLI | M30 trace | scripts + tests |
| 231 hashes Rust e cobertura nominal | `tools/m31_audit.py` | 231 SHA | `--check` | M29 inventory | docs/M31_PROGRESS + matrix |
| Integridade de ZIP | bundle+patch+SHA | package | extração clean, npm test | base M29+M30 | M31 ZIP release |
