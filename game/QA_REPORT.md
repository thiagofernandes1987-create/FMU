# QA M19 — Incremento acelerado standalone

## Escopo e implementação

- `simulation`: cup.rs, nations.rs, human/mod.rs, human/substitutions.rs, trophy.rs, season.rs, sorting.rs — **7 arquivos de origem**.
- `systems`: awards/coaches.rs, awards/history.rs, awards/mod.rs, awards/clubs.rs — **4 arquivos de origem**.
- Os **11 ports** contêm funcionalidade TypeScript testável; não são placeholders. Alguns dependem de callbacks que precisam ser implementados na carreira FMU.
- Pacote M18 não foi encontrado no ambiente; **a contagem incremental efetiva não pode ser reconciliada** com M18.

## Evidências

| Verificação | Resultado | Evidência |
|---|---|---|
| `tsc -p tsconfig.json`, strict | PASS | `docs/test_final.log` |
| Testes de domínio TypeScript | **57/57 PASS** | `docs/test_final.log` |
| Inventário Rust | 231 arquivos indexados, 88 nos crates solicitados | `docs/M19_SOURCE_INVENTORY.csv` |
| Hash dos 231 arquivos Rust | SHA256 individuais gerados de todos os bytes disponibilizados | `docs/M19_SOURCE_INVENTORY.csv` |
| WASM original | WebAssembly.compile PASS; export main presente, 27 exports / 791 imports | `docs/WASM_RUNTIME_AUDIT.json` |
| Servidor HTTP original | HTML, JS e WASM com HTTP 200; tipo `application/wasm` | Teste curl/urllib local |
| Executar o jogo no Chromium | UNVERIFIED — sandbox retornou `ERR_BLOCKED_BY_ADMINISTRATOR` para HTTP e file:// | Verificar em navegador local |
| Comparação Rust/TypeScript | UNVERIFIED — rustc/cargo indisponível | Requer runner Rust diferencial |
| Regresso M18 366/366 | UNVERIFIED — M18 ZIP não montado | Requer artefato M18 |
| Testes em ZIP extraído | PASS: 57/57 na extração limpa, 302/302 hashes internos, ZIP CRC íntegro | `docs/QA_PACKAGE_FINAL.json` |

## Correções aplicadas

- Fixture de Copa de 32 selecionava clubes ainda inexistentes; ampliado catálogo do fixture, sem mascarar erro de domínio.
- Comparador Rust não usa ID como critério de desempate: utiliza `tiebreak_number`; corrigido e adicionado teste.
- Tipos `strict` de mapas de países/clubes exigiram asserções somente em fixtures que os criam de forma determinística.

## Gates e riscos

- **Incremento standalone:** funcionalmente PASS (57/57). Nenhum novo visual é produzido neste lote.
- **Integração e release do FMU sobre M18:** `RELEASE_BLOCKED` devido a fonte base ausente, RNG World, persistência e APIs da engine não conectadas.
- **Meta +25 pontos percentuais:** NÃO ATINGIDA. Baseline informado M18 74/231 (32,03%); alvo >=132/231 (57,14%). Os 11 ports standalone não substituem os 58 adicionais que precisam ser conciliados e testados.
