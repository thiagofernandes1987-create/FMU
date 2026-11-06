# Dependências e retestes M20

| comp | depends_on | used_by | contrato | impacto | regs |
|---|---|---|---|---|---|
| `simulation/generated/*` | Rust `tables.rs`, `fixture_tables.rs` | `fixture_schedule`, `fixtures`, temporadas | f32/arrays immutable | datas e confrontos | engine+simulation M20 |
| `systems/cash` | relógio, receitas DTO | finanças, salários | bigint e período | saldo, meses | systems M20 |
| `systems/staff` | `ModConfig`, RNG, pagamento callback | mensal, táticas | nível profissional | despesas e técnicos | systems M20 |
| `systems/scouts` | hash Java, valuations e pagamento callback | mercado/olheiros | margem confiável | scouted players | systems M20 |
| `systems/fans` | coach, salários, mudanças de elenco | mensal, diretoria, eventos | apoio clamp e motivo | sociotorcedores | systems M20 |
| `systems/investor` | clock, RNG, config, owner hooks | orçamento, conselho | oferta, ano, owner | aportes e aprovações | systems M20 |
| `engine/clubs` | World club/ownership DTO | escalação/partidas | IDs designados | bola parada | engine M20 |
| `engine/events` | player stats DTO | `engine/injury`, ranking | stats por competição/temporada | desempenho | engine M20 |
| `engine/messages` | Inbox e data | `engine/injury`, FMU UI | ID de mensagem | informação jogador | engine M20 |
| `engine/injury` | events, messages, RNG | rodada/carreira | dias/força/fato | lesões e suspensões | engine M20 |
| `simulation/fixtures` | World DTO, RNG | game fixtures | plano minuto + estádio | cronograma | simulation M20 |
| `model/names` | leitor de arquivos injetado | geração de atletas | cache por país | nomes e origem | engine M20 |
