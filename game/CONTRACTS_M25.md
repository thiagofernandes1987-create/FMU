# Contratos M25 — núcleo e UI

| ID | Componente | I/O | Invariantes | Compatibilidade | Testes |
|---|---|---|---|---|---|
| CT-M25-01 | `LiveRound` | LiveWorld + hooks → LiveRoundState | eventos done uma vez; tempo 1:49/2:51, fechamento único, placar deriva dos eventos | Mundo DTO, não World Rust | `m25_live_round.test.ts` |
| CT-M25-02 | `resolveLivePenalty` | jogo, evento, lado, RNG → marcou? | consumo RNG 6/5/100/7; gols e shots consistentes | engine.addGoal callback; RNG explicitamente injetado | M25 pênalti |
| CT-M25-03 | `playShootout` | game, RNG, ordem humana → vencedor | score, winner e 70%; no máximo 300 chutes | critérios de transição Rust | M25 shootout |
| CT-M25-04 | `DemoMatchReplay` | carreira/fixture → ReplayFrame | não altera dados da carreira; só gols preexistentes | Save M24 mantém schema `fmu-demo-v1` | `m25_demo_replay.test.ts` + Chromium |
| CT-M25-05 | `stageS22Import` | grafo Kryo decodificado/raízes → S22ImportPlan | duas classes canônicas; enumera nove arenas; `worldLoaded:false` | sem payload `.bfn` nem decodificador `.s22` | `m25_import_s22_graph.test.ts` |
| CT-M25-06 | `browser.ts`/CSS | Replay e ações DOM | não introduz overflow em 390px; 9 rotas; tab/menu e teclado | Desktop/tablet/mobile Chromium | `m25_browser_qa.py` |
| CT-M25-07 | Matriz | 231 SHA + dois status novos → percentual | soma status `!= UNPORTED`; 196/231 | porcentagem nominal, não funcional | `m25_audit.py --check` |
