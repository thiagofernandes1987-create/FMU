# M31 — Relatório técnico de QA

**Fonte canônica**: snapshot Rust `bd2ccbdd`, 231 SHA. **Baseline**: M29+M30 Git `7a8f8d5`, 663/663 testes.

| QA | Evidência | Resultado |
|---|---|---|
| Base recuperada | `evidence/m31/baseline.log` | 663/663 PASS |
| Parser binário Kryo typed graph | `tests/m31_kryo_reader.test.ts` | 38 casos PASS (incluindo arrays, ciclos, bytewise) |
| Preflight de roots `.s22` | `tests/m31_s22_preflight.test.ts` | 6 casos PASS |
| Regressão total TypeScript | `evidence/m31/all_tests.log` | 707/707 PASS |
| CLI fixture sintética | `evidence/m31/cli_dump.txt`, `cli_diff.log` | PASS |
| Auditoria inventário Rust | `tools/m31_audit.py --check` | 231/231 SHA PASS |
| UI/visual | Nenhuma UI/CSS alterada | N/A |
| `kryo-schema.json` original do jogo | Ausente | BLOCKER |
| Original `.s22` + golden `.zst` | Ausente | UNVERIFIED |
| Paridade Rust diferencial / jogo completo | Sem fixtures/Cargo | UNVERIFIED / RELEASE_BLOCKED |
| Sandbox 2 temporadas × 90 partidas | `evidence/m31/two_seasons.log` | PASS (não é Rust) |
| Bundle Git + replay do patch | `verify/trees.txt`, `clone_test.log`, `patch_test.log` | Árvores idênticas; 707/707 e 44/44 PASS |
| ZIP preliminar extraído | `verify/zip_preliminary_tests.log`, `verify/zip_preliminary_audit.log` | 707/707, 231/231 SHA PASS |
| ZIP definitivo | Revalidar após último commit | PENDENTE |

**Correções em testes:** inicialmente o fixture sintético de `java.lang.Integer` não especificava `final:true` e faltava um byte do calendário; ambos corrigidos no fixture, mantendo o algoritmo Rust. Um defeito no comparador com última linha sem LF foi corrigido no código e recebeu regressão. Leitura de strings UTF-16 muito longas recebeu limite e chunking para evitar stack overflow.

Nenhum MAJOR aberto foi aceito para a release funcional. Incremento de backend isolado; teste original do jogo não reproduzido.
