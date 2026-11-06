# M21 — Lote ampliado Rust → TypeScript

Objetivo: ampliar substancialmente a cobertura auditável de 231 fontes Rust usando a base M20, com prioridade em model/engine/simulation/systems/datapack. Meta solicitada: +30 pontos percentuais (≈70 fontes novas), **não presumir atingimento**.

Escopo: funções e constantes reais com testes de origem; não contar interfaces puras e arquivos vazios. Fora de escopo: portar toda UI desktop e declarar equivalência Rust/WASM sem testes diferenciais. Inputs: M20 commit `46ebbb4`, snapshot Rust `bd2ccbd`; saídas: TS, JS compilado, testes, matriz, QA, ZIP, Git bundle e patch.

- [x] Recuperar M20 da sessão, ler Bíblia v1.8.1, executar baseline (120/120 PASS).
- [x] Implementar grupos por crate e registrar status por fonte.
- [x] Novos testes funcionais e regressões anteriores.
- [x] Medir cobertura real e evitar dupla contagem de fontes M18 históricas.
- [x] Release QA, manifesto, replay Git, verificação de ZIP em extração pré-release limpa; a última versão será novamente conferida.
- [ ] Meta +30 pp (somente se ≈70 fontes adicionais forem de fato implementadas e testadas).

Contraintes: sem compilador Rust, diferencial Rust UNVERIFIED; sem QA visual salvo mudança UI (nenhuma prevista). M20 não inclui a árvore M18; o percentual acumulado histórico é UNVERIFIED. A matriz M20 isolada é verificável.
