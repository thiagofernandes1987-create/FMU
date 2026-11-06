# Rastreabilidade M25

| requisito | componente | contrato | teste | regressão | artefato |
|---|---|---|---|---|---|
| R25-1 agrupamento e relógio da rodada | live_round.ts | CT-M25-01 | M25 31 testes de round | M20, M22 | TypeScript+JS |
| R25-2 penalidades e disputa | live_round.ts | CT-M25-02/03 | M25 pênaltis, chute, morte súbita | M20 engine | TypeScript+JS |
| R25-3 replay sem adulterar save | demo_replay.ts | CT-M25-04 | M25 12 testes replay; browser live/finished | M24 26 testes carreira | browser M25 |
| R25-4 preflight `.s22` | import_s22_graph.ts | CT-M25-05 | M25 13 testes root, arena, depth | M22 kryo | plano validado |
| R25-5 UI real responsive | browser.ts + app.css | CT-M25-06 | M25 browser QA 3 viewports | M24 browser | screenshots PNG |
| R25-6 percentual honesto | docs/M25_PORTING_MATRIX.csv | CT-M25-07 | m25_audit.py --check | inventário M24 | docs/M25_PROGRESS.json |
| R25-7 pacote clonável | Git bundle/patch/ZIP | CT-M25-01..07 | clone, replay, hashes, clean install | M24 release | manifest e QA |
