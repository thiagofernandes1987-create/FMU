# FMU M27 — Guia de conversão, contratos e dependências

**Fonte:** snapshot Rust Brasfoot Next `bd2ccbdd`; M26 Git commit `f437e8b`. **Licença:** GPL-3.0-only.

## O que efetivamente foi implementado

| Componente | Origem Rust | Funções e entradas/saídas | Efeitos e limites | Evidência |
|---|---|---|---|---|
| `src/m27/persistence/world_schema.generated.json` | `model/saved.rs`, `model/mods.rs`, `model/world.rs`, `ids.rs` | **89 structs, 956 campos**, enums e nove arenas com tipos exatos extraídos automaticamente | somente metadados; a existência de esquema não traduz os métodos Rust | `tools/m27_generate_world_schema.py --check` |
| `src/m27/persistence/bfn_world.ts` | `persistence/native.rs`, `migrations.rs`, `model/save_numbers.rs` | `loadBfnWorld(bytes,opts) → WorldDocument`, `migrateWorld`, `validateRustWorld`, `worldArenaObject`, `relinkWorldReferences`, `encodeWorldDocument`, `writeBfnWorldAtomic` | decodifica, migra, valida estruturas e referências; grava arquivo via fsync/rename e três backups; **não executa a simulação original** | `tests/m27_bfn_world.test.ts` |
| `src/m27/persistence/world_cli.ts` | `persistence/examples/open_bfn.rs`, `native.rs` | `inspectWorldFile(path) → WorldSummary`, `upgradeWorldFile(in,out) → WorldSummary` | read-only por padrão; upgrade grava `.bfn` v3 validado | `tests/m27_bfn_world.test.ts` |
| `src/m27/persistence/world_access.ts` | `model/world.rs`, `saved.rs` | `viewWorldClub/Player/Match(doc,id) → view`, `worldTransaction(doc,mutate) → newDoc` | consultam o **World real**, não a carreira fictícia; `worldTransaction` recusa dangling refs sem mutar o original | `tests/m27_world_access.test.ts` |
| `src/m27/simulation/entrypoints.ts` | `simulation/src/lib.rs` | `matchdayRivalry` (derbi por base e tabelas), `noSimulationSystems` defaults | funções portadas; `advanceOriginalWorld` retorna erro proposital até o motor completo existir | `tests/m27_entrypoints.test.ts` |
| `src/m27/datapack/cli.ts` | `datapack/src/bin/brasfoot-data.rs` | `splitDataArgs`, `dataOption`, `readPackTree`, `readPackManifest`, `inspectDataPack` | validador parcial de pastas e manifest; `convert` e `pack` recusam execução sem parser real | `tests/m27_entrypoints.test.ts` |
| `src/m27/{datapack,engine,model,persistence}/index.ts` | 4 × `lib.rs` | Reexports **48 módulos públicos** nos namespaces de Rust | preserva superfície de organização, **não garante paridade dos módulos internos** | `tests/m27_barrels.test.ts` |
| `src/m26/persistence/cbor.ts`, `bfn_codec.ts` | `persistence/native.rs` | CBOR com `allowNonFinite` (Infinity/NaN/−0) e Zstd com checksum | `encodeCbor()` padrão continua rejeitando não-finitos; escrita de World preserva bits IEEE-754 dentro da capacidade JS | M26 e M27 regressões |

## Invariantes do World

- **Envelope:** frame ignorável com `BFNX` e `SaveMeta`, seguido por Zstd/CBOR. SaveMeta é validado conforme tipos Rust (`format_version`, versão, clube, técnico, data, ano e timestamp).
- **Migração v1→v2:** restaura `save_number`/`save_list` e `player_number`/`player_list` nos transferidos usando exatamente a ordem do calendário de atletas originais.
- **Migração v2→v3:** renomeia campos de copas, eliminatórias, registros e classes; ajusta `competition_number`. Não altera o arquivo de entrada, salvo `upgrade` explicitamente solicitado.
- **Identidades:** `PlayerId`, `ClubId`, `MatchId`, `CompetitionId`, `StageId`, `CoachId`, `StadiumId`, `CountryId` e `StateLeagueId` continuam índices `u32` das **nove arenas**. Nenhum id é renumerado na decodificação.
- **Tipos:** opções, vetores, tuplas, matrizes fixas, mapas ordenados e inteiros `i64/u64` são checados. Campos desconhecidos, CBOR tags, `bigint`, `Uint8Array` e `Map` são preservados no round-trip.
- **Validação em dois níveis:** `validation.valid` significa **estrutura Rust + referências**; `runtimePreflight.minimumReady` é pré-condição mínima (calendário, clubes, atletas, técnicos, cursor). **Ambos não substituem uma execução completa na engine Rust**.
- **Escrita:** `writeBfnWorldAtomic` usa arquivo `*.tmp` exclusivo, loop completo de escrita, `fsync`, rotação `bak1..3`, `rename` e fsync de diretório quando suportado. Falhas de validação não tocam o arquivo de origem.
- **Segurança:** tamanho limitado de quadro, limite de profundidade CBOR, nenhum eval nem execução de código importado. Não abrir `import_s22` automaticamente — esse formato continua sem importação geral completa.

## Teste cruzado com o binário Rust original

O executável Linux `brasfoot-next-0.1.0` foi iniciado com `BF_OPEN` apontando para um **World sintético completo no esquema, porém vazio de arenas**. Ele chegou à inicialização do `World` e produziu o panic `world.rs:42:1 index out of bounds: len 0`, **não um erro de leitura do envelope**. Isso é indício de interoperabilidade do transporte, mas **não valida uma carreira jogável nem substitui fixtures reais**. O preflight M27 agora recusa esse exemplo como jogável.

## Comandos

```bash
npm test                              # M26 453 + M27 49
npm run m27:tests                     # somente novos testes
npm run m27:audit                     # hashes Rust e schemas
node dist/src/m27/persistence/world_cli.js inspect /caminho/carreira.bfn
node dist/src/m27/persistence/world_cli.js upgrade entrada.bfn saida.bfn
```

`upgrade` usa migrações antigas quando necessárias, aplica validação completa antes da gravação e emite um novo `.bfn` na versão 3. Jamais use esse comando na única cópia de uma carreira sem backup, mesmo com a rotina de rotação. Um save Rust completo precisa de campos reais e invariantes de jogo válidas.

## Faltam 20 fontes, sem conversão funcional integral

Os **26 arquivos finais foram todos inventariados e classificados** em `docs/M27_LAST_26_GAP_MATRIX.csv`: seis receberam código TypeScript testado neste lote; vinte permanecem `UNPORTED`, principalmente testes diferenciais que dependem de `.s22` e resultados golden não presentes, e exemplos que exigem o loop Rust completo. Barrels de bibliotecas e testes sintéticos não são equivalentes à engine Rust. A cobertura nominal do repositório vai de 205/231 para **211/231 = 91,34%**; a taxa **de paridade funcional completa não é mensurável**, pois muitos dos 211 já eram parcialmente portados.
