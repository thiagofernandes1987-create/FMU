# CONTRACTS M26

| ID | Componente | I/O | Invariantes / efeitos | Regs / Compatibilidade |
|---|---|---|---|---|
| CT-M26-01 | `m26/persistence/cbor.ts` | Uint8Array ⇔ CborValue | Limitador de profundidade/itens; BigInt exato; nenhuma execução de código; map sem prototype | `m26_bfn_codec.test.ts`; não é ciborium inteiro |
| CT-M26-02 | `m26/persistence/bfn_codec.ts` | Bytes `.bfn` ⇔ Meta+CBOR | skippable magic, `BFNX`, Zstd checksum, 64 MiB; `worldLoaded=false`; `migrationRequired` v1/2 | M22/M24/M25 persistence; `m26_fixture` |
| CT-M26-03 | `simulation_examples.ts` | DemoCareer + ratings → diagnósticos | Comparação por ID e sem mutação; limita ticks e tamanho do output | `m26_diagnostics`; adaptador de exemplos, NÃO Rust World |
| CT-M26-04 | `systems_examples.ts` | DemoCareer → relatório/smoke | Semente fixa, contagem por rodada, compara estado sem mutação | `m26_diagnostics`; sandbox demo |
| CT-M26-05 | `persistence_examples.ts` | BfnDecoded/DTOS → features+IDs+equipes | Campo ausente não inventado, saída read-only, `worldLoaded:false` | `m26_diagnostics`, `m26_fixture` |
| CT-M26-06 | `diagnostics/cli.ts` | bfn/json + argumentos → JSON resumo | Read-only, entradas validadas, exceções encerram CLI com exit=1 | `m26_cli`; sem upload de dados privados |
| CT-M26-07 | matriz Rust | 231 SHA + statuses → progresso | Nova correspondência só com arquivo TS e teste; não confundir adaptação com paridade | `tools/m26_audit.py --check` |
