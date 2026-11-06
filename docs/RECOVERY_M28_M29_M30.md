# FMU M28 / M29 / M30 — recuperação dos arquivos originais

Os três pacotes ZIP originais foram recebidos, têm CRC válido e foram copiados sem alterações para a Biblioteca FMU (pasta `/FMU_Recovery/2026-11-06`).

| Pacote | Testes | SHA-256 |
|---|---:|---|
| M28 | 569/569 | `f69ee04342bba13cf6d64b1616a5c0cb074ce6ff7330d05458f6381458c6f8fe` |
| M29 | 612/612 | `e5edb8b884926eecd9516b34a78b2422274762dcf5b0fdf92991c81d0d9cc882` |
| M30 standalone | 46/46 | `4f22f07e3e4500a6c6d0dc0aa1883384c8deaed57e82a3246f690398d596020d` |
| M29+M30 integrado | **663/663** | Código versionado em `game/` |

A árvore `game/` contém fontes TypeScript, testes, documentação e o snapshot Rust original de referência (231 `.rs`) para auditoria de SHA. Foi omitido o binário WebAssembly histórico de 18 MB, gerados `dist/`, capturas e logs de execução, porque os originais completos já foram preservados em arquivos ZIP separados.

O código recuperado contém o adaptador M29↔M30 e testes de `.bfn` persistido; não cria jogabilidade Rust que não existia. A **cobertura nominal** declarada permanece 211/231 (91,34%); paridade funcional permanece **UNVERIFIED**. Os 20 testes/exemplos Rust restantes não foram portados automaticamente.

O repositório FMU_Database não recebeu alterações nesta recuperação, pois nenhum dos três ZIPs continha uma base de dados de jogadores real e autorizada. Seu conteúdo já publicado permanece intacto.
