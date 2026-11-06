# FMU Web Preview — GitHub Pages

**Endereço esperado:** https://thiagofernandes1987-create.github.io/FMU/

Este endereço depende da ativação do GitHub Pages no repositório e da conclusão de `FMU Web Preview - GitHub Pages`.

## Conteúdo publicado

A demonstração Web M25 incluída no código consolidado M29+M30. Nove telas, clubes e jogadores fictícios, avanço de rodada, táticas, mercado, resultados, classificação, finanças, mensagens e replay. Salva localmente no navegador, via `localStorage`, e permite exportar/importar JSON da demo. Não utiliza o banco privado `FMU_Database` e não carrega `.bfn` do motor original.

## Publicação

O workflow `.github/workflows/pages.yml` testa o projeto, recompila o bundle e publica o conteúdo de `game/public/fmu-m24/` na raiz do GitHub Pages. Os links CSS/JS são relativos (`./`), portanto funcionam sob `/FMU/`.

**Primeira ativação:** GitHub > FMU > Settings > Pages > Build and deployment > Source: **GitHub Actions**. Reexecute o workflow em Actions > `FMU Web Preview - GitHub Pages` > Run workflow. Se já estiver habilitado, o workflow da `main` publica automaticamente.

Este workflow usa `permissions: pages: write` e `id-token: write` para fazer o deploy sem credenciais pessoais. O código fica no repositório público; não inclua tokens nem dados reais no bundle.

## Testes de aceite

- `npm test` completo.
- `npm run m24:bundle` recompila o IIFE do navegador.
- Index HTML, CSS e JavaScript servidos com URLs relativos.
- QA visual Chromium: 1440×900, 768×1024, 390×844, 9 rotas, sem erros JS ou overflow.
- Carreiras exportadas/importadas permanecem **demos** e não são persistidas em servidor.