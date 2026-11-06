# TASKS M29 — foco em uma rodada de correções

**Objetivo:** completar o maior subconjunto verificável de `World` → `Sim::advance` → tarefas de rodada → `.bfn`, sem inventar paridade com engine ou saves reais.

**Baseline:** commit M28 `9a85192`, 569/569 testes. **Saída:** TypeScript + JS, testes, documentos, manifesto, Git bundle, patch, ZIP.

## Marcos (ainda sujeitos ao pacote final)

- [x] Restaurar M28 e executar baseline 569/569 (`evidence/m29/baseline.log`).
- [x] Portar transição de calendário e guards de engine (`src/m29_world_advance.ts`).
- [x] Portar recuperação física Rust, tarefas `ds`/`dJ`, bloqueio de callbacks obrigatórios.
- [x] Integrar avanço de várias rodadas e salvar/reabrir em `.bfn` (`src/m29_world_driver.ts`).
- [x] CLI somente leitura para listar bloqueios de gameplay (`src/m29_world_cli.ts`).
- [x] Executar testes novos 43/43 e regressão 612/612 (`evidence/m29/full_tests.log`).
- [x] Validar hash das 231 fontes e schemas originais (`evidence/m29/source_audit.log`).
- [x] Empacotar ZIP, conferir SHA-256, extrair e reexecutar regressão (extração M29 preliminar 612/612, 1035/1035 hashes; versão final revalidada após commit).
- [x] Reproduzir código via Git bundle e patch M28→M29; árvores idênticas e 612/612 testes no clone (`m29_verify_bundle.log` externo).

## Requisitos que NÃO foram concluídos (release integral BLOQUEADA)

- [ ] Implementar engine de partida idêntica à Rust, `after_match`, classificação, mercado e nova temporada.
- [ ] Obter save `.bfn` original jogável e fixtures `.s22` originais; comprovar duas temporadas reais.
- [ ] Compilar/rodar os testes diferenciais originais via toolchain Cargo/Rust; implementar os 20 testes/exemplos restantes.
- [ ] Conectar World + engine real à interface web do FMU e homologar visualmente o ciclo completo.

**Status:** incremento M29 testado; release integral `RELEASE_BLOCKED`. Os gates acima não foram aceitos pelo usuário e não serão marcados `[x]` sem evidência.
