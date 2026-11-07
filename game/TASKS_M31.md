# FMU M31 — Controle de execução

## Objetivo e escopo

Continuar a conversão Rust→TypeScript do Brasfoot Next em uma rodada focada no formato legado `.s22`, sem reescrever o motor ou substituir a carreira demonstrativa. Fonte canônica: snapshot Rust `bd2ccbdd...`, 231 arquivos SHA-256; baseline Git `7a8f8d5`, M29+M30 com 663 testes.

**Entradas:** código original `crates/persistence/src/kryo/{graph,reader,canonical,input}.rs`, `crates/persistence/src/import/mod.rs`, baseline de 663 testes, esquemas de teste sintéticos. **Saídas:** parser Kryo tipado com esquema injetado, dump/correspondência canônica, preflight do `.s22`, CLI, testes, matriz nominal, documentação, bundle Git, patch e ZIP.

## Marcos

- [x] Recuperar clone Git de M29+M30; baseline 663/663 (EV-M31-001: baseline.log).
- [x] Portar os tipos do grafo e a leitura binária das variantes Kryo, com referências, classe dinâmica, coleção, mapa, arrays, calendário e limite de recursos (EV-M31-002: `m31_kryo_reader.test.ts`).
- [x] Portar a gramática do dump canônico Rust, inclusive bits IEEE-754 e reinício de IDs por raiz (EV-M31-002).
- [x] Pré-validar as duas raízes e construir as nove arenas de `.s22` a partir de **bytes** (EV-M31-003: `m31_s22_preflight.test.ts`).
- [x] Adicionar CLI e comparador diferencial sem falsos positivos por falta de proveniência (EV-M31-004: CLI fixture).
- [x] Testar os 44 casos novos e 663 regressões: 707/707 PASS (EV-M31-005: `evidence/m31/all_tests.log`).
- [x] Auditar 231 SHA de Rust e atualizar `M31_PORTING_MATRIX.csv`: 213/231 nominalmente mapeados; 18 sem port (EV-M31-006).
- [x] Bundle Git e patch reproduzidos com árvores idênticas, 707/707 e 44/44 PASS (EV-M31-007).
- [x] ZIP preliminar extraído e recompilado, 707/707 PASS, 231 SHA fontes; duas temporadas sandbox PASS (EV-M31-008).
- [ ] ZIP final após documentação, testes e hashes (EV-M31-009; conferir antes de entrega).

## Bloqueios para release integral

- [ ] Obter `crates/persistence/data/kryo-schema.json` original do jogo (ausente no snapshot): **BLOCKER** de importação `.s22` real.
- [ ] Obter save `.s22` e dump `.canon.txt.zst` gerados no jogo original: **BLOCKER** de diferencial.
- [ ] Converter os 11 `convert_*` de importação `.s22` em `World` Rust; compatibilidade e migrador semânticos **ainda incompletos**.
- [ ] Completar 18 fontes Rust ainda `UNPORTED` e motor `Sim::advance` integral: **BLOCKER** de paridade.

**Status incremento M31:** código e testes PASS, pacote pendente. **Status do jogo Next integral:** `RELEASE_BLOCKED`.
