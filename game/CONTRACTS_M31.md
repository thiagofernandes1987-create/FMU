# Contratos FMU M31

| ID | Componente | I/O e tipos | Invariantes | Compatibilidade / testes |
|---|---|---|---|---|
| CT31-01 | `KryoGraph` | classes/strings/nodes/roots tipados | IDs não renumerados, `long` bigint, f32/f64 raw bits, refs cíclicas válidas | `m31_kryo_reader` |
| CT31-02 | `readKryoGraph` | bytes + schema explícito + limites → graph | autoReset nomes e referências por raiz; nenhum serializer desconhecido ignorado | Rust `reader.rs`; sem esquema original, real .s22 UNVERIFIED |
| CT31-03 | `canonicalKryoGraph` | graph → canonical text | sequência/escapes/float bits iguais ao formato Rust, não ao JSON | M31 golden sintético |
| CT31-04 | `preflightS22Bytes` | bytes+schema → plano tipado | 2 raízes estritas best.f e best.ay, nove arenas, worldLoaded=false | M31 6 testes |
| CT31-05 | `firstCanonicalDifference` | actual, expected → first diff | sem falsa igualdade quando linha final não tem `\n`; campo/linha/contexto | M31 diff tests |
| CT31-06 | `checkCanonicalAgainstGolden` | actual, expected, input, source SHA → PASS/FAIL/UNVERIFIED | compara SHA real do input e exige proveniência; ausência => UNVERIFIED | M31 provenance regression |
| CT31-07 | CLI | input.s22, schema.json, golden → report/UTF8 | somente leitura salvo `canonical output` explícito; frame 64 MiB | M31 CLI tests |
