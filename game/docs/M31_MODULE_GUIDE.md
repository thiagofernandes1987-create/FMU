# FMU M31 — Guia técnico de funções, dependências e limites

Snapshot Rust: `bd2ccbdd5f1aaacb6437b58b198d7963c61b3780` (GPL-3.0-only). Base FMU M29+M30: Git commit `7a8f8d5`. Este incremento não altera a interface Web nem o banco FMU_Database.

| Arquivo TypeScript | Fonte Rust | Entradas → Saídas | Efeitos / invariantes | Teste |
|---|---|---|---|---|
| `m31/persistence/kryo_graph.ts` | `persistence/kryo/graph.rs` | `KryoGraph`, `KryoValue`, `KryoNodeData`; `validateKryoGraph(graph)` | IDs explícitos de classes, strings e nós; `BigInt` i64, bits f32/f64; recusa refs quebradas e número de campos errado | M31 tipos, ciclos, arrays |
| `m31/persistence/kryo_reader.ts` | `persistence/kryo/reader.rs` | `readKryoGraph(bytes,schema,limits) → KryoGraph`; `KryoStreamReader.readAll()` | Classe registrada/dinâmica, referência e nome resetados a cada raiz; objetos/array/mapa/calendário/enum/boxed, limites | M31 37 testes de parser/canonical |
| `m31/persistence/kryo_canonical.ts` | `persistence/kryo/canonical.rs` | `canonicalKryoGraph(graph) → UTF-8 text` | Formato `N,z,b,s,c,i,l,f,d,S,E,{,[,<,@,^`; raízes com ids independentes; escapes exatos | M31 golden sintético |
| `m31/persistence/kryo_compare.ts` | `systems/tests/world.rs`, `simulation/tests/world.rs` (diagnóstico) | `firstCanonicalDifference(actual,expected) → diff?`, `checkCanonicalAgainstGolden(...,input,provenance) → PASS/FAIL/UNVERIFIED` | recusa alegação de paridade sem SHA do input e proveniência de execução; aponta primeiro campo divergente | M31 diff |
| `m31/persistence/kryo_cli.ts` | `persistence/examples/canonical_dump.rs` | `canonical save.s22 schema.json [out.txt]`, `diff save.s22 schema.json golden.txt[.zst]` | lê bytes reais somente com esquema explícito; arquivo escrito somente quando destino indicado; `.zst` via Node | M31 CLI local |
| `m31/persistence/s22_preflight.ts` | `persistence/import/mod.rs`, `import/context.rs` | `preflightS22Bytes(bytes,schema) → S22BinaryPreflight` | valida raízes `best.f` e `best.ay` e 9 arenas ordenadas, `worldLoaded:false` obrigatório | M31 6 testes |
| `m22/persistence/kryo_input.ts` (aprofundado) | `persistence/kryo/input.rs` | leitura IEEE bits f32/f64, `readString` | preserva NaN payload, limita tamanho e evita estouro de pilha UTF-16 longo; regressões antigas preservadas | M22+M31 |

## Executar

```bash
npm run m31:tests
npm run m31:audit
npm test
npm run m31:kryo -- canonical tests/fixtures/m31/synthetic-object.s22 tests/fixtures/m31/synthetic-kryo-schema.json
npm run m31:kryo -- diff tests/fixtures/m31/synthetic-object.s22 tests/fixtures/m31/synthetic-kryo-schema.json tests/fixtures/m31/synthetic.canon.txt
# Para save original, fornecer o esquema EXTRAÍDO DO JAR e o .s22 original:
node dist/src/m31/persistence/kryo_cli.js canonical /dados/carreira.s22 /dados/kryo-schema.json /tmp/carreira.canon.txt
```

A fixture `tests/fixtures/m31/synthetic-object.s22` é um *grafo sintético* de classe `Thing`, **não** é um save Brasfoot real nem prova diferencial com Java. O esquema completo `data/kryo-schema.json` gerado pelo exporter do jogo não acompanha o snapshot Rust. O parser é implementado contra o contrato de wire (449 linhas de `reader.rs`) e a comparação canônica segue o Rust, mas **não foi avaliado sobre a stream real do jogo**.

## Lacunas

1. Não há `kryo-schema.json` original nem fixtures de diferencial `fictional.s22`/`fictional.canon.txt.zst` no material recebido; portanto o status com esses arquivos é `UNVERIFIED`.
2. `preflightS22Bytes` retorna grafo tipado e arenas, não `World` funcional: faltam os 11 conversores semânticos `import/generated.rs` e o ciclo Rust da carreira.
3. Duas fontes não mapeadas ganharam correspondência **parcial**: `examples/canonical_dump.rs` e `tests/kryo_differential.rs`; restam 18 `UNPORTED`. **213/231 = 92,21% nominal**, não funcional.
4. O formato nativo `.bfn` e a UI demonstrativa continuam intactos; o importador `.s22` não grava nem sobrescreve saves automaticamente.
