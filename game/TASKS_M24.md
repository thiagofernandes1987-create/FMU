# FMU M24 — migração funcional de UI, carreira e persistência de demonstração

## Objetivo / escopo
Portar fluxos demonstráveis da interface `app` em TypeScript (não fingir que todo egui foi convertido), preservar M23, fornecer navegação e ações reais de uma carreira **fictícia de sandbox**, testar Browser+Node e realizar replay Git/ZIP.

### Marcos
- [x] T01 — Restaurar M23, executar baseline 316/316 e inventariar 46 fontes sem correspondência.
- [x] T02 — Criar núcleo de carreira demo testável: calendário, simulação determinística, finanças, elenco, contratos, contratações, progressão e save/reload JSON.
- [x] T03 — Implementar SPA responsiva com telas reais e conectá-la aos seletores TS M23 (não DOM decorativo).
- [x] T04 — Testes técnicos do núcleo/ações/erros + suíte completa e QA visual Chromium desktop/tablet/mobile; corrigir defeitos.
- [x] T05 — Reconciliar matriz e percentuais por fonte, guia/contratos/rastreabilidade, riscos de divergência Rust.
- [x] T06 — Validar bundle/patch, ZIP e SHA; replay em clone limpo; 355/355 testes e QA visual Chromium sobre extração. Evidência: `evidence/m24/replay_bundle_tests.log`, `evidence/m24/zip_pre_tests.log`, `evidence/m24/zip_pre_browser_qa.log`.

### Contratos
- Fonte canônica: Brasfoot Next Rust `bd2ccbd`; base TypeScript M23 `9873184`.
- Sistema novo de carreira tem **dados fictícios** e simulação simplificada; não confundir com o motor Rust ou importador `.bfn`.
- UI Browser deve ser navegável e responsiva, sem ações fictícias, com HTML escapado e validações dos dados.
- Visual: desktop 1440x900, tablet 768x1024 e mobile 390x844; screenshots e inspeção real.
- Sem paridade Rust, sem alegar conclusão integral. Maior prioridade: qualidade verificável, menor mudança possível para defeitos.
