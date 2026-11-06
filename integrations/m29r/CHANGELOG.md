# Alterações — FMU M29R

- Introduzido controlador de dia com rollback de World e RandomSource, incluindo garantia de não executar sem engine injetada.
- Implementados JavaRandom e RandomSource determinísticos, portados de Rust e contrastados com JDK em 5.124 verificações.
- Adicionadas validações de arena, vínculo de jogador/clube, simulação de calendário de liga e recuperação física.
- Portadas receitas/despesas, salários, juros, confronto direto e funções puras de classificação selecionadas do Rust.
- Checkpoint próprio `.fmu-day` com hash SHA256, backup três gerações, IO atômico e reabertura reproduzível.
- Bridge para `WorldDocument` da base M28/M29, com normalização segura de `bigint` (sem importar `.bfn` por conta própria).
- 41 testes TypeScript; 2 temporadas de 90 jogos fictícios; rigor de `RELEASE_BLOCKED` para engine Rust ainda não portada.
