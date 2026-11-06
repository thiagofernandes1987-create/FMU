# M24 — Matriz de rastreabilidade

| Req | componente | contrato | testes/regressões | artefato |
|---|---|---|---|---|
| M24-01 UI web responsiva | browser + CSS | DOM8 v1 | Playwright 1440/768/390, no overflow, 8 rotas | screenshots e logs QA |
| M24-02 rodada/temporada | career_demo | DemoCareer v1 | testes 18 rodadas, 8 temporadas, 2 temporadas CLI | TS + JS compilado |
| M24-03 mercado/tática | career_demo + UI | DemoCareer v1 | valores, titulares, financeiros, eventos browser | testes + capturas |
| M24-04 persistência | JSON, localStorage, download | DemoCareer schema v1 | save/load e rejeição de arquivo inválido | `fmu-demo-v1` |
| M24-05 exemplos de persistência | graph, schema, BFN metadata | examples v1 | 10 testes M24 persistence | source/tests |
| M24-06 cobertura | M24_PORTING_MATRIX.csv | status, SHA256 Rust | 231 hashes; 194 mapeados | M24_PROGRESS.json |
| M24-07 integridade | ZIP, bundle, patch | build/test | clone, patch replay, extract, SHA | manifesto e QA |
