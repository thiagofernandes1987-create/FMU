# CONTRACTS M29

| ID | comp | Entrada → saída | Invariantes | Verificação | Compatibilidade |
|---|---|---|---|---|---|
| CT-M29-01 | `advanceWorldOneDay` | `WorldDocument` + `WorldAdvanceHooks` → novo documento ou pausa humana | Nunca inventar placar; dia concluído uma vez; sem alterações na entrada em falhas; engine externa obrigatória | testes M29, 612 regressões | Estrutural com Rust; paridade de gameplay não verificada |
| CT-M29-02 | `recoverWorldPlayer` | player/idade/humano → fitness <=100 | Mesmos intervalos `model/player.rs`; juvenis restaurados para 100 | vetores de idade e youth | Port funcional pontual |
| CT-M29-03 | `runWorldDayTask` | task, dia, Clock, World → efeitos financeiros | `ds` e `dJ` preservam i64; tarefas sem port exigem hook; nenhuma tarefa descartada em rollback | DS/DJ/unknown/overflow | Port pontual com runtime injetado |
| CT-M29-04 | `advanceWorldDays` | World+hooks+N → batch | limites N, pausa explícita, falha posterior não altera World original | 2-day batch; second-day failure | Múltiplos dias sem geração de nova temporada |
| CT-M29-05 | `persistAdvancedBatch` | batch+path → .bfn reaberto | sem save parcial; arquivo atômico e backup; valida referência | round-trip em disco, CBOR unknown fields | Lê/escreve mundo sintético; fixture Rust real ausente |
| CT-M29-06 | `runM29WorldCli` | inspect .bfn → relatório | read-only; aborta edição por CLI | testes de inspect e reject | Nativo Node.js/TypeScript |
