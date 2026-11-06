# KNOWN_ISSUES M29

- **BLOCKER — full parity:** a função Rust `Sim::advance` inclui a engine real, pós-jogo, liga/copa, empréstimos, mercado, seleção de rodada, sorteios e `new_season`. M29 fornece transações e exige callbacks para partes não implementadas. Sem callbacks completos, partidas não disputadas e temporadas novas não podem avançar.
- **BLOCKER — original fixtures:** a árvore original e o ZIP executável não incluem save `.bfn` real jogável nem golden fixtures `.s22`; um `World` de testes é sintético. Não há evidência de duas temporadas reais.
- **BLOCKER — Rust differential:** Cargo/Rustc não estão disponíveis; o snapshot Rust de origem também contém ramos `unported!`. Não há paridade binária/funcional comprovada com engine original.
- **MAJOR sem aceite — callback semantics:** o contrato exige hooks externos para processamento completo; testes usam hooks de teste e não comparam alterações em estatísticas/torneios com o Rust original.
- **MAJOR sem aceite — estado externo:** `worldTransaction` reverte o `World` em memória, mas não restaura estado de RNG externo, arquivos gravados dentro de hooks ou sistemas remotos; hooks devem restringir efeitos a `World`.
- **MAJOR sem aceite — saves reais:** o loader valida esquema e referências, mas não equivale a prova de carregamento e execução de carreira longa.
- **PENDENTE — 20 arquivos Rust originais:** exemplos/testes diferenciais ainda não convertidos integralmente; 211/231 é mapeamento nominal, não percentual de funções completas.

**Não liberar o FMU completo:** `RELEASE_BLOCKED`. Nenhum dos problemas MAJOR foi autoaceito para a release integral.
