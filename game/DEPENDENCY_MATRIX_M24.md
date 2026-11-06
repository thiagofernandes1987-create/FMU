# M24 — Matriz de dependências

| Componente | depends_on | used_by | contract | impact | regressões |
|---|---|---|---|---|---|
| career_demo | `m23/app/home`, `m23/app/standings`, `m23/app/market` | `m24/web/browser`, exemplo CLI | DemoCareer schema v1 | partidas, caixa, titularidade, save | 28 testes M24, M23 viewmodel |
| browser | career_demo, DOM, localStorage | navegador desktop/tablet/mobile | DOM8 v1 | UX, responsividade, acessibilidade | QA 3 viewports, navegação e fluxo |
| browser bundle | `dist`, CommonJS | public/fmu-m24 | IIFE v1 | execução web | QA Chromium boot/JS errors |
| graph_stats | `m22/persistence/kryo_graph` | manutenção de save | Kryo stat v1 | ownership de nó | 4 testes |
| schema_diff | árvore decodificada | migração de campos | schema-diff v1 | diferenças de saves | 4 testes |
| bfn_inspect | `m22/persistence/native` | metadados de arquivo | BFN-header v1 | metadados apenas | 2 testes |
