# M28 — World transaction + save numbering + calendar

## Goal / scope
- Fonte Rust: `crates/model/src/save_numbers.rs`, `world.rs`, `crates/simulation/src/game.rs`, `market.rs`.
- Base: Git M27 `97523f9`, matriz 211/231 fontes Rust mapeadas (91,34% nominal), 502 testes.
- Entrega: API TypeScript integrável para recálculo de números de save, religação, consultas e plano de rodada, transferências que preservam o save sem simular mecânicas ausentes, regressões, pacote Git+ZIP.
- Limites: sem fixture real `.s22`/`.bfn` da carreira; nenhuma afirmação de paridade de motor, simulação de partidas, finais de temporada ou UI nova.

## Milestones
- [x] T1 restaurar base M27; `npm test` 502/502 PASS (`/mnt/data/FMU_M28_Work/baseline.log`).
- [x] T2 implementar `save_numbers` como port funcional dos métodos Rust, testar aposentadoria, IDs estáveis e duplicatas.
- [x] T3 implementar consulta e validação de calendário World sem executar resultados fictícios.
- [x] T4 implementar contabilidade/transferência transaction-safe, fiel às condições existentes no Rust e explicitando dependências externas.
- [x] T5 integrar APIs ao CLI/World `.bfn` e testar round-trip/migrações/backups.
- [x] T6 auditar 231 fontes, QA e compatibilidade, gerar bundle, patch e ZIP: pacote preliminar extraído, 569/569 testes e 1015 hashes PASS; bundle e patch recuperados do próprio ZIP geraram árvores Git idênticas e clone teve 569/569 testes PASS.

## Risks and evidence
- F28-01 BLOCKER: Rust differential + fixtures oficiais indisponíveis. Status integral `RELEASE_BLOCKED`.
- F28-02 MAJOR: `World` runtime real necessita motor Rust e ModSystems; não ligar simulação implícita.
- F28-03 MAJOR: transferência entre dois clubes humanos é `unported!` no Rust; bloquear explicitamente.
- Visual QA: N/A, sem alteração web; não declarar visual release M28.
