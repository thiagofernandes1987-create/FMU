# Rastreabilidade M21

| req | comp | contrato | teste | regressão | artefato |
|---|---|---|---|---|---|
| Migrar funções `model` | src/ported/model | C21-MODEL-01..04 | m21_model / m21_cross | M20 120 testes | 13 módulos TS |
| Migrar transações `simulation` | src/ported/simulation | C21-SIM-01 | m21_domain / m21_cross | M20 120 | 5 módulos TS |
| Migrar sistemas e decisões `systems` | src/ported/systems | C21-SYS-01/02 | m21_domain / m21_cross | M20 120 | 3 módulos TS |
| Migrar `engine` e preços | src/ported/engine | C21-ENGINE-01 | m21_cross | M20 engine | 2 módulos TS |
| Migrar pacote e identificadores | src/ported/datapack | C21-DATA-01/02 | m21_domain / verify_m21_sources | M20 sources | 5 módulos TS |
| Medir cobertura sem sobreposição | docs/M21_PORTING_MATRIX.csv | 231 SHA-256 e estados | verify_m21_sources.py | M20 inventory | docs/M21_PROGRESS.json |
