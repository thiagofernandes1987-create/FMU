# QA técnico e visual M25 — incremento experimental

**Data:** 5 de novembro de 2026. **Referência:** M24 `7bf52ee`, upstream Brasfoot Next Rust `bd2ccbd`.

## Evidências verificadas

| Controle | Evidência | Estado |
|---|---|---|
| Baseline M24 | 355/355 testes, `baseline.log` | PASS |
| Rust sources | 231 SHA-256, `tools/m25_audit.py --check` | PASS |
| TypeScript `npm test` | **411/411**, `evidence/m25/full_test_411.log` | PASS |
| Testes M25 | **56 novos**: 31 live round, 12 replay, 13 S22 | PASS |
| Browser Chromium, rota replay | desktop 1440×900, tablet 768×1024, mobile 390×844, `tools/m25_browser_qa.py` | PASS |
| Browser click/teclado/download/import | `evidence/m25/browser_qa.log` + screenshots | PASS |
| Nav mobile, Esc, 9 telas, overflow | `evidence/m25/visual/` | PASS |
| Gols de replay versus resultado salvo | teste de domínio + Chromium desktop, `desktop_replay.png` | PASS |
| Save JSON original após replay | testes `m25_demo_replay.test.ts` | PASS |
| Duas temporadas sandbox | 2026–2027, 10 clubes, 90 partidas/temporada, `evidence/m25/two_seasons.log` | PASS |
| Compilação Rust, paridade `MatchEngine` / `World` | Rust diferencial não executado | UNVERIFIED |
| Import `.s22` / `.bfn` completo | somente preflight de grafo já decodificado | NÃO IMPLEMENTADO |
| Visual de estados modais, hover/focus de TODAS as telas | somente rotas relevantes testadas | PARCIAL |
| ZIP Git bundle/patch + extração | verificar no relatório final após geração | PENDENTE |

## Defeitos e correções durante QA

1. Erro de narrowing de `side` ao chamar `addEngineGoal`: corrigido por tipo `0|1`, sem alteração do valor.
2. Teste com placar matematicamente impossível em shootout: corrigida a fixture, não o algoritmo.
3. Teste TypeScript exigiu IDs de fixture com `!` explícito: corrigidos tipos do teste.
4. Plano Kryo originalmente retornava objetos mutáveis, apesar do contrato indicar imutabilidade: congela objetos e arenas antes de retornar; acrescentado teste de regressão.
5. O navegador precisou de execução com limite de 55 segundos para evitar espera não informativa; na repetição retornou PASS e capturas reais.

## Classificação

**M25:** código de frontend, controlador parcial de rodada e preflight Kryo estão testados; QA visual da nova tela PASS. **Projeto completo Rust→TS:** `RELEASE_BLOCKED` (35 fontes sem correspondência, API `World`/`MatchEngine` e importação real ainda incompletas). Nenhum MAJOR aberto foi aceito automaticamente.

## Correção adicional de integridade do QA

- Na primeira extração, a automação Chromium M25 gerava `evidence/m24/visual_qa.json`, alterando uma evidência legada ao rodar o script e invalidando sua verificação posterior de hash. Corrigido para `evidence/m25/visual_qa.json`, com caminhos de screenshots relativos à raiz do projeto.
- Procedimento de release: verificar SHA dos membros do ZIP **antes** de executar a automação de screenshots, pois ela atualiza arquivos de evidência como parte do teste. O ZIP original permanece intacto; nenhuma falha foi atribuída ao código do jogo.
