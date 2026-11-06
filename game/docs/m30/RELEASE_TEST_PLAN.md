# Plano de homologação completa FMU (pendências reais)

O objetivo do projeto é que a carreira seja executada com dados de jogo e comportamento original verificável. Testes de algoritmo isolado não substituem testes do sistema inteiro.

## Golden Rust / TypeScript

- Entrada: save original `.bfn` ou `.s22` gerado pelo executável Rust/Java; SHA-256 capturado antes de modificar.
- Referência: commit Rust, hash do binário, sementes Java e estado de todos os streams, eventos e world antes/depois de cada rodada.
- Saída TS: executar a MESMA entrada no M29+M30 com o mesmo consumo de sorteios e os mesmos hooks, sem mocks de resultados.
- Aprovar somente se `verifyDifferential` retornar PASS no `World`, RNG e lista de eventos; não usar fixture sintética com `kind:'rust-executed'` para homologação.

## Cobertura de tarefas

- Roteiro de 2 temporadas: clubes humanos/IA, mercado, dívidas/salários, lesões, cartões, competições nacionais/continentais, promoção, calendário e pós-temporada.
- Executar os 48 pontos `unported!` relevantes e implementar comportamentos ainda ausentes; testar também os 20 arquivos de testes/exemplos do inventário M29 que permanecem UNPORTED.
- Confirmar save/reload de v1/v2/v3 com `World` real e idempotência de histórico de transferências.
- QA visual no frontend somente quando telas, navegação ou estados forem alterados; nesta entrega não houve alteração visual.

## Restrições demonstradas

- ZIP bruto do M29 indisponível nesta sessão: a integração sobre seu código está UNVERIFIED.
- Toolchain Cargo não encontrada: execução de testes originais Rust impossível neste container.
- A biblioteca de macros `unported!` do upstream corresponde a 48 pontos explícitos que podem panicar no binário original.
