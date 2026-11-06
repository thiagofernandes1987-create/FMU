# DEPENDENCY_MATRIX M26

| comp | depends_on | used_by | contrato | impacto | regressões |
|---|---|---|---|---|---|
| cbor | TextEncoder/TextDecoder, DataView | bfn_codec | CT-M26-01 | integridade, inteiros, formatos CBOR | m26 codec |
| bfn_codec | m22 native, node:zlib zstd, cbor | persistence_examples, CLI | CT-M26-02 | save binário, segurança de arquivo | M22/M24/M25 persistence + M26 |
| simulation_examples | m24 DemoCareer | CLI demo | CT-M26-03 | contagem temporada e comparação de notas | m24 career + m26 diagnostics |
| systems_examples | m24 DemoCareer | CLI smoke | CT-M26-04 | partidas por rodada, comparação estados | m25 replay + m26 diagnostics |
| persistence_examples | bfn_codec, DTO | CLI bfn | CT-M26-05 | save insights e IDs | m26 BFN+fixture |
| diagnostics/cli | fs, DemoCareer, bfn_codec | usuário local | CT-M26-06 | inspeção read-only | m26 CLI |
| M26_PORTING_MATRIX | fontes Rust SHA, M25 matriz | status e releases | CT-M26-07 | indicador acumulado | m26 audit |
