# Contratos M29R

| ID | Componente | I/O | Invariantes | Comportamento não suportado |
|---|---|---|---|---|
| TX-01 | `JavaRandom` | semente i64 → draw + snapshot | 48-bit LCG, bounds com overflow i32 exato; 5124 comparações Java aprovadas | seed OS e Gaussian StrictMath não portados |
| TX-02 | `RandomSource` | seed → RNG clonável | `freshInt` consome o contador de seeds; Math.random e shuffle clonados | RNG utilizado fora da transação não pode ser revertido |
| TX-03 | `World` | arenas/index IDs → validação | references em bounds e propriedade clube/jogador; financeiro com bigint | muitas regras de competição Rust não têm validação |
| TX-04 | `advanceWorld` | World + RNG + hooks → novo World/RNG | copia entrada, callbacks obrigatórios, rollback em erro; no double-play | sem callback de engine/stage/fim temporada: erro, não fallback |
| TX-05 | `recordHeadToHead` | World + MatchId → HeadToHead | last matching entry; campos da fonte Rust, diferença de mando e bug conservado | não inclui record de treinador ou goleador |
| TX-06 | `writeCheckpointAtomic` | estado + caminho `.fmu-day` → arquivo | SHA256, backup bak1..3, rename fsync, recusa estado inválido | não é formato oficial `.bfn` |
| TX-07 | `normalizeImportedWorld` | M28 `WorldDocument` → World clone | bigint de dinheiro sem perda, campos desconhecidos preservados | não decodifica ZIP M28 nem valida integralmente `World` Rust |
