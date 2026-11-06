# Matriz de dependências

| componente | depends_on | used_by | contract/version | impacto | testes relevantes |
|---|---|---|---|---|---|
| rng.ts | BigInt, Java LCG | advance, checkpoint, demo | TX-01/TX-02 v1 | resultados, reprodutibilidade e rollback | rng, parity Java, advance |
| world.ts | Rust saved.rs/world.rs/player.rs | records, advance, checkpoint, bridge | TX-03 v1 | integridade arenas, finanças e física | world, bridge, advance |
| records.ts | world | demo hook e consumidores originais | TX-05 v1 | confrontos, bilheteria, classificação | records, demo 2 temporadas |
| advance.ts | world, RNG, hooks puros externos | jogo real, CLI demo | TX-04 v1 | ordem da rodada, temporada, rollback | advance, persistence |
| persistence.ts | node fs, v8, crypto, world, rng | CLI e testes | TX-06 v1 | recuperação e backups | persistence |
| bridge.ts | WorldDocument decodificado M28/M29 | jogo original integrador | TX-07 v1 | mapeamento CBOR→World parcial | bridge |
| demo.ts | World, RandomSource, advance hooks | testes, cli | sandbox v1 | demonstração não real | advance e cli |