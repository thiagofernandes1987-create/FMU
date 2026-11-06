# FMU M25 — Rodadas, Replay e pré-importação `.s22`

O M25 amplia o M24 com **nona tela de replay**, rodadas com eventos derivados da lógica Rust e pré-validação de grafos Kryo. Os placares exibidos no replay já foram produzidos pela carreira demonstrativa; os minutos são ilustrativos e **não** representam o motor Rust.

## Execução

```bash
node --version     # testado em Node 22
npm run build
npm run m25:tests
npm test
npm run m25:bundle
npm run m25:browser-qa  # requer Chromium + Playwright
npm run m24:two-seasons
```

Para abrir no navegador, utilize `public/fmu-m24/index.html` com os arquivos `app.css` e `app.bundle.js` gerados pelo bundle. Para servir localmente:

```bash
python3 -m http.server 8000 --directory public/fmu-m24
```

> O M25 é demonstração fictícia com save JSON `fmu-demo-v1`. Não lê `.bfn` nem salva `.s22` e não foi implantado em servidor. O navegador de QA utilizou HTML/CSS/JS real injetado no Chromium porque a navegação localhost foi bloqueada neste ambiente.

### Documentação

- `docs/M25_MODULE_GUIDE.md`: funções, I/O, dependências, invariantes e testes.
- `docs/M25_PROGRESS.json`: percentual calculado e status de mapeamento por crate.
- `docs/M25_PORTING_MATRIX.csv`: inventário canônico das 231 fontes Rust.
- `CONTRACTS_M25.md`, `DEPENDENCY_MATRIX_M25.md`, `TRACEABILITY_MATRIX_M25.md`: contratos para correção incremental.
- `QA_REPORT_M25.md`, `KNOWN_ISSUES_M25.md`: evidências e bloqueios de release integral.

**Cobertura nominal:** 196/231 = **84,85%** (+0,87 ponto percentual sobre M24), 35 fontes `UNPORTED`. Inclui implementações parciais; paridade funcional Rust→TypeScript **não aferida**. Licença GPL-3.0-only, respeitando a origem do projeto.
