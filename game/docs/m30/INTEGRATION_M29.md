# Como integrar o suplemento M30 no M29 original

**Estado:** contrato de integração planejado a partir do guia M29 presente na Biblioteca; **não compilado com o projeto M29** porque seus bytes brutos não estavam acessíveis neste ambiente.

## Ordem segura

1. Extraia o `FMU_Next_M29_Transactional_World_Advance.zip` original e rode `npm test` (esperado conforme QA M29 histórico: 612/612; reexecutar para confirmar nesta máquina).
2. Copie os quatro arquivos `src/*.ts` do M30 para `src/m30/` no M29. Ajuste importações internas para os caminhos locais. NÃO substitua módulos M29 existentes antes de validar seus tipos.
3. Integre `DeterministicRandomSource` com os hooks reais `WorldAdvanceHooks.draw100`, que hoje dependem do runtime externo. Os hooks de sorteio devem receber `ctx.rng` em vez de usar o RNG global.
4. Substitua a persistência de batch por `commitPrepared` APENAS depois de garantir que `SaveCodec.encode` chame `encodeWorldDocument` do M29, `SaveCodec.decode` chame `loadBfnWorld` e `SaveCodec.validate` rejeite qualquer `WorldDocument` sem referência válida.
5. Encaminhe mensagens, alterações de banco e efeitos de rede para `ctx.queueEffect` com chaves de idempotência estáveis. **Não** execute esses efeitos nos callbacks de avanço.
6. No startup do FMU, antes de abrir um save para escrita, execute a inspeção read-only do `.m30.txn.json`; se houver journal, recupere com um handler de mensagens que deduplique chaves. Se `.m30.lock` permanecer de processo morto, investigue e execute `clearStaleLock` explicitamente.
7. Armazene o `.m30.rng.json` junto com `.bfn`: ele é necessário para reproduzir os sorteios do suplemento. Quem usar outro processo deve respeitar `.m30.lock`.
8. Execute todas as regressões do M29 e M30; compare states via `verifyDifferential` com `.bfn` real e fixture Rust executado (SHA de entrada, SHA do binário e commit originais). Sem golden real o resultado deve ser `UNVERIFIED`.

## Como validar a integração

```bash
npm test              # regressão integral do FMU (M29 + M30) — ainda NÃO executada aqui
node --test dist/tests/*.test.js
```

Não assuma `612 + 46` como total exato: testes podem se sobrepor ou ser renomeados após a integração. A métrica deve ser lida da execução real após aplicar o patch.

## Testes de aceite obrigatórios no FMU

| Caso | Condição de aprovação |
|---|---|
| Falha da engine na segunda rodada | `.bfn` original permanece íntegro; RNG e efeitos externos não avançam; replay determinístico da primeira tentativa |
| Pausa de escalação humana | Nenhum sorteio ou evento do dia pausado é confirmado |
| SIGKILL entre gravação e sidecar RNG | `recoverCommit` reconcilia digest do save, restaura RNG, reenvia eventos deduplicados |
| Efeito enviado antes de ACK | Reenvio é aceito pelo receptor por chave sem duplicar saldo/transferência |
| `.bfn` alterado por outro writer | conflito SHA, nenhum overwrite |
| Rodadas sucessivas | Estado de RNG, referências, caixa e transferências preservados em reload |
| Save v1/v2 | Migrações originais + verificação estrutural e semântica; round-trip em v3 |
| Duas temporadas oficiais | Todos os fluxos reais sem `unported!`; comparação contra Rust golden aprovada |

## Bloqueios conhecidos

O Rust original ainda possui 48 chamadas ativas a `unported!`, e o inventário M29 aponta 20 fontes ainda sem port integral. Essas lacunas não são resolvidas pela camada de integridade. O suplemento tampouco altera a UI, o editor de campeonatos, a API Web ou as tabelas do jogo.
