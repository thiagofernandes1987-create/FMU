# FMU M29 — avanços do `World` e integração de rodada (incremento, não release integral)

Este lote **não finge ter completado o motor Rust**. Acrescenta uma máquina de estados de um dia, transacional em CBOR, e uma API para avançar múltiplos dias com **callbacks obrigatórios para tudo o que ainda depende da simulação Rust**. A entrada é o `WorldDocument` validado pela implementação M27/M28. A saída é um novo documento de `World` que pode ser gravado em `.bfn` com as migrações, referências e backups anteriores.

## Executar

```bash
npm run build
npm run m29:tests
npm test
npm run m27:audit
node dist/src/m29_world_cli.js inspect /CAMINHO/CARREIRA.bfn
```

Para executar um avanço sobre um `.bfn` real, um integrador precisa fornecer um `WorldAdvanceHooks` com uma implementação correta de `playMatch`, `afterMatch`, classificação, seleção da rodada, mercado, empréstimos e temporada, quando aplicáveis. Um resultado de partida **não é inventado** e a API bloqueia a transação se faltar uma rotina obrigatória. Consulte [o guia das funções](docs/M29_MODULE_GUIDE.md).

## O que realmente foi testado

- `advanceWorldOneDay` e `advanceWorldDays` com fixtures completas e tipadas de `World` **sintéticos**, usando hooks de motor explicitamente injetados.
- `World` original preservado quando falham rodada 2, evento, referência, orçamento i64, time sem escalação ou placar.
- Recuperação física por idade de acordo com `model/player.rs`, recebimento de salário (wages) e juros bancários de acordo com `simulation/game.rs`.
- `World` → `.bfn` (Zstandard + CBOR) → backup/gravação atômica → `World` reaberto com IDs, scores, BigInt, bytes e campos desconhecidos preservados.
- `runM29WorldCli`: inspeção **somente leitura**, aponta dependências; nunca simula nem regrava automaticamente.

## O que ainda NÃO é verdadeiro

- **`Sim::advance` 1:1 Rust: não implementado por completo.** O projeto Rust-fonte já contém `unported!` em ramos críticos e nossos hooks para partida, pós-jogo, ligas e troca de temporada continuam dependências externas.
- **Save real e paridade diferencial: indisponíveis.** Os únicos `.bfn` incluídos são fixtures sintéticos ou de dados; o `RustWorld` carregado não foi demonstrado jogável em duas temporadas pelo executável original.
- **Arquivos Rust:** 211/231 com algum mapeamento nominal (91,34%); 20 testes/exemplos da fonte ainda sem conversão. Não há alteração de percentual nesta etapa.
- **UI:** não houve mudança visual M29, QA visual N/A.

### Preservação do histórico

O ZIP completo inclui a árvore M28, o código e teste M29, matriz de 231 fontes, Git bundle e patch M28→M29 para evitar perda de continuidade. Licença GPL-3.0-only. Nenhum banco privado foi empacotado.
