## M31 — 2026-11-06

- Leitor Kryo 4 stream TypeScript com classes dinâmicas/registradas, grafo cíclico e tipos precisos; preflight de roots `.s22`.
- Dump canônico conforme parser Rust, CLI diferencial com `.zst` e proveniência do input.
- Input UTF-16 de 90.000 unidades sem overflow e limites contra streams malformados.
- +44 testes (707 no total); 2 novas correspondências *parciais* de fontes Rust; cobertura nominal 213/231 = 92,21%.
- Importação funcional completa `.s22` ainda bloqueada por esquema e fixtures originais.

## M26 — 2026-11-05

- Codec `.bfn` BF NX + Zstandard + CBOR genérico em TypeScript, sem conversão World.
- Ferramentas read-only baseadas em nove exemplos Rust adicionais; duas fontes de persistência existentes aprofundadas.
- Regressão 411→453 testes, cobertura nominal 196→205 fontes em 231 (+3,90 p.p.).
- Sem alteração de UI, sem alteração do motor Rust original.

## M23 — 2026-11-05

- 60 correspondências Rust → TS de `app`, com lógica parcial de tela, filtros, estado e formatos.
- Cobertura nominal de 125/231 → 185/231 (+25,97pp).
- 67 testes de M23, 316/316 no total; nenhum renderer egui entregue.
- Ferramenta de auditoria SHA de 231 fontes e índice de 167 símbolos TS exportados.

## M22 — 2026-11-05
- 70 novas fontes Rust com correspondência TypeScript parcial, uma fonte anterior aprofundada, em sete crates.
- Extração reproduzível dos esquemas model/canonical, model/saved e persistence/import/generated: 37+37+35 tipos.
- Adição de importador Java/Kryo parcial, header BFN, contrato de partidas e calendário, AI, financeiro e dados por crate.
- 86 novos testes; total 249/249 PASS; cobertura nominal 55/231 → 125/231 (+30,30pp).
- Paridade funcional integral ainda `RELEASE_BLOCKED`, sem Rust differential.

## M29 — Máquina de avanço transacional de World

- `advanceWorldOneDay`: ciclo de dia, pausa humana, lineup de IA, uso obrigatório de engine externa, eventos, recuperação física Rust, tarefas, mercado, fim de calendário e rollback CBOR.
- `advanceWorldDays` e `persistAdvancedBatch`: múltiplos dias em memória e checkpoint `.bfn` reaberto.
- `runM29WorldCli`: inspeção read-only de `.bfn` e lista de dependências de game engine.
- 43 testes novos, 612/612 regressões; 231/231 hashes; cobertura nominal permanece 211/231.
- Sem `Sim::advance` integral, fixtures reais e teste diferencial Rust; `RELEASE_BLOCKED` para release completa.
