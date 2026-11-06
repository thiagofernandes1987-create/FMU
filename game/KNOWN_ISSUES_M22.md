# M22 — Known issues / blockers

| ID | Severidade | Status | Consequência | Condição de aceite |
|---|---|---|---|---|
| B22-01 | BLOCKER integral | OPEN | 106/231 fontes Rust ainda UNPORTED | implementar e validar todas as rotas |
| B22-02 | BLOCKER paridade | OPEN | sem Rust differential em `.bfn` e matches | Cargo + fixtures de save comum + replay simulação |
| B22-03 | MAJOR | OPEN / não aceito | APIs M22 opt-in, `World` Rust não ligado a todos os adaptadores | adaptadores reais com save/reload e temporada integral |
| B22-04 | MAJOR | OPEN / não aceito | `.bfn` só cabeçalho, corpo Zstd+CBOR não convertido | round-trip de payload e migrações diferenciais |
| B22-05 | MAJOR | OPEN / não aceito | parser Kryo completo não portado; canonical dump genérico difere do formato Rust | testes de grafo completos com fixture original |
| B22-06 | MINOR | OPEN | dados i18n `Fluent` só formato textual simples, seletores não cobertos | implementar AST Fluent para todo catálogo |
| B22-07 | MAJOR | OPEN / não aceito | `engine` porta pesos/seleção e regras, não o match engine inteiro | comparar eventos e RNG em jogos completos |

**Condição:** usuário solicitou >=30pp por lote, e a meta nominal é atingida (70 novos de 231). Isso não constitui aceitação dos MAJORs ou liberação da conversão integral.
