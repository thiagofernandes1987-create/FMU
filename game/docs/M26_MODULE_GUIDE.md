# FMU M26 — Codec nativo `.bfn` e diagnósticos de carreira

**Origem:** Brasfoot Next Git `bd2ccbdd5f1aaacb6437b58b198d7963c61b3780` (GPL-3.0-only). Base TS M25 commit `164b2e7`.

**Duas conquistas separadas:** (1) o encoder/decoder de saves `.bfn` agora interpreta **Zstd e CBOR**, em Node.js; (2) ferramentas read-only de comparação e inspeção foram derivadas de exemplos Rust. A saída continua sendo um **grafo CBOR genérico**, não um `World` Rust restaurado.

## 1. Codec de save binário

| Função | Fonte Rust / contrato | Entrada → saída | Dependências | Testes |
|---|---|---|---|---|
| `decodeCbor` | `persistence/native.rs` via ciborium, reader CBOR auxiliar | `Uint8Array` → `CborValue` | `TextDecoder`, `DataView` | M26 valores, tags, limites, corruptos |
| `encodeCbor` | suporte ao envelope de `native::encode_save` | tipos CBOR → bytes | `TextEncoder`, BigInt | M26 round-trip |
| `readBfnPayload` | `native::decode_save` até decodificação CBOR | `.bfn` → `{meta, payload, worldLoaded:false}` | `decodeBfnHeader`, `node:zlib.zstdDecompressSync` | M26 BFN, fixture |
| `writeBfnPayload` | `native::encode_save` envelope básico | metadados + CBOR → `.bfn` sintético | `encodeBfnHeader`, `zstdCompressSync` com checksum | M26 BFN, `zstd -t` CLI |
| `summarizeBfnPayload` | leitura do cabeçalho/payload | payload → nomes de campos e sinalização de migração | saída CBOR | M26 BFN |

**Invariantes e limites:** entrada comprimida até 64 MiB, descompressão até 64 MiB, CBOR até 64 MiB, profundidade padrão 96 e até 1.000.000 de elementos. Inteiros acima de `Number.MAX_SAFE_INTEGER` são retornados como `bigint`, com precisão preservada. Dicionários com chaves de texto são construídos com protótipo nulo (inclusive `__proto__`). CBOR indefinido, tags e mapas com chaves numéricas são aceitos. Não serializar diretamente `bigint` com `JSON.stringify`; os resumos CLI não expõem estruturas BigInt arbitrárias.

**Compatibilidade:** a fonte Rust inclui `MIGRATIONS` de v1→v2→v3, desserialização tipada, backups atômicos, esquema de arenas e referências. Essas rotas **NÃO estão completas aqui**; v1/v2 retornam `migrationRequired:true`. `writeBfnPayload` produz um frame compatível com o formato binário de transporte, mas gerar um CBOR de exemplo NÃO torna o arquivo abrível no jogo Rust (faltam campos do `World`). Não apresentar o `m26_sample_data_only.bfn` como save jogável.

## 2. Adaptadores dos exemplos Rust

| Fonte Rust | Funções M26 | Responsabilidade | Limite explícito |
|---|---|---|---|
| `simulation/examples/compare_ratings.rs` | `comparePlayerRatings` | compara a última nota por índice e ID, até 30 desvios | usa DTO independente, não duas instâncias `World` Rust |
| `simulation/examples/days_to_season_end.rs` | `countDaysToDemoSeasonEnd` | avança cópia da carreira até fim, respeitando limite | conta rodadas demo, não dias do fixture `.s22` |
| `simulation/examples/inspect_competitions.rs` | `inspectDemoCompetition` | inspeção do torneio, fase, líderes e vagas | a carreira demo tem apenas liga de 10 times |
| `systems/examples/day_matches.rs` | `inspectDemoRound` | relatório de jogos, placar e pendências | não tem eventos e jogadores do `World` Rust |
| `systems/examples/compare_season.rs` | `compareDemoCareers` | detecta primeira diferença por seção | recebe dois saves demo já desserializados |
| `systems/examples/new_game_smoke.rs` | `runDemoCareerSmoke` | cria carreira com semente fixa e avança rodadas | sandbox demo, sem `NewGame` Rust |
| `persistence/examples/comp_ids.rs` | `inspectBfnCompetitionIds` | IDs das competições presentes no CBOR | não resolve referências de arena ainda |
| `persistence/examples/save_features.rs` | `inspectBfnFeatures` | lista flags, ano, dia, clubes, atletas e tipos de copa | resumo a partir de campos presentes; campos ausentes permanecem `undefined` |
| `persistence/examples/game_data.rs` | `summarizeTeamTemplates` | agrupa clubes por país e contabiliza configs | não decodifica os `.ban` JavaSer diretamente |
| `persistence/examples/open_bfn.rs` | `inspectBfnBytes` | abre envelope real e mostra metadata/competição | fonte já era parcialmente mapeada no M24; M26 aprofunda (não é nova correspondência) |

## 3. CLI read-only

```bash
npm run build
npm run m26:inspect -- bfn tests/fixtures/m26_sample_data_only.bfn
npm run m26:inspect -- demo caminho/carreira-fmu-demo-v1.json
npm run m26:inspect -- demo-smoke 36 2026
npm run m26:tests
npm test
python3 tools/m26_audit.py --check
```

O CLI não escreve/carrega saves de usuários. A ferramenta aceita `.bfn` autêntico para **inspeção genérica**, e JSON `fmu-demo-v1` para estado jogável no sandbox. `.s22` permanece sem importador completo.

## 4. Conexões e manutenção

```text
Rust native.rs (skippable BF NX + Zstd CBOR)
    │
    ├── M22 decodeBfnHeader ──> M26 readBfnPayload ──> inspectBfnFeatures
    │                                   │                    └── inspectBfnCompetitionIds
    └── M26 writeBfnPayload ──> tests/fixtures/m26_sample_data_only.bfn

M24 DemoCareer ───> M26 inspectDemoCompetition + compareDemoCareers
             └───> M26 runDemoCareerSmoke / daysToDemoSeasonEnd
```

Ao alterar o codec, retestar todas as rotas M22/M24/M25 de persistência e M26 CBOR/CLI. Ao alterar diagnósticos, retestar as duas temporadas demo e `validateDemoCareer`. Para importar `.bfn` num `World` jogável serão necessários: migração de versão, recriação dos IDs/arenas, decoder tipado, auditoria relacional e testes diferenciais com saves gerados e abertos no Rust original.

## 5. Percentuais

M25 **196/231 = 84,85%**. M26 **205/231 = 88,74%**, avanço de **9 novas fontes com diagnóstico adaptado**, e **2 fontes previamente mapeadas aprofundadas** (`native.rs`, `open_bfn.rs`). **+3,90 pontos percentuais nominais; 26 não mapeadas.** Não há percentual válido de paridade integral. A contagem de correspondências de exemplos não substitui ports de funcionalidades de produção.
