# M20 QA — evidência e cobertura

## Escopo e evolução

- Origem: 231 `.rs` fornecidos no snapshot oficial `bd2ccbdd`.
- Baseline independente M19: 11 fontes revisadas, **57/57** testes TS.
- Port M20: **16 fontes adicionais** (4 de dados, 12 comportamentais/adaptadores).
- Pacote M20 independente: **27/231 (11,69%)** fontes com alguma correspondência. Não é uma medição comparável com os 74/231 do M18; não caracteriza downgrade.
- Última cobertura cumulativa anterior (M18): **74/231 (32,03%)**, não atualizada porque matriz M18 ausente.
- Faltam 204 fontes sem correspondência **dentro do pacote autônomo M20**. A contagem global deduplicada é desconhecida.

## Testes locais

| Gate | Estado | Evidência |
|---|---|---|
| Integridade snapshot | PASS, 231/231 SHA256 gerados | `tools/verify_m20.py` |
| Consistência constantes Rust-TS | PASS, 33 tabelas e 4 SHA256 de fonte | `tools/port_static_tables.py --check` |
| `tsc` estrito | PASS | `npm run build` |
| Baseline M19 | PASS, 57/57 | `docs/evidence/M20_baseline.log` |
| Regressões M20 novas | PASS, 63/63 | `tests/m20_{systems,engine,simulation}.test.ts` |
| Suíte consolidada no pacote M20 | PASS, 120/120 | `docs/evidence/M20_full_tests.log` |
| QA de interface nova | N/A | nenhuma alteração UI no M20; browser WASM original preservado |
| Testes diferenciais Rust↔TS | UNVERIFIED | Rust toolchain ausente |
| Testes de save BFN real | UNVERIFIED | ingestão no mundo de produção não portada |
| Release da conversão integral | RELEASE_BLOCKED | `KNOWN_ISSUES_M20.md` |

## Defeitos e correções locais

- Teste de lesões: o sorteio de azar `0` adiciona 40 dias (regra Rust); o oráculo do teste foi corrigido, sem alterar o algoritmo.
- Teste de propostas de investidor: proposta pronta para a data corrente é promovida a `shown` no tick; alterado oráculo.
- Build TypeScript `noUncheckedIndexedAccess`: tratamento de índices de caixa e fixação da tipagem dos pools de substituição.

## Estado de release incremental

- ZIP candidato: extraído em diretório independente; `npm test` = **120/120 PASS**.
- Scripts internos após extração: `port_static_tables.py --check` = PASS; `verify_m20.py` = 231/231 fontes e 27 mapeamentos auditados.
- Git bundle clonado: `npm test` = **120/120 PASS**.
- Replay do patch M19→M20 sobre commit baseline Git: árvore SHA idêntica ao repo e bundle.
- Integridade interna do ZIP candidato: **351/351 SHA256 PASS**.
- Registro de versão final, novo checksum e teste do ZIP exato de entrega: evidências externas no relatório `FMU_Next_M20_QA_FINAL.md`.

**Entrega incremental M20 tecnicamente validada**, porém conversão integral `RELEASE_BLOCKED`. Não há MAJOR aceito automaticamente.
