# FMU M26 — Evidências de QA técnico

| Gate | Resultado | Evidência |
|---|---|---|
| Baseline M25 | PASS 411/411 | `evidence/m26/baseline.log` |
| Compilação TS | PASS | `npm run build` |
| Regressão completa | PASS 453/453 | `evidence/m26/regression.log` |
| Testes novos | PASS 42/42 | `m26_*.test.ts` |
| Hash SHA Rust | PASS 231/231 | `tools/m26_audit.py --check` |
| Binary frame `.bfn` | PASS | `tests/fixtures/m26_sample_data_only.bfn` |
| Teste independente Zstd | PASS | `zstd -t` em frame extraído |
| Smoke demo 36 rodadas | PASS | `evidence/m26/demo_smoke.json` |
| Visual (UI) | N/A — nenhuma alteração de tela ou CSS M26 | — |
| Rust diferencial | UNVERIFIED | rustc/cargo indisponíveis |
| Migrações e World | BLOCKER | não implementados |
| Git bundle clonado | PASS 453/453 | `verify/clone_test.log` |
| Patch M25→M26 | PASS 42/42, mesma árvore | `verify/patch_tests.log` |
| ZIP extraído | PASS 453/453, CRC íntegro | `verify/prelim_zip_test.log` |
| Hashes internos do ZIP | PASS 926 arquivos, SHA-256 | `SHA256SUMS.txt` incluído |
| Bundle+patch | PASS, árvores iguais | testes independentes executados; revalidar a versão final |

## Findings

- **F26-01/02 BLOCKER:** fonte Rust ainda não foi homologada contra codec TS; `World` não convertido.
- **F26-03 MAJOR:** saves antigos requerem migração; `migrationRequired` evita interpretação incorreta.
- **F26-04 MAJOR:** exemplos Rust têm adaptadores e não port 1:1.
- **Defeito do teste corrigido:** vetor CBOR inválido substituído por asserção de falha; comparação de mapas com protótipo nulo corrigida no teste sem alterar o código.

**Estado incremental:** testado; status do jogo completo continua `RELEASE_BLOCKED`.
