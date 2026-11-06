# FMU M23 — Controle de tarefas

## Objetivo e I/O
- **Goal:** lote agressivo de `app` com lógica Rust → TS, sem manipular a métrica de paridade.
- **Inputs:** Git bundle M22, 231 fontes Rust verificadas e conjunto de testes M22 249/249.
- **Outputs:** 60 mapeamentos TS em `src/m23/app/`, testes, auditoria fonte, contratos, guia, patch, bundle, ZIP.
- **Contracts:** módulos com função/data export real, TS strict, DTOs explícitos, status parcial, sem UI fake nem dados privados.
- **Acceptance:** 67 testes novos + 249 antigos, hashes 231/231, clone/patch/ZIP conferidos.

## Milestones
- [x] Restaurar M22 `7c57fbb`, baseline 249/249 PASS (`evidence/m23/m22_baseline_249.log`).
- [x] Converter 60 arquivos `app` para view-models/regras TS documentadas; todos referenciados diretamente pelos testes M23.
- [x] Auditar inventário global 231/231; 125 → 185 mapeamentos (80,09% nominal, +25,97pp), 46 sem port.
- [x] TypeScript strict, 67/67 testes novos, 316/316 completos (`evidence/m23/`).
- [x] Revalidar geração de esquemas M22 e compilação WASM original.
- [x] Criar contratos, matriz de dependências, rastreabilidade, guia e achados.
- [x] Validar o empacotamento candidato: extração limpa, 316/316 testes, 787/787 SHA e auditoria de fontes (evidence/m23/preliminary_*).
- [x] Conferir clone Git bundle, patch M22→M23, ZIP extraído e hashes com 316/316 testes (evidências `evidence/m23/zip_*`, `bundle_*`, `patch_*`). Metadados finais verificados no relatório externo.
- [ ] Portar interface gráfica egui/DOM, persistência `.bfn` e integração real ao World (BLOCKER de release integral).
- [ ] Testes diferenciais Rust ↔ TS e QA visual real mobile/tablet/desktop (BLOCKER de release integral).

## Riscos e findings
- **BLOCKER integral:** 46 fontes sem correspondência, e grande parte dos 185 mapeamentos é parcial.
- **CRITICAL visual:** nenhuma UI egui/web foi renderizada ou homologada neste lote.
- **MAJOR:** storage de patch e carreira não implementam IO/persistência total.
- **Meta de 30 pontos percentuais:** incremento de +25,97pp, meta numérica não atingida.
- **Proteção de escopo:** nenhum redesign/otimização de UI foi usado para contar cobertura.

## Evidência e conclusão esperada
Incremento M23 pode ser distribuído se todas as verificações técnicas do pacote forem PASS. A conversão integral permanece `RELEASE_BLOCKED` até que os requisitos acima sejam efetivamente executados e homologados.
