# QA M29 — relatório técnico de incremento

**Baseline:** M28 (`9a85192`), suíte 569/569. **Fonte Rust:** `bd2ccbdd`, inventário 231 arquivos.

## Verificações concluídas

| Verificação | Evidência | Resultado |
|---|---|---|
| Baseline M28 | `evidence/m29/baseline.log` | 569/569 PASS |
| Testes M29 | `tests/m29_world_advance.test.ts` | 43/43 PASS |
| Regressão completa M29 | `evidence/m29/full_tests.log` | 612/612 PASS |
| Originais Rust, hashes | `evidence/m29/source_audit.log` | 231/231 PASS |
| Schema derivado do Rust | `npm run m27:audit` | 89 structs, 956 fields PASS |
| TypeScript | `npm run build` | PASS |
| Duas rodadas no mesmo World + `.bfn` reaberto | `tests/m29_world_advance.test.ts` | PASS; fixture e hooks de teste |
| Rollback após falha da segunda rodada | testes M29 | PASS para World; RNG externo fora do rollback |
| `.bfn` Rust real e duas temporadas reais | Fixture não fornecida | **UNVERIFIED** |
| Rust differential `Sim::advance` | Cargo e golden fixtures indisponíveis | **UNVERIFIED** |
| QA visual | Nenhuma UI alterada | NÃO APLICÁVEL |

## Interpretação

O incremento implementa o controle de avanço transacional, tarefas financeiras, recuperação física e persistência, mas a simulação de partidas, estatísticas/ligas completas, mercado e nova temporada exigem *hooks reais* ainda não portados. O teste de duas rodadas não equivale à paridade com o jogo Rust. O comando CLI `inspect` é somente leitura e nunca avança uma carreira por conta própria.

## Cobertura

M28 → M29: **211/231 = 91,34%** mapeamento nominal, avanço **0,00pp**, 20 arquivos `UNPORTED` (testes e exemplos). Três arquivos Rust mapeados foram aprofundados: `simulation/game.rs`, `model/player.rs`, `model/world.rs`. Não traduzir isso como 91,34% de paridade funcional.

## Critérios para liberação integral

- **BLOCKER:** sem motor real completo e `Sim::advance` de ponta a ponta.
- **BLOCKER:** falta save Rust real jogável e fixtures `.s22` diferenciais.
- **BLOCKER:** 20 testes/exemplos ainda sem port integral; Cargo indisponível.
- **MAJOR não aceito:** hooks externos são dependências, e os hooks de teste não executam estatísticas do Rust real.

Clone independente do Git bundle: **612/612 PASS**; patch M28→M29 reproduziu árvore Git SHA `74b8f58e465f32c50eefcb30e4f367ea667fc2c4` antes da atualização documental desta verificação. Resultados do ZIP exato serão registrados separadamente no QA final. **QA técnico do incremento:** PASS. ZIP preliminar foi extraído em pasta limpa, compilado e aprovou 612/612; 1035/1035 checksums; bundle clonado e testado 612/612; patch sobre M28 reproduziu a mesma árvore. A entrega final será revalidada e terá relatório externo com hashes e Git commit definitivos. **Projeto integral:** `RELEASE_BLOCKED`.
