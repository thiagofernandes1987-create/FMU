# TASKS — FMU M27 (escopo congelado)

## Goal / I/O
- Input: M26 commit `f437e8b`, 231 fontes Rust sha verificados, codec .bfn M26, source schema `saved.rs/mods.rs/world.rs`.
- Output: M27 TypeScript compilado, 26 fontes restantes inventariadas, carregador de World e persistência, testes, matrizes, bundle, patch M26→M27, ZIP com manifest e checksums.
- Requisito solicitado: converter integralmente as últimas 26 fontes Rust, incluindo um `.bfn` em World executável.
- Limite objetivo: 20 das 26 fontes são principalmente testes diferenciais/exemplos que exigem fixtures `.s22` e motor Rust inexistentes; não declarar aceite integral.

## Milestones verificáveis
- [x] Restaurar M26 Git, baseline 453/453 PASS — `FMU_M27/baseline.log`.
- [x] Gerar esquema de 89 structs/956 campos Rust, hashes verificáveis.
- [x] Implementar load .bfn→World tipado estrutural, validação das nove arenas, migrações v1/v2 e referências, preservando dados desconhecidos.
- [x] Persistência `.bfn` v3 com escrita atômica, backups e transação copy-on-write, testes de round-trip e corrupção.
- [x] Implementar CLI World, port parcial simulation/lib, datapack/bin e barrels das 4 crates.
- [x] Mapear individualmente os 26 arquivos em `docs/M27_LAST_26_GAP_MATRIX.csv` com bloqueios e fontes.
- [x] Testes de unidade/regressão 502/502 PASS; sem UI alterada.
- [ ] Portar integralmente as 20 fontes ainda `UNPORTED`, inclusive testes diferenciais e exemplos Rust (BLOCKER).
- [ ] Demonstrar load, simulação e persistência **jogáveis** com save real Brasfoot Next e golden Rust (BLOCKER; fixture real não fornecido).
- [x] Verificação de release em clone Git e patch replay: mesma árvore e 502/502 testes; ZIP preliminar extraído com 502/502 testes e 972 hashes conferidos. Pacote definitivo requer validação repetida.

## Principais evidências
- M26 453/453 baseline; M27 502/502 regressões TypeScript.
- M27 teste do executável original: arquivo sintético lido até o uso de arena; panic de `World` vazio. Não homologado.
- M27 231/231 hashes Rust, 211/231 correspondências nominais, 20 ainda UNPORTED; equivalência 100% não demonstrada.

**Status solicitado (converter tudo): RELEASE_BLOCKED.**
**Status incremento limitado M27: testes e artefatos preliminares verificados; pacote definitivo requer QA final.**
