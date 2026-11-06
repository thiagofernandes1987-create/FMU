# FMU M22 — conversão agressiva multiarquivo, sob protocolo completo

## Meta e escopo
- Base: Git bundle M21 commit `8e5cfbd`, 55/231 fontes com correspondência e 163/163 testes.
- Meta de planejamento: +70 fontes Rust com implementação testada (+30,30 pontos percentuais de cobertura *nominal*), distribuídas entre pelo menos dois crates; não adicionar placeholders apenas para cumprir a meta.
- Entrega: arquivos TypeScript comentados por fonte, testes por família, matrizes e inventário com SHA256, ZIP, patch M21→M22 e Git bundle com histórico reproduzível.
- Não incluiu dados privados, não declara equivalência funcional integral, UI web sem alterações.

## Contratos e aceite
- [ ] A0: restaurar M21, executar 163 testes, validar 231 hashes Rust.
- [ ] A1: portar comportamento concreto de `datapack`, `model`, `i18n` e `persistence` com testes.
- [ ] A2: portar comportamento concreto de `simulation` e `systems` com testes.
- [ ] A3: portar comportamento concreto de `engine`, `simulation` e integração de consumidores.
- [ ] A4: compilar TypeScript; executar testes novos + 163 regressões anteriores e determinismo, falhas, overflow conforme aplicável.
- [ ] A5: inventário de fontes e taxa nominal, QA, contratos, dependências e matriz de rastreabilidade.
- [ ] A6: bundle+patch reprodutíveis, clone independente, ZIP final extraído e testado, sem arquivos privados.

## Progresso
- Início: 55/231 = 23,81% na árvore independente M21; 176/231 `UNPORTED`.
- Base M18 histórica: 74/231, não consolidada; não somar sem prova de sobreposição.
- A cada fonte nova, STATUS=PARTIAL_M22_TESTED apenas se funções reais e testes executados; `STATIC_DATA_TESTED` apenas quando dados realmente extraídos e comprovados.
- Bloqueios históricos: Rust/Cargo diferencial ausente, `World` autoritativo não integrado, muitas rotas incompletas, interface visual não migrada.
