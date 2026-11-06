# Findings M20 e critérios para reabrir

- F20-01 **BLOCKER — progresso cumulativo:** M18 tem 74/231 reportados mas a árvore/matriz exata não está disponível nesta sessão. A união deduplicada M18/M19/M20 não é verificável. Retomar com o ZIP/bundle M18 real.
- F20-02 **BLOCKER — port completo:** 204 fontes Rust continuam sem correspondência no pacote autônomo M20; outras 27 são estáticas, parciais ou adaptadas. Meta +25pp cumulativos não alcançada.
- F20-03 **BLOCKER — prova diferencial:** `rustc`/`cargo` não instalados; testes funcionais somente TS contra especificação da fonte Rust. Reexecutar diferencial com binário Rust e save `.bfn` ao disponibilizar o runner.
- F20-04 **MAJOR não aceito — conector World:** serviços recebem DTOs e callbacks; a carreira TS completa não é automaticamente migrada pelo M20.
- F20-05 **MAJOR não aceito — fidelidade de fuso/RNG:** `investor.ts` usa UTC para o cálculo de ofertas e `fixtures.ts` usa RNG injetado. O Rust mantém Clock com transições de horário e gerador separado para certos sorteios. Exigir fixture de comparação antes de proclamar paridade.
- F20-06 **MAJOR não aceito — transações:** investidores, olheiros e mensalidades chamam callbacks externos. A aplicação deve garantir transação atômica para saldo+estado persistente.
- F20-07 **MINOR:** `EnginePercent` recusa divisão por zero; o Rust JavaRound pode saturar. Fora de domínio normal de resultados, registrar divergência.

Não substituir estes achados por garantia de finalização. O código derivado continua sujeito a GPL-3.0-only.
