# M21 — Origem por arquivo e evidência

Fonte Rust: snapshot bd2ccbd; hashes 231/231. Cada arquivo TS inclui responsabilidades, dependências e observações de compatibilidade.

| Origem Rust | Port TypeScript | Estado M21 | Regressão |
|---|---|---|---|
| `crates/datapack/src/codes.rs` | `src/ported/datapack/codes.ts` | STATIC_DATA_TESTED | `m21_domain.test.ts` |
| `crates/datapack/src/format.rs` | `src/ported/datapack/format.ts` | PARTIAL_ADAPTER_TESTED | `m21_domain.test.ts` |
| `crates/datapack/src/issues.rs` | `src/ported/datapack/issues.ts` | BEHAVIOR_TESTED | `m21_domain.test.ts` |
| `crates/datapack/src/tree.rs` | `src/ported/datapack/tree.ts` | PARTIAL_ADAPTER_TESTED | `m21_domain.test.ts` |
| `crates/datapack/src/trophies.rs` | `src/ported/datapack/trophies.ts` | BEHAVIOR_TESTED | `m21_domain.test.ts` |
| `crates/engine/src/hooks.rs` | `src/ported/engine/hooks.ts` | PARTIAL_ADAPTER_TESTED | `m21_cross.test.ts` |
| `crates/engine/src/stadium.rs` | `src/ported/engine/stadium.ts` | BEHAVIOR_TESTED | `m21_cross.test.ts` |
| `crates/model/src/brands.rs` | `src/ported/model/brands.ts` | STATIC_DATA_TESTED | `m21_model.test.ts` |
| `crates/model/src/countries.rs` | `src/ported/model/countries.ts` | STATIC_DATA_TESTED | `m21_cross.test.ts` |
| `crates/model/src/fdlibm.rs` | `src/ported/model/fdlibm.ts` | BEHAVIOR_TESTED | `m21_model.test.ts` |
| `crates/model/src/ids.rs` | `src/ported/model/ids.ts` | PARTIAL_ADAPTER_TESTED | `m21_model.test.ts` |
| `crates/model/src/java_hash.rs` | `src/ported/model/java_hash.ts` | BEHAVIOR_TESTED | `m21_model.test.ts` |
| `crates/model/src/java_sort.rs` | `src/ported/model/java_sort.ts` | BEHAVIOR_TESTED | `m21_model.test.ts` |
| `crates/model/src/labels.rs` | `src/ported/model/labels.ts` | PARTIAL_ADAPTER_TESTED | `m21_cross.test.ts` |
| `crates/model/src/messages.rs` | `src/ported/model/messages.ts` | BEHAVIOR_TESTED | `m21_model.test.ts` |
| `crates/model/src/options.rs` | `src/ported/model/options.ts` | PARTIAL_ADAPTER_TESTED | `m21_model.test.ts` |
| `crates/model/src/runtime.rs` | `src/ported/model/runtime.ts` | PARTIAL_ADAPTER_TESTED | `m21_cross.test.ts` |
| `crates/model/src/stage.rs` | `src/ported/model/stage.ts` | BEHAVIOR_TESTED | `m21_model.test.ts` |
| `crates/model/src/templates.rs` | `src/ported/model/templates.ts` | PARTIAL_ADAPTER_TESTED | `m21_model.test.ts` |
| `crates/model/src/world.rs` | `src/ported/model/world.ts` | PARTIAL_ADAPTER_TESTED | `m21_cross.test.ts` |
| `crates/simulation/src/clubs.rs` | `src/ported/simulation/clubs.ts` | BEHAVIOR_TESTED | `m21_cross.test.ts` |
| `crates/simulation/src/human/contract.rs` | `src/ported/simulation/human_contract.ts` | PARTIAL_ADAPTER_TESTED | `m21_domain.test.ts` |
| `crates/simulation/src/human/finances.rs` | `src/ported/simulation/human_finances.ts` | BEHAVIOR_TESTED | `m21_domain.test.ts` |
| `crates/simulation/src/human/messages.rs` | `src/ported/simulation/human_messages.ts` | BEHAVIOR_TESTED | `m21_domain.test.ts` |
| `crates/simulation/src/human/stadium.rs` | `src/ported/simulation/human_stadium.ts` | PARTIAL_ADAPTER_TESTED | `m21_domain.test.ts` |
| `crates/systems/src/clock.rs` | `src/ported/systems/clock.ts` | BEHAVIOR_TESTED | `m21_domain.test.ts` |
| `crates/systems/src/director.rs` | `src/ported/systems/director.ts` | BEHAVIOR_TESTED | `m21_cross.test.ts` |
| `crates/systems/src/tactics.rs` | `src/ported/systems/tactics.ts` | PARTIAL_ADAPTER_TESTED | `m21_domain.test.ts` |
