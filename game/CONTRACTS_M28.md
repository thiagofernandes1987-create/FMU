# CONTRACTS M28 — Version 1

| Componente | I/O (tipos) | Invariantes | Versão e compatibilidade | Testes / QA |
|---|---|---|---|---|
| save_numbers | RustWorld→números/relinks; WorldDocument→WorldDocument | IDs u32 não mudam, aposentados não são apagados; primeira aparição de competição | Fonte Rust model/save_numbers, M28; copy-on-write | `m28_save_numbers` |
| world_finances | World+arena index, i32/i64→cash+finances | Sem perda acima de 2^53; erro por overflow sem sucesso parcial | Rust model/world subset; AI cash untouched ONLY inside market transfer | `m28_calendar_finance` |
| world_calendar | WorldDocument→WorldDayPlan | Puro; nenhuma partida gerada, calendário não mutado | Rust simulation/game subset; clock injetado | `m28_calendar_finance` |
| world_transfer | WorldDocument, PlayerId, ClubId, fee i32, dateFields→new WorldDocument | Transação atômica no grafo CBOR; rejeita humanos duplos; dono e elenco consistentes | Rust market::move_player subset com preflight de segurança extra, sem FMU treasury | `m28_transfer` |
| world_audit | World→WorldAuditReport | Sem mutação; seleção nacional não conta dupla propriedade | Heurística de segurança além do Serde Rust | `m28_audit_cli` |
| career_world | .bfn bytes→World/refs e WorldDocument→save | Preserva arenas/campos desconhecidos; fsync/backups; reabre | M27 + M28, sem engine Rust | `m28_career_world` |
| M28 CLI | args arquivos→resumo/gravação | Só prepare-save escreve, nunca sobrepõe source | Node.js 22+, CLI backend | `m28_audit_cli` |
