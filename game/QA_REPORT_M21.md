# QA M21 — Conversão ampliada Rust → TypeScript

**Fonte:** Brasfoot Next `bd2ccbd`; **base:** M20 Git `46ebbb4`. **Status do incremento:** testes executados; **conversão integral:** `RELEASE_BLOCKED`.

## Escopo concluído

Foram trabalhadas **28 fontes Rust adicionais distintas** em `model` (13), `simulation` (5), `systems` (3), `engine` (2) e `datapack` (5). Comentários de origem, funções, dependências e efeitos incluídos nos `.ts`; inventário detalhado em `docs/M21_SOURCES.md`.

- `model`: enums de índices de arena, `StrictMath.log` (sete vetores binários Rust), `JavaHashMap`, ordenação Java, marcas e países gerados das fontes, opções, estrutura de mundo, contratos transitórios, rótulos e estágios.
- `simulation`: contratos, juros/empréstimo, estádio, mensagens/multas e registros históricos de clube.
- `systems`: ordem dos 13 ticks, táticas automáticas e indicação de reforços pelo diretor.
- `engine`: hooks padrão e público/receita do estádio por setor.
- `datapack`: códigos FIFA, ícones de troféus, problemas do validador, schema do manifesto e camadas de arquivos.

## Testes e integridade

| Controle | Resultado | Evidência |
|---|---|---|
| Baseline M20 | PASS — 120/120 | `docs/evidence/M20_full_tests.log` |
| Testes M21 adicionais | PASS — 43/43 | `tests/m21_*.test.ts` |
| Suíte M20+M21 | PASS — 163/163 | `npm test`, em `evidence/m21/full_tests.log` |
| SHA-256 fontes Rust | PASS — 231/231 | `tools/verify_m21_sources.py` |
| 15 tabelas de códigos e marcas | PASS — dados exatos | `tools/verify_m21_sources.py` |
| 224 países | PASS — entrada e ordem exatas | `tools/verify_m21_sources.py` |
| Engine WASM original M20 | Preservado, NÃO contado como TS | `public` |
| Rust diferencial | **UNVERIFIED** | `cargo`/`rustc` indisponíveis |
| QA visual | N/A | nenhum código UI alterado |
| Integração automática aos saves da carreira Rust | NÃO EXECUTADA | DTOs e hooks opt-in |

## Percentuais auditáveis

- Baseline M20 independente: **27/231 = 11,69%** de correspondência de arquivo.
- M21: **+28 arquivos = +12,12 pontos percentuais** de correspondência na base independente M20.
- Acumulado M20+M21: **55/231 = 23,81%** de correspondência parcial ou comportamental, **176 arquivos sem correspondência**.
- Última referência histórica M18: 74/231 = 32,03%, mas **não pode ser conciliada** à base M20/M21 sem a árvore Git M18; não há percentual total unificado comprovado.
- **Meta solicitada de +30 pp por lote: NÃO ATINGIDA**. Eram necessárias cerca de 70 novas fontes, não 28.
- Percentual funcional integral: **INDETERMINÁVEL** sem testes diferenciais e sem integração com o World original.

## Findings e riscos

- **BLOCKER:** outros 176 arquivos sem port na árvore M20+M21, e vários ports parciais.
- **BLOCKER:** ausência da árvore M18 e testes diferenciais Rust; histórico cumulativo não reconciliável.
- **MAJOR não aceito para release integral:** tipos DTO usam IDs TS e funções de World/clock com callbacks; não decodificam `.bfn` nem executam automaticamente a carreira Rust.
- **MAJOR não aceito para release integral:** `datapack/tree` depende de descompressão ZIP externa; schema e gerador de dados não são importador completo.
- **MINOR:** os defaults `NoSystems` e os objetos de opções são interfaces/adaptações funcionais, não o motor inteiro.

**Conclusão:** incremento M21 verificável; não anunciar homologação integral ou meta de +30 pp.

## QA do pacote reproduzível

- Git bundle M21 foi reclonado de forma independente: `163/163` testes e `m21:verify` passaram.
- O patch `M20_to_M21.patch` foi reaplicado sobre M20: a árvore Git resultante coincidiu com a do código M21, e `163/163` testes passaram.
- ZIP pré-release foi extraído em diretório limpo: `163/163` testes e **437/437 hashes de membros** aprovados.
- O Git bundle e o patch da distribuição final devem ser conferidos novamente após esta atualização documental.
