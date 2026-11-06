# M23 — Rastreabilidade de requisitos

| Req | Componentes | Contrato | Testes | Regressões | Artefatos |
|---|---|---|---|---|---|
| R23-01 navegação e carreira | app, career, career_screen, start, opening | CT-M23-01 | integration boot/save/rollback | M22 249 | src/m23/app/*.ts |
| R23-02 buscas/tabelas/troféus | search, leaders, champions, standings, club_ranking | CT-M23-02,04 | selectors/core | M21/M22 | docs/M23_APP_FUNCTIONS.csv |
| R23-03 escalações e calendário | lineup, round, pitch, calendar, view | CT-M23-03 | selectors/integration | M22 simulation | src/m23/app/*.ts |
| R23-04 pacotes e arquivos | patches, patch_library, patch_store, patch_download, game_files | CT-M23-05 | integration security | M22 datapack | src/m23/app/*.ts |
| R23-05 formatos/glifos/cores | format, glyphs, theme, widgets, modkit | CT-M23-06 | core/integration | M22 generated tables | src/m23/app/*.ts |
| R23-06 cobertura auditável | 60 fontes app | CT-M23-07 | tools/m23_audit.py --check | 231 hashes SHA | docs/M23_PORTING_MATRIX.csv |
| R23-07 compatibilidade com M22 | todos 60 módulos opt-in | CT-M23-08 | npm test | 249 regressões + 67 novas | evidências M23 |
| R23-08 conversão UI completa | egui render e navegação web | blocked | QA real mobile/tablet/desktop | obrigatório no full release | KNOWN_ISSUES_M23.md |
