# M24 — QA de interface real e carreira demonstrativa

**Dados:** snapshot Rust Brasfoot Next `bd2ccbd`; base TS M23 commit `9873184`.
**Scope:** aplicação HTML/CSS/TypeScript de oito telas conectadas a carreira fictícia; três utilitários de persistência; exemplos e testes de app convertidos parcialmente. Sem alteração do WASM original.

## Resultado técnico

| Controle | Resultado | Evidência |
|---|---|---|
| Baseline M23 | 316/316 PASS | `evidence/m24/baseline_M23_316.log` |
| Testes novos TypeScript | 39/39 PASS | `tests/m24_*.test.ts` |
| Suíte completa M24 | **355/355 PASS** | `evidence/m24/full_tests_355.log` |
| 8 temporadas fictícias reproduzíveis | PASS | `m24_web_career.test.ts` |
| 2 temporadas CLI | PASS — 90 jogos/temporada | `evidence/m24/two_seasons.log` |
| Saldo, contratação, titulares e save JSON | PASS | testes M24 + browser Chromium |
| 8 telas DOM com navegação | PASS | `tools/m24_browser_qa.py` |
| Desktop 1440×900 | PASS | `evidence/m24/visual/desktop_overview.png` e `desktop_tactics.png` |
| Tablet 768×1024 | PASS | `evidence/m24/visual/tablet_overview.png` e `tablet_standings.png` |
| Mobile 390×844 | PASS | `evidence/m24/visual/mobile_overview.png`, `mobile_squad.png`, `mobile_market.png` |
| Transbordamento horizontal (3 viewports) | Nenhum | `evidence/m24/visual_qa.json` |
| JS exceptions (3 viewports) | Nenhuma | `evidence/m24/visual_qa.json` |
| Esc fecha menu, rota, tática, mercado, download/upload e erro de save | PASS | QA Chromium |
| Fontes Rust SHA-256 | 231/231 PASS | `docs/M24_PROGRESS.json` |
| Compatibilidade com o motor Rust e `.bfn` | NÃO VERIFICADA / NÃO IMPLEMENTADA | ver `KNOWN_ISSUES_M24.md` |
| Replay Git bundle e patch M23→M24 | PASS — árvore Git idêntica | `evidence/m24/replay_bundle_tests.log` e comparação de árvore |
| ZIP extraído e recompilado | PASS — 355/355 | `evidence/m24/zip_pre_tests.log` |
| QA Chromium na extração | PASS — 3 viewports, sem erros | `evidence/m24/zip_pre_browser_qa.log` |
| Integridade de arquivos ZIP | PASS — 847/847 hashes preliminares | `SHA256SUMS.txt` no ZIP |

## Loop de defeitos (corrigidos, sem redesign)

1. **CRITICAL no domínio sandbox:** condição física acima de 100% impedia exportar saves após várias rodadas; teto limitado a 100 e teste de regressão de várias temporadas.
2. **MAJOR no domínio sandbox:** fluxo de 8 temporadas acumulava dívida abaixo do limite aceito; adicionado patrocínio fictício de R$ 3,5 milhões no início de cada temporada e comunicado na UI.
3. **MINOR visual:** cabeçalho mobile ultrapassava a viewport em 3 px. Reduzido padding/gap; screenshot real e teste sem overflow.
4. **MINOR UX/acessibilidade:** tecla Esc falhava quando o foco estava fora da raiz do app. Handler movido ao document; QA do menu.
5. **MAJOR em apresentação tática:** titulares sem atacante na primeira escalação. Agora escala 1 GOL / 4 DEF / 3 MEI / 3 ATA, teste automatizado adicionado.
6. **MINOR boot:** storage indisponível em ambiente bloqueado era confundido com save corrompido. Startup diferencia ambos.

## Auditoria visual

A UI foi **realmente renderizada** em Chromium com o mesmo HTML, CSS e bundle compilado da entrega. O navegador Playwright bloqueou URL localhost e file pelo ambiente, portanto o QA injeta o conteúdo local diretamente em uma página do Chromium. O resultado de layout e ações DOM é validado; **não é uma homologação HTTP/deployment nem comparação com um screenshot egui aprovado**.

Revisões: hierarquia do dashboard, contraste, legibilidade, sobreposições/z-index, navegação e botões, tabelas de rolagem interna, mensagens de erro, desktop/tablet/mobile, campo tático, estados vazios e pós-partida. Não testamos todos os estados hover/focus/disabled em cada viewport; hover/focus visual continua parcial.

## Indicadores de conversão

- M23: **185/231 = 80,09% nominal**.
- M24: **194/231 = 83,98% nominal** (+9 fontes; **+3,90 p.p.**).
- 37 fontes sem qualquer correspondência; mapeamentos existentes incluem adaptações parciais e ferramentas de teste. **Isso NÃO representa 83,98% de paridade funcional.**

## Status

**Incremento M24:** compilação/testes/UI sandbox PASS; liberação completa Rust/egui **RELEASE_BLOCKED**. Nenhum MAJOR pendente foi aceito como equivalência do produto.
