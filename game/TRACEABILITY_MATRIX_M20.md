# Rastreabilidade M20

| Requisito | Crates / fonte Rust | Artefato TS | Contrato | Evidência |
|---|---|---|---|---|
| R20-01 dados originais imutáveis | simulation/tables, simulation/fixture_tables, engine/tables, model/host_cities | `src/*/generated/*.ts` | matrizes de dados exatos | `port_static_tables.py --check` + tests |
| R20-02 configurações e pagamentos | systems/config,cash,staff | `src/systems/{config,cash,staff}.ts` | 11 contas, 3 cargos, 19 chaves | `m20_systems.test.ts` |
| R20-03 desenvolvimento de receitas e scouts | systems/scouts,fans,investor | `src/systems/*.ts` | limites, RNG, callback | `m20_systems.test.ts` |
| R20-04 regras de partidas | engine/clubs,events,injury,messages | `src/engine/*.ts` | mensagem e estatística no mesmo estado | `m20_engine.test.ts` |
| R20-05 calendário | simulation/fixtures,fixture_tables | `src/simulation/*.ts` | table e plan minuto | `m20_simulation.test.ts` + engine/fixtures |
| R20-06 fontes rastreáveis | 231 fontes | `docs/M20_PORTING_MATRIX.csv` | hash+status por arquivo | `verify_m20.py` |
| R20-07 reporte honesto | M18 74 e M20 autônomo 27 | `docs/M20_PROGRESS.json` | sem união sem matriz M18 | QA final |
| R20-08 pacote e regressões | código+testes+docs+bundle | ZIP | 120/120 + checks internos | QA final |
