# Backlog futuro e critério de avanço rápido

A meta de +25 pontos percentuais em uma entrega depende de cobrir **58 arquivos Rust adicionais genuinamente portados**, após reconciliar o M18. A fila de 88 arquivos de `simulation` e `systems` está em `docs/M19_BATCH88_PLAN.csv`.

1. **Reintegrar o projeto M18 real:** importar ZIP/bundle e `docs/PORTING_MATRIX.csv`, verificar hashes para evitar retrabalho ou contagem duplicada.
2. **Migrar em lotes por dependência:** primeiro fontes pequenas (P1), depois médias (P2) e orquestração/estado (P3/P4). Um arquivo recebe status de cobertura apenas quando ao menos as funcionalidades implementadas têm testes, e `PARTIAL` é registrado explicitamente.
3. **Executar testes diferenciais:** caso contrário, a conversão funcional integral permanece `UNVERIFIED`.
4. **Orquestração e persistência:** unir World, engine, banco e UI sem simular dados faltantes.

**Não executar automaticamente sem o M18:** merge cego com APIs incompatíveis ou sobreposição de arquivos anteriormente portados.
