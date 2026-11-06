# FMU M29R — Relatório de QA técnico

**Resultado de incremento isolado:** testado. **Resultado de integração completa M28/M29:** `RELEASE_BLOCKED`.

| Controle | Resultado | Evidência |
|---|---|---|
| TypeScript strict compiler (`tsc`) | PASS | `npm test` |
| Testes de regressão locais | **41/41 PASS** | `evidence/npm_test_41.log` |
| JDK `java.util.Random` vs TS `JavaRandom` | **5.124/5.124 comparações PASS** | `evidence/jdk_parity_5124.log`, quatro sementes |
| 2 temporadas demonstrativas | **90 jogos por temporada**, 18 rodadas | `evidence/demo_two_seasons.log` |
| Replay determinístico e snapshot | PASS, continuidade byte-equivalente após checkpoint | `tests/persistence.test.ts` |
| Rollback em erro na segunda partida | PASS, World e RNG intactos | `tests/advance.test.ts` |
| Rollback em falha de `afterStage`, `endSeason` e task | PASS | `tests/advance.test.ts` |
| Pagamentos (`ds` e `dJ`) | PASS, salários em bigint e juros i32 | `tests/advance.test.ts` |
| `HeadToHead` com mando invertido | PASS, regra Rust inclusive comparador peculiar | `tests/records.test.ts` |
| Fonte Rust original | **231/231 arquivos com SHA-256 registrado** | `docs/RUST_SOURCE_AUDIT.json` |
| Dados HTML/UI | Não modificados, QA visual N/A | Este kit não contém interface |
| M28/M29 histórico compilado | **UNVERIFIED** | Zip original indisponível como backing file nesta sessão |
| Rust `Sim::advance` integral | **UNVERIFIED / NOT PORTED** | Engine e fixtures reais ausentes |
| `.bfn` de carreira jogável | **NOT IMPLEMENTED neste kit** | Não confundir com `.fmu-day` |

## Ciclos de correção

1. Corrigido `Math.round` para `Math.floor` e comparação de fração, evitando erro de 0,49999999999999994 arredondado para 1 por `x+0.5` no JavaScript.
2. Corrigido teste contábil que exigia lançamento humano em um clube inicialmente não humano; a regra Rust depende de `human=true`.
3. Corrigida leitura de backups `.fmu-day.bak1..3`, preservando validação de extensão e do checksum.
4. Corrigido controle de fluxo do dia para exigir **hooks específicos** em empréstimos, obras, treinador e seleções nacionais; antes, um callback genérico poderia fazer o motor ignorar silenciosamente essas regras.
5. Portados registros de confronto direto com comparação histórica de margem, bilheteria e regras de classificação parcial; adicionados seis testes específicos.
6. Excluídos os arquivos de fontes tipográficas presentes no snapshot Rust original do pacote de entrega.

## Gates e limitações

Os 41 testes pertencem ao **novo kit isolado**, não são a suite histórica de 569/612 testes do M28/M29. O teste de duas temporadas emprega motor fictício explicitamente injetado; não demonstra equivalência de pontuações, calendário, torneios e transferências do código Rust original. O gerador RNG é fiel aos métodos verificados (exceto Gaussian StrictMath e relógio), mas toda a simulação depende de dezenas de sistemas Rust ainda não ligados.

O pacote só pode ser homologado como **biblioteca de integração parcial**. A liberação integral do jogo permanece bloqueada. O release depende de um ZIP M28/M29 materializado ou repositório Git acessível para aplicar e repetir a regressão na base real.

## Proveniência adicional

As **231 fontes Rust** do pacote foram comparadas independentemente, arquivo por arquivo, ao `brasfoot-next-main.zip` originalmente fornecido. **231/231 hashes iguais.** SHA256 do arquivo original: `7f1dede25262336461b24f917668b94d0cba63e67f28fa5a9ca0d6f2ead1b983`.

O clone isolado do Git bundle foi compilado e passou nos 41 testes e nas 5.124 comparações JDK. Os arquivos de fontes tipográficas foram excluídos do pacote; nenhum banco privado foi integrado.