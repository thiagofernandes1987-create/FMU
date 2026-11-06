# FMU M27 — LIMITAÇÕES E BLOQUEIOS

- **BLOCKER M27-01:** 20 das últimas 26 fontes Rust continuam sem implementação TypeScript real, sobretudo testes diferenciais com fixtures `.s22` e golden de jogo. Os seis mapeados agora são pontos de entrada/ports parciais; não há conversão integral de todas as 26.
- **BLOCKER M27-02:** o `Sim::advance` e vários `ModSystems` não têm paridade funcional; converter o CBOR para tipos arena e regravar não torna a carreira executável. NÃO misturar `World` real com demo M24.
- **BLOCKER M27-03:** nenhum fixture completo de carreira `.bfn` produzida pelo jogo original está disponível nesta execução. O binário Linux original reconheceu o save sintético mas entrou em panic de arena vazia; teste end-to-end do Rust não aprovado.
- **MAJOR M27-04:** validação tipada verifica 89 structs/956 campos e refs, mas não todas as regras semânticas da engine (ex.: fase/seleções/táticas/calendário). `runtimePreflight.minimumReady` é mínimo, não garantia de execução Rust.
- **MAJOR M27-05:** importação `.s22` Kryo permanece parcial; não habilitar `import-s22` silencioso.
- **MINOR M27-06:** cborg JSON sem Lossless não preserva todo IEEE754; modo de World usa encoder com NaN/Infinity/−0 e testes específicos. Arquivos originais não são alterados no comando inspect.
- **MINOR M27-07:** o validador de pack CLI é parcial; `convert` e `pack` recusados enquanto o parser TOML/CSV completo não estiver disponível.

Nenhum desses BLOCKERs está aceito para a **conversão integral**. Metadados `release_ready` permanecem NO para todos os arquivos.
