# Known issues / release gates M28

| ID | Severidade | Estado | Causa e condição de liberação |
|---|---|---|---|
| F28-01 | BLOCKER | OPEN | Não existe fixture oficial real `.s22`/`.bfn` nesta base de testes; paridade Rust↔TS do World e motor não pode ser provada. |
| F28-02 | BLOCKER | OPEN | 20 testes/exemplos Rust permanecem `UNPORTED`; vários requerem importador Kryo e simulação original completa. |
| F28-03 | CRITICAL (release integral) | OPEN | Partidas do `World` Rust não executam pela engine original no TS; `inspectWorldDay` é propositalmente read-only. |
| F28-04 | MAJOR | OPEN | Transferência `move_player` é subconjunto: não há negociação do passe, taxa do Tesouro FMU, mercado completo ou reposição do elenco da IA. Não aprovada para produção. |
| F28-05 | MAJOR | OPEN | Auditoria semântica M28 é conservadora, não cobre todas as regras de empréstimos, seleção, final de temporada e ligas. Não aprovada para produção. |
| F28-06 | MINOR | ACCEPTED_DEVIATION | Port de compra adiciona testes de saldo, seleção nacional, juventude e capacidade não verificados no método baixo nível Rust; prevenção intencional de transação insegura. |

M28 é um incremento técnico validado; **conversão integral do FMU permanece `RELEASE_BLOCKED`**. Nenhum teste de renderização requerido: nenhum HTML/CSS/UI novo ou alterado.
