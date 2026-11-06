# FMU M26 — Estado da execução / escopo congelado

**Objetivo:** avançar a conversão a partir do M25 por meio de um codec nativo `.bfn` realmente decodificável e diagnósticos de carreira. **Não reescrever a engine, nem assumir paridade de gameplay.**

**Input:** M25 Git bundle, snapshot Rust bd2ccbd, dados exclusivamente sintéticos na entrega. **Output:** código TS/JS, fixture `.bfn`, testes, CLI, documentação, matriz de fontes, bundle e patch M25→M26, ZIP íntegro.

## Milestones e critérios

- [x] Fonte Git M25 recuperada; baseline 411/411 PASS (`evidence/m26/baseline.log`).
- [x] Codec binário com frame BF NX, Zstd e CBOR, leitura de BigInt, tags e proteções (`tests/m26_bfn_codec.test.ts`: 16 PASS).
- [x] Adaptações diagnósticas das crates simulation/systems/persistence (`tests/m26_diagnostics.test.ts`: 20 PASS).
- [x] CLI, fixtures e regressão de conteúdo binário (`tests/m26_cli.test.ts`: 4 PASS; `m26_fixture.test.ts`: 2 PASS).
- [x] Testes completos: 453/453 PASS (`evidence/m26/regression.log`).
- [x] Descompressão independente do frame gerado via `zstd -t`: PASS (teste de formato de transporte, não World Rust).
- [x] Auditoria SHA das 231 fontes e matriz: 205/231 mapeadas nominalmente (`docs/M26_PROGRESS.json`).
- [x] Git bundle clonado e testado 453/453; patch M25→M26 reaplicado, árvore idêntica e 42/42 testes novos.
- [x] ZIP preliminar extraído: 453/453 testes + SHA de 231 fontes; ZIP definitivo revalidado após este registro.

## Bloqueios para release de jogo

- [ ] Implementação completa de `World` e suas arenas, referências e migrações de saves (BLOCKER).
- [ ] Rust differential/paridade do motor usando fixtures originais (BLOCKER; Rust/Cargo indisponíveis).
- [ ] Todos os arquivos Rust funcionalmente portados (BLOCKER). Os testes/examples adaptados não comprovam funções de produção.
- [ ] Homologação visual das telas com World original (BLOCKER para jogo real; nenhuma tela modificada nesta etapa).

**Gates:** M26 incremental pode ser validado tecnicamente após verificação do pacote. Conversão integral permanece `RELEASE_BLOCKED`.

## M29 — Continuidade

O marco M29 é rastreado em [TASKS_M29.md](TASKS_M29.md) e não substitui os controles dos lotes anteriores. A liberação integral do jogo permanece bloqueada até haver engine e fixtures originais.
