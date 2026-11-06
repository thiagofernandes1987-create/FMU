# M23 — Matriz de dependências e impacto

| Comp. | Depends_on | Used_by | Contract | Impacto | Regs |
|---|---|---|---|---|---|
| `app/career`, `app/career_screen`, `app/app` | estado simplificado `CareerState`, `clone`, `run`; parâmetros BF_SCREEN/BF_TAB | controladores de navegação futuros | CT-M23-01 | save/rollback/flow de jogo | career + start + app |
| `app/market`, `app/offer`, `app/contract`, `app/loans` | DTO financeiro e usuário | futura integração Mercado + Ledger | CT-M23-04 | propostas e negociação | core/selectors/integration |
| `app/search`, `app/home`, `app/teams` | DTO Player/Club, filtros | busca e listagem de elencos | CT-M23-02 | filtros e resultados | selectors e integration |
| `app/lineup`, `app/pitch`, `app/round`, `app/calendar` | DTO partidas, slots, Clock | UI tática e calendário | CT-M23-03 | estado/ordem de escalação | selectors e integration |
| `app/patch_library`, `app/patch_store`, `app/patch_download`, `app/game_files` | path/URL/SHA/bytes, sem HTTP real | instalador futuro | CT-M23-05 | integridade e armazenamento | integration paths/patches |
| `app/format`, `app/widgets`, `app/glyphs`, `app/theme`, `app/modkit` | fonte Rust de constantes/formatação | componentes UX futuros | CT-M23-06 | visual/responsividade | core/integration, QA visual futuro |
| `tools/m23_audit.py`, `docs/M23_PORTING_MATRIX.csv` | SHA Rust snapshot + TS comp. | relatório/release | CT-M23-07 | indicadores/progresso | audit --check |
| `upstream/...`, `public/..._bg.wasm` | snapshot original | runtime de referência | Sem equivalência TS | execução do Rust original, não port de fonte | WASM integrity; sem QA visual |
