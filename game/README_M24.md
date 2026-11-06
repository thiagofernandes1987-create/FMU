# FMU M24 — Carreira web demonstrativa e utilitários de persistência

Uma interface funcional com **8 telas** (Painel, Elenco, Táticas, Calendário, Classificação, Mercado, Finanças e Mensagens), dados **fictícios** e temporadas determinísticas no navegador. Implementada em TypeScript/HTML/CSS, ligada aos seletores reais do M23; sem dependências npm adicionais.

## Executar

```bash
npm run m24:bundle
npm test
npm run m24:two-seasons
python3 -m http.server 8000 --directory public
```

Abra **http://localhost:8000/fmu-m24/**. Jogar rodada, trocar tática, contratar e salvar/importar JSON são ações funcionais. Não tente abrir saves `.bfn` — o importador desta demonstração aceita somente `fmu-demo-v1` JSON. O jogo Rust original também está em `public/brasfoot-next-0.1.0-web/`, separado da interface M24.

## Verificar QA visual

`python3 tools/m24_browser_qa.py` requer Python Playwright e Chromium. O teste abre exatamente os arquivos compilados como conteúdo injetado na página do Chromium porque a navegação localhost/file foi bloqueada pela política do ambiente de teste. Renderiza desktop (1440×900), tablet (768×1024) e mobile (390×844); testa overflow, ações, save, menu, erro de upload e captura screenshots em `evidence/m24/visual/`.

## Gerar pacote

A entrega contém código-fonte TypeScript, JavaScript compilado, frontend web, ferramentas, testes e screenshots. Guia de funções `docs/M24_MODULE_GUIDE.md`, matriz `docs/M24_PORTING_MATRIX.csv`, histórico Git e patch M23→M24.

## Cobertura

M23 **185/231 = 80,09%** → M24 **194/231 = 83,98%**, avanço **+3,90 pontos percentuais**. **37 fontes Rust** continuam sem correspondência; os arquivos mapeados são parciais. Esta métrica NÃO mede paridade funcional. Não há alegação de motor Rust completamente convertido.

Licença derivada **GPL-3.0-only**. Não inclui banco de dados privado nem fontes proprietárias.
