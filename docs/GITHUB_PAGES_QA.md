# FMU — GitHub Pages QA

Data: 2026-11-06. Source: branch main do FMU, pacote M29+M30 consolidado. Escopo: site estático da carreira demonstrativa.

- Testes TypeScript da base M29+M30: 663/663 PASS.
- Bundle navegador recompilado de TypeScript: PASS, 7 módulos, 73.828 bytes.
- QA Chromium renderizado: desktop 1440x900, tablet 768x1024, mobile 390x844, sem erros JavaScript e sem overflow horizontal.
- Navegação: nove telas PASS. Simulação, troca de formação, contratação, replay e export/import JSON PASS.
- Recursos relativos: `./app.css`, `./app.bundle.js` — apropriados para o projeto `/FMU/`.
- Advertência de ambiente de demonstração: presente na interface e metadados.
- Persistência: localStorage e JSON manual, **não** FMU_Database nem World `.bfn` real.

## Critério para declarar "publicado"

A publicação é confirmada somente após (a) GitHub Actions `deploy-pages` sucesso e (b) URL `https://thiagofernandes1987-create.github.io/FMU/` responder com HTML e ativos. Se Pages estiver desativado, mudar Settings > Pages > Source para GitHub Actions e reexecutar. Não alegar que já está online se estes critérios não passarem.