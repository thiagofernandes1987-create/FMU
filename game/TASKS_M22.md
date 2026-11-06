# FMU M22 — Controle de release e continuidade

## Objetivo/entradas/saídas
- Entrada: M21 Git `8e5cfbd` + snapshot Rust `bd2ccbdd` (231 arquivos).
- Meta: **+30 pontos percentuais** de cobertura NOMINAL por arquivo; implementações reais, comentadas e testadas em pelo menos dois crates.
- Saída: 70 novos ports TS parciais + 1 fonte já mapeada aprofundada; 86 novos testes, documentação, manifestos, bundle, patch e ZIP.
- Escopo congelado: domínios existentes model/datapack/i18n/persistence/simulation/systems/engine; sem nova UI ou dados privados.

## Marcos
- [x] A0 — M21 baseline 163/163, 231 hashes Rust válidos (`evidence/m22/`).
- [x] A1 — fontes datapack/model/i18n/persistence implementadas e testadas; schemas 37/37/35 verificados.
- [x] A2 — simulation + systems implementados e testados em lote.
- [x] A3 — engine e interop simulador implementados com testes de contrato e falhas.
- [x] A4 — TypeScript e 249/249 testes (86 novos) + RNG, save metadata, contratos e bordas.
- [x] A5 — matriz 231 fontes, 70 novas, 125 com alguma correspondência, +30,30pp e restante 106.
- [x] A6 — Git bundle/patch reproduzidos em clones limpos, ZIP candidato extraído e testado, 629 membros SHA256 validados; ZIP definitivo retestado externamente na liberação.

## Bloqueios e decisões
- Release integral = `RELEASE_BLOCKED` (106 UNPORTED, sem Cargo, integrações e `.bfn` incompletas).
- Paridade funcional percentualmente **UNVERIFIED**; 54,11% é cobertura nominal somente.
- QA visual N/A (não houve mudanças de UI).
- Nenhum MAJOR aberto foi considerado aceito para release integral. Detalhes `KNOWN_ISSUES_M22.md`.
