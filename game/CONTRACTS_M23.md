# M23 — Contratos de domínio e compatibilidade

| ID | Componente | Entrada → saída / tipos | Invariantes | Compatibilidade | Teste |
|---|---|---|---|---|---|
| CT-M23-01 | `career.ts` | `CareerState<W>`, `clone`, `run` → mutação com rollback do `world` | erro restitui snapshot de world | adapter opt-in; Ledger, RNG e FS fora da transação | M23 career |
| CT-M23-02 | `search.ts` | `SearchViewState` → filtro | padrão força 1..100 / idade 16..45; máximo especial idade 100 | Rust screen filtering, sem engine query | M23 search |
| CT-M23-03 | `lineup.ts` | `LineupView`, slot → novo estado | 14 formações; troca sem mutação; clique vazio não seleciona | view-only, não escala XI no Rust engine | M23 lineup |
| CT-M23-04 | `leaders.ts` e `club_ranking.ts` | resumo clube/jogador → ranking | limite 401 líderes; desempates estáveis | sem leitura direta de arenas Rust | M23 leaders/ranking |
| CT-M23-05 | `patch_library.ts`, `patch_store.ts`, `game_files.ts` | caminhos, chaves, bytes → DTO/Promise | sem traversal, hashes canônicos, clone dos bytes | `MemoryPatchStore` não equivale a disco/HTTP | M23 patches/paths |
| CT-M23-06 | `format.ts`, `widgets.ts`, `theme.ts`, `pitch.ts` | números e tokens → formatação/cores/posições | cores e coordenadas extraídas de Rust | UI renderer não implementado | M23 format/pitch/theme |
| CT-M23-07 | `docs/M23_PORTING_MATRIX.csv` | fonte Rust/TypeScript → status | 231 hashes SHA256, 60 novas implementações | todos `release_ready=NO` e `differential_rust_verified=NO` | m23_audit.py |
| CT-M23-08 | `src/m23/app/*.ts` | DTOs → estados de tela | código puro/opt-in, sem enganar como full egui | visual QA bloqueado para release de app | M23 67 testes + 249 anteriores |
