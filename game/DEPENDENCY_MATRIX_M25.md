# Matriz de dependências M25

| componente | depends_on | used_by | contrato | impacto | regressões |
|---|---|---|---|---|---|
| `m25/simulation/live_round.ts` | World DTO, MatchEngine hook, RNG, eventos Rust | replay demo, futura carreira Next | CT-M25-01/02/03 | relógio, placar, gols, pênaltis | M25 live + M20 simulation |
| `m25/web/demo_replay.ts` | `live_round`, `m24/web/career_demo` | `m24/web/browser` replay | CT-M25-04 | mostra resultado sem alterar save | M25 replay, M24 career |
| `m24/web/browser.ts` (ampliado) | demo_replay, career_demo, DOM, CSS | 9 telas | CT-M25-06 | navegação, visual, teclado, ação | M24 browser QA + M25 browser QA |
| `m25/persistence/import_s22_graph.ts` | `m22/persistence/kryo_graph.ts`, `import_context.ts` | importador completo futuro | CT-M25-05 | plano de importação e classes | M25 S22, M22 kryo |
| `tools/m25_audit.py` | upstream 231 `.rs`, matriz M24 | docs/M25_PROGRESS e release | CT-M25-07 | métricas, fonte | SHA e matriz |
