# QA M22 — Lote agressivo multiarquivo

**Status do incremento TS:** TESTED, REPLAY_VALIDATED (pacote definitivo recebe verificação externa). **Conversão integral:** RELEASE_BLOCKED.

| Controle | Evidência | Resultado |
|---|---|---|
| Baseline M21 restaurada | `evidence/m22/baseline_test.log` | PASS 163/163 |
| Source SHA snapshot | 231 Rust source hashes, `tools/m22_audit.py` | PASS 231/231 |
| Schemas Rust extraídos | `tools/m22_generate_schemas.py --check` | PASS (37/37/35) |
| TypeScript strict | `npm run build` | PASS |
| Testes M22 | `evidence/m22/all_tests_final3.log` | PASS 249/249, 86 novos |
| Cobertura nominal M21→M22 | `docs/M22_PROGRESS.json` e `docs/M22_PORTING_MATRIX.csv` | PASS 55→125/231, +30,30pp |
| Teste diferencial Rust/TS | Rust compiler indisponível | UNVERIFIED |
| Teste carreira integrado a todos ports M22 | Ainda não ligado à carreira principal | UNVERIFIED / BLOCKER integral |
| QA visual | Nenhuma UI/CSS alterada | N/A |
| Bundle Git limpo | `evidence/m22/bundle_clone_tests.log` | PASS 249/249 |
| Patch M21→M22 reaplicado | `evidence/m22/patch_clone_tests.log` + árvore Git | PASS 249/249, árvore idêntica |
| ZIP candidato extraído | `evidence/m22/zip_extract_tests.log` e 629 hashes de membros | PASS 249/249, SHA256 629/629 |
| ZIP definitivo | QA externo pós-fechamento, `FMU_Next_M22_QA_FINAL.md` | PENDENTE neste documento |

## Classificação de achados
- `B22-01` BLOCKER: 106 fontes ainda sem mapeamento.
- `B22-02` BLOCKER: sem Rust differential.
- `B22-03/04/05/07` MAJOR não aceitos para release integral: ligação World, save `.bfn`, parser Kryo, engine completa.
- Todos os tipos/exports M22 são opt-in; teste `preparePreMatch22` demonstra consumidor cruzado sem fingir orquestração de carreira.

## Evidência de convergência
- Baseline 163/163 PASS.
- Ciclos M22: dados/código (21), simulation (16), systems (17), persistência+modelo (16), engine+simulation (16), total novo 86; regressão integral 249/249.
- Falhas menores corrigidas: type narrowing TypeScript, teste float IEEE, schema generator `--check` e comparador de objetos com protótipo nulo. Nenhuma falha conhecida em testes executados.
- Endereço da fonte privada do usuário nunca incluído; não adicionados dados privados ao pacote.

## Evidência externa de replay para o pacote candidato
- Árvore Git original, clone bundle e aplicação do patch: `c3d98037728e2d32f35eaad4e55524cd9c0aa7ae` (três iguais).
- Testes completos aprovados em todos os três ambientes externos: `249/249 PASS`.
- `tools/m22_generate_schemas.py --check` e `tools/m22_audit.py` foram executados novamente da extração do ZIP.
- A revisão documental acrescentará commit de fechamento; seu bundle/patch e o ZIP definitivo serão novamente comparados antes da entrega.
