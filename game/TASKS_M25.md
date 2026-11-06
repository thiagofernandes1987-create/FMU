# FMU M25 — Fases reais da rodada, integração web e incremento de cobertura

**Base** M24 `7bf52ee` / Rust `bd2ccbdd`. **Escopo**: converter as rotas verificáveis de `simulation/src/human/round.rs` (644 linhas) num adaptador testado, integrar replay de partida no sandbox (sem confundir eventos sintéticos com motor Rust), expandir regressões e testar visualmente a UI. **Sem alteração** de `.bfn` nem claims de motor original.

- [x] T1 PASS: 355/355; hashes 231/231 — Baseline 355/355 e hashes das fontes Rust 231/231.
- [x] T2 PASS: 31 testes — Portar agrupamento de competições, eventos, intervalo, penalidade e disputa por pênaltis; inserir comentários de dependências.
- [x] T3 PASS: 9 telas e 12 testes — Expor replay de partida no navegador, rotulando como demonstração, com teclado e responsividade.
- [x] T4 PASS: 411/411 e 2 temporadas — Testes M25 + regressão completa + duas temporadas do sandbox.
- [x] T5 PASS: 3 viewports Chromium — QA real Chromium desktop/tablet/mobile, corrigir defeitos e reexecutar.
- [x] T6 PASS: 196/231, +0,87pp — Atualizar matriz, contratos, dependências, rastreabilidade, relatório e percentual.
- [x] T7 Validar Git bundle e patch (árvore idêntica), ZIP preliminar (411/411) e QA visual da extração; reproduzir empacotamento FINAL após correção do script — Empacotar Git bundle, patch incremental, ZIP; retestar extração limpa, hashes e árvore Git.

**DoD integral da conversão** permanece `RELEASE_BLOCKED`: Rust differential não executado; apps egui e persistência original não completos. Sem aceitar MAJOR aberto.
