# FMU M28 — QA / release evidence

## Evidências
- Base M27 restaurada do Git `97523f9` → **502/502** PASS (`evidence/m28/baseline_502.log`).
- M28 incremental: **67 novos testes** em `tests/m28_*.test.ts`, cobrindo `save_numbers`, finanças, calendário, transferência, auditoria, CLI e ciclo `.bfn`.
- M28 regressão completa: **569/569 PASS** (`evidence/m28/regression_569.log`).
- Simulador TypeScript legado M24: 2 temporadas fictícias, 10 clubes, 90 jogos por temporada, PASS. **Não valida a engine Rust**.
- Auditoria M27 de 231 fontes Rust, 89 structs, 956 campos e quatro barrels: PASS, sem divergências SHA-256 (`evidence/m28/rust_inventory_audit.log`).
- UI/CSS não alterados: QA visual **NÃO APLICÁVEL** a esta alteração.
- Rust cargo/rustc não disponíveis; teste diferencial World `UNVERIFIED`.

## Cobertura
M27: 211/231 (91,34% nominal). M28: **211/231 (91,34% nominal)**. Delta: **0,00 p.p.** (quatro fontes aprofundadas, nenhuma nova fonte nominal). Fontes Rust ainda UNPORTED: 20. Equivalência funcional integral desconhecida.

## Bloqueios de release integral
Ver `KNOWN_ISSUES_M28.md`. A persistência é estrutural e cross-arena; a engine Rust `Sim::advance`, o importador completo de `.s22`, diferenciamento de todas as provas Golden e a carreira real de várias temporadas continuam sem homologação. **Não anunciar jogo integral concluído**.

## Prova de pacote
- Git bundle M28 foi clonado em diretório novo e `npm test` obteve **569/569 PASS** (`/mnt/data/FMU_M28_Work/bundle_tests.log`).
- Patch M27→M28 sobre commit `97523f9` obteve **tree Git idêntica** e `npm test` **569/569 PASS** (`/mnt/data/FMU_M28_Work/patch_tests.log`).
- ZIP preliminar extraído em pasta limpa: `npm test` **569/569 PASS** (`/mnt/data/FMU_M28_Work/zip_tests.log`).
- Verificações internas SHA-256 do ZIP preliminar: **1015/1015 PASS**, `ZipFile.testzip()` PASS.
- Git bundle E patch **extraídos do ZIP**: ambos reproduziram a tree Git `673343c6921610de801a9a500d64a1d8bc6c791f` idêntica ao repo M28; clone independente com **569/569 testes PASS**.
- A versão definitiva é revalidada após esta atualização de documentação. Resultado/checksum externo em `FMU_Next_M28_QA_FINAL.md`.

Status: **incremento M28 PASS até aqui; release integral continua BLOCKED**.
