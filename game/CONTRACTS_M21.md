# Contratos M21 por conjunto de dependências

| Contrato | Componente | I/O | Invariante/compatibilidade | Testes |
|---|---|---|---|---|
| C21-MODEL-01 | `ported/model/java_sort` | array + comparador → array estável em memória | `n < 32`, comparadores inconsistentes com fixtures Java do Rust | `m21_model.test.ts` |
| C21-MODEL-02 | `ported/model/java_hash` | Java Integer/String → hash e ordem Java | UTF-16, `put` não reordena, resize Java | `m21_model.test.ts` |
| C21-MODEL-03 | `ported/model/fdlibm` | f64 → f64 | sete vetores de bits do StrictMath/JDK21; especiais | `m21_model.test.ts` |
| C21-MODEL-04 | `ported/model/world` | arena IDs → clube/finanças | categorias de renda/despesa explícitas; World DTO ≠ .bfn | `m21_cross.test.ts` |
| C21-SIM-01 | `ported/simulation/*` | contrato, caixa, estádio, inbox, club record | efeito mutável no DTO e hooks financeiros explícitos | `m21_domain`, `m21_cross` |
| C21-SYS-01 | `ported/systems/clock` | 13 serviços → ticks e checkpoints | ordem original; erro interrompe; sem scheduler oculto | `m21_domain.test.ts` |
| C21-SYS-02 | `ported/systems/tactics, director` | lineup e serviços de olheiro → tática/alvos | avaliação não inventada; serviços de engine injetados | `m21_domain`, `m21_cross` |
| C21-ENGINE-01 | `ported/engine/stadium` | local, preços, RNG → attendance e renda | quatro setores, limites, preços/ruído explícitos | `m21_cross.test.ts` |
| C21-DATA-01 | `ported/datapack/codes, trophies` | ID/código/ícone → caminho | 224 FIFA, 27 UFs, comparações sensíveis a caixa | `m21_domain.test.ts`, `verify_m21_sources.py` |
| C21-DATA-02 | `ported/datapack/tree, format, issues` | bytes, níveis de camada, issues → dados/diagnósticos | cópias de bytes, remoções, segurança de path; unzip externa | `m21_domain.test.ts` |
