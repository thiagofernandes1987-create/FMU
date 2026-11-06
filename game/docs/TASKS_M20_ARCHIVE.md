# M20 — Controle Full / agressividade sem inflar progresso

**Objetivo:** acelerar a cobertura total mediante ports funcionais verificáveis e preparar consolidação M18→M20. **Origem:** snapshot oficial Rust + M19 independente. **Saída:** TS fonte/compilado, testes, hashes, docs, Git bundle, ZIP. **Escopo:** fontes da matriz M20 (16 novas) + M19 (11), nenhum dado privado.

## Marcos e evidência

- [x] Recuperar e validar snapshot M19 (baseline 57/57 PASS).
- [x] Conferir 231 fontes Rust no snapshot e reconstruir matrizes estáveis (script `verify_m20.py`: 231/231).
- [x] Transpor 33 constantes originais em quatro fontes por parser determinístico (script `port_static_tables.py --check`: PASS).
- [x] Traduzir lógica de 12 fontes Rust novas, com funções comentadas e contratos explícitos.
- [x] Integrar calendário gerado de 3/4/5/6/9/11/25 clubes, injury→events→messages, caixa, comissão, scouting, fãs, investidores.
- [x] Compilar TypeScript em modo estrito, executar casos novos e regressões: 120/120 PASS.
- [x] Verificar Git clone, bundle offline, ZIP extraído, hashes SHA-256 por membro, scripts e documentação: candidate 120/120, 351 hashes PASS, árvore Git idêntica. O ZIP definitivo será revalidado externamente antes da entrega.

## Dependências para aceite integral (abertas)

- [ ] Disponibilizar a matriz/artefato M18 exato para união deduplicada (fonte ausente no ambiente corrente).
- [ ] Converter os demais arquivos Rust e as rotas internas não portadas.
- [ ] Testes diferenciais e compatibilidade `.bfn` usando runtime Rust.
- [ ] Integrar todos os adaptadores TS ao `World` de produção e executar temporadas reais com estados persistidos.

**Critérios de aceite do incremento:** 120/120, 231/231 hashes, tabelas geradas idênticas, pacote com integridade e sem fontes tipográficas. **Critérios de aceite integral:** bloqueados, sem MAJOR aceito automaticamente.

**QA visual:** não aplicável ao M20 (somente código backend); a página web WASM é um recurso preservado sem alterações visuais.
