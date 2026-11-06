# M23 — Achados e pendências

| ID | Severidade | Estado | Impacto / próximo gate |
|---|---|---|---|
| B23-01 | BLOCKER full release | OPEN | 46 fontes Rust `UNPORTED`; muitas das 185 existentes têm somente funções ou constantes parciais. |
| B23-02 | CRITICAL full app UI | OPEN | os 60 view-models não renderizam as telas `egui` nem uma web UI; renderização, responsividade, acessibilidade e QA visual ainda pendentes. |
| B23-03 | BLOCKER diferencial | OPEN | Rust Cargo/rustc ou fixtures referenciais não disponíveis neste ambiente; nenhuma paridade binária ou E2E comprovada. |
| B23-04 | MAJOR não aceito | OPEN | patch downloader, persistência de saves e integração ao `World`/`Ledger` reais faltam. Os métodos em memória não são substitutos de HTTP ou FS. |
| B23-05 | MAJOR não aceito | OPEN | carreira `advanceCareer` recupera o estado `world`, não efeitos externos do callback (RNG/FS/ledger); precisa transação abrangente. |
| B23-06 | MINOR | FIXED | o primeiro teste de JSON comparava campos `undefined` preservados; corrigido para validar estado serializado real, adicionando cobertura. |

**Status de release:** M23 incremental TypeScript pode ser distribuído após teste e integridade. Substituição integral de app/Rust e visual QA: `RELEASE_BLOCKED`.
