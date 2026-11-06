# FMU M20 — Aceleração real da migração Rust → TypeScript

**Entradas:** Brasfoot Next Rust `bd2ccbdd5f1aaacb6437b58b198d7963c61b3780` e pacote independente M19. **Licença:** GPL-3.0-only.

Esta entrega **não promete conversão integral**; introduz 16 novas fontes Rust trabalhadas, somadas às 11 fontes do M19. O WebAssembly distribuído é o binário original e **não é contado como TypeScript convertido**.

## Executar e validar

```bash
node --version                 # validado em Node 22.x
npm run build
npm test                       # 120/120
python3 tools/port_static_tables.py --check
python3 tools/verify_m20.py   # matrizes SHA256 de 231 fontes
```

### Matriz do incremento

| Origem Rust | TypeScript | Responsabilidade | Classe de cobertura |
|---|---|---|---|
| simulation/src/tables.rs | simulation/generated/tables.ts | 13 tabelas de calendário, finanças e prêmios | todos os 13 literais |
| simulation/src/fixture_tables.rs | simulation/generated/fixture_tables.ts + fixture_schedule.ts | 8 tabelas de jogos, sorteios por número de clubes | todos os 8 literais |
| simulation/src/fixtures.rs | simulation/fixtures.ts | dias livres, horários de trocas, estádio, final neutra, criação de partida | adaptação parcial testada |
| systems/src/config.rs | systems/config.ts | 19 chaves, parsing e intensidade de mercado | funções testadas |
| systems/src/cash.rs | systems/cash.ts | 11 rubricas, saldos BigInt, fluxo e 400 dias | funções testadas |
| systems/src/staff.rs | systems/staff.ts | candidatos, contratação, demissão, salários | funções testadas |
| systems/src/scouts.rs | systems/scouts.ts | margem de erro Java, scout, busca, relatórios em 14 dias | funções testadas |
| systems/src/fans.rs | systems/fans.ts | eventos, venda de ídolos, sócio-torcedor e apoio | funções testadas |
| systems/src/investor.rs | systems/investor.ts | proposta de investidor, aportes, avaliação, desistência | funções testadas |
| engine/src/tables.rs | engine/generated/tables.ts + percent.ts | 6 tabelas táticas e porcentagem f32 | tabelas e função testadas |
| engine/src/clubs.rs | engine/clubs.ts | designação de capitão/cobradores | funções testadas |
| engine/src/events.rs | engine/events.ts | gols, cartões, assistências, ratings, lesões | funções testadas |
| engine/src/injury.rs | engine/injury.ts | períodos de lesão, RNG, redução de força e mensagens | função testada |
| engine/src/messages.rs | engine/messages.ts | notificações, sanções, títulos, datas | funções testadas |
| model/src/names.rs | model/names.ts | cache por país, leitura UTF-8 e filtro de nomes | funções testadas |
| model/src/host_cities.rs | model/generated/host_cities.ts | 6 constantes de cidades da Finalíssima/Super Mundial | todos os literais |

## Regras para manutenção

- Todo novo `.ts` contém cabeçalho de origem Rust, responsabilidades, entradas e dependências. Para alterações, ver `CONTRACTS_M20.md` e `DEPENDENCY_MATRIX_M20.md`.
- `tools/port_static_tables.py` regenera **as 33 constantes** (`13+8+6+6`) a partir de arquivos Rust verificáveis. Não editar os gerados manualmente.
- `systems/cash.ts` preserva saldos `i64` com `bigint`: **não converter diretamente para JSON** sem codificação explícita.
- Todos os contratos que exigem World, dados de mercado, identidade de arena ou RNG original recebem adaptadores explícitos. Não mascarar falta de dados com números sintéticos.
- Após alterar fixtures, execute `npm test` e compare o inventário SHA256. A UI WASM original não foi editada e permanece sem novo QA visual nesta entrega.

## Percentuais sem dupla contagem

- **M18 — última cobertura cumulativa declarada:** 74/231 = 32,03% de fontes mapeadas, com implementações parciais.
- **M20 — pacote autônomo:** 27/231 = 11,69% de fontes trabalhadas (11 do M19 + 16 novas), sem atestar equivalência integral.
- **União M18 + M19 + M20:** **NÃO VERIFICADA**; a matriz/binário M18 não está disponível no ambiente. Não some 74+27, pois parte das fontes pode se sobrepor.
- **Meta anterior de +25 pontos percentuais:** **NÃO ATINGIDA NEM REIVINDICADA**.

A base WASM permanece disponível para executar o jogo original enquanto a migração avança. Esse recurso não substitui equivalência Rust↔TS nem fornece automaticamente APIs internas das crates.
