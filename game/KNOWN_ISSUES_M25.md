# M25 — Pendências e limitações abertas

| ID | severidade | estado | impacto / desbloqueio |
|---|---|---|---|
| F25-01 | BLOCKER (conversão integral) | OPEN | 35 arquivos Rust ainda UNPORTED; grande parte dos 196 restantes só parcialmente mapeada. Converter e testar funcionalidades, não apenas mapear nomes. |
| F25-02 | BLOCKER (paridade Rust) | OPEN | Não há testes diferenciais de `MatchEngine` Rust versus TS no mesmo save. Conectar World/engine e comparar fixtures. |
| F25-03 | MAJOR (persistência nativa) | OPEN, não aceito | Pré-importação `.s22` opera somente sobre `KryoGraph22` já decodificado; conversores completos e `.bfn` ainda ausentes. |
| F25-04 | MAJOR (replay oficial) | OPEN, não aceito | Eventos de replay web são ilustrativos, não minuto real de partidas. UI informa explicitamente; requer persistir eventos do motor real. |
| F25-05 | MINOR (QA visual) | OPEN | Só viewports de 1440/768/390 testadas com controles de replay, não todos os estados interativos do produto. |
| F25-06 | MINOR (parser) | OPEN | `validateS22NodeReferences` não faz validação semântica completa de todos os campos ou conversões de classe. |

**Aceite restrito:** M25 é incremento web/TS experimental; não está homologado como port completo do Brasfoot Next. Nenhum MAJOR acima foi aceito pelo usuário.
