# FMU M23 — Relatório técnico de QA

## Escopo executado

- **60 fontes `app`** receberam correspondência TypeScript com regra de domínio, estado ou dados de UI, cada uma com ao menos uma exportação executável e referência direta em teste M23.
- Alteração isolada em `src/m23/app`; não substitui `egui`, não altera os 249 testes/contratos aprovados de M22.
- Duas ferramentas verificam a proveniência: `tools/m23_audit.py`, `tools/m23_document.py`.
- **Sem renderização visual do app:** nenhum status visual de produção pode ser dado como PASS, mesmo que os view-models funcionem.

## Evidências objetivas

| Gate | Resultado | Artefato / execução |
|---|---|---|
| TypeScript strict compile | **PASS** | `npm run build` |
| M23 novos testes | **67/67 PASS** | `evidence/m23/m23_new_67.log` |
| Suite consolidada | **316/316 PASS** | `evidence/m23/regression_316.log` |
| Baseline M22 | **249/249 PASS** | `evidence/m23/m22_baseline_249.log` |
| Snapshot Rust (231 SHA256) | **231/231 PASS** | `tools/m23_audit.py --check`; `docs/M23_PROGRESS.json` |
| Extração de campos de persistência da fonte Rust | **PASS** (37 canônicos, 37 saves, 35 importadores) | `evidence/m23/schema_recheck.log` |
| WASM original | **PASS estático**; jogo visual não executado | `evidence/m23/wasm_recheck.log` |
| Progressão nominal M22→M23 | **125/231 → 185/231 (+25,97pp)** | `docs/M23_PORTING_MATRIX.csv` |
| Teste diferencial Rust↔TS | **UNVERIFIED** | compilador/testes diferenciais não executados |
| E2E jogo e QA visual | **BLOCKED** | Renderer web/egui não convertido |
| Regressões da persistência `.bfn` real | **UNVERIFIED** | interfaces de memória e esquemas parciais |
| ZIP preliminar extraído | **316/316 PASS**, 787/787 SHA | `evidence/m23/preliminary_zip_tests_316.log` e `preliminary_zip_integrity.log` |
| ZIP após fechamento funcional | **316/316 PASS**, 791/791 SHA | `evidence/m23/zip_extracted_full_tests_316.log`, `zip_member_sha256_audit.log` |
| Git bundle em clone independente | **316/316 PASS**, árvore idêntica | `evidence/m23/bundle_cloned_tests_316.log`, `git_tree_equality.log` |
| Patch M22→M23 | **67/67 PASS**, árvore idêntica | `evidence/m23/patch_replay_tests_67.log`, `git_tree_equality.log` |
| Esquemas no ZIP extraído | **PASS** | `evidence/m23/preliminary_zip_schemas.log` |

## Observações sobre a cobertura

**Percentual 80,09% é uma contagem de arquivos com algum código/dado correspondente, não a porcentagem de paridade funcional.** Os 60 mapeamentos novos são explicitamente `APP_VIEWMODEL_PARTIAL_TESTED`, `release_ready=NO`, `differential_rust_verified=NO`. Os arquivos mais longos (`screens/finances.rs`, `screens/satellites.rs`, `screens/management.rs`) foram convertidos apenas em regras/view-models específicas; a maior parte do código original era renderização `egui`.

## Achados, correções e regressões

- Foram corrigidos limites de fonte para leaders **401** e busca **força 1–100 / idade 16–45**.
- Ajustados o comportamento de clique em slot vazio da escalação, a condição de elegibilidade de treino e as cores de posições copiadas da fonte Rust.
- Teste de serialização não podia exigir permanência de campos `undefined` no JSON; corrigido o teste de contrato, mantendo o comportamento da fonte.
- O teste de `history.rs` confirma ordenação reversa, transferência sem taxa e fallback de nome, fechando referência direta a todas as 60 fontes.

## Gates de liberação

- **Incremento TS de lógica M23:** testado em código. Os testes, hashes e árvores Git foram revalidados no pacote após fechamento funcional; os metadados finais são confirmados em `FMU_Next_M23_QA_FINAL.md`.
- **Migração do jogo completo:** `RELEASE_BLOCKED` por renderer, persistência, runtime, cobertura funcional e diferencial Rust pendentes.
- Sem alterações de interface renderizada; **QA visual não reivindicado**.
