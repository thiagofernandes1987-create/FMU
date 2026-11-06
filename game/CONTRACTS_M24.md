# M24 — Contratos e compatibilidade

| Componente | Entrada/saída | Invariantes de integridade | Compatibilidade | Teste |
|---|---|---|---|---|
| `career_demo` | DemoCareer JSON ↔ resultados, transferências, evolução | 10 clubes, N×(N−1) jogos, 11 titulares, caixa inteiro seguro, sem mutações parciais | Sandbox; **não World Rust** | `m24_web_career.test.ts` |
| `browser.ts` | DOM → ações → DOM | Oito rotas, campos escapados, comandos reais, mobile sem overflow | UI web adaptada, não egui completo | Chromium, `m24_browser_qa.py` |
| `m24_bundle.js` | dist JS CommonJS → único JS browser | proíbe require externo, paths fora de dist | Browser sem ferramenta de bundle externa | Chromium boot |
| `m24_advance_career.js` | num temporadas (1..20) → JSON | 90 partidas por temporada no sandbox | adaptador de exemplo Rust | `m24_advance_example.test.ts` |
| `graph_stats` | KryoGraph22 → stat de propriedade | referencias por ID válidas; contagem de compartilhados | exige grafo já lido | testes M24 persistence |
| `schema_diff` | duas árvores → mudanças por campo e classe | arrays colapsados em `[]`, classes auditadas | não lê CBOR/Zstd | testes M24 persistence |
| `bfn_inspect` | BFN bytes → metadados | header validado, World não carregado | header-only, versão <= 3 | testes M24 persistence |
