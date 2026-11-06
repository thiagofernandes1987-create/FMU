# Matriz de dependências M19

| Componente | Depende de | Consumido por | Contrato | Impacto e regressões |
|---|---|---|---|---|
| `simulation/cup` | `ClubResolver`, `Rng`, comparador sort | jogo de Copa Nacional | M19-SIM-01 | Sorteio e fase de partidas; retestar cup+sorting |
| `simulation/nations` | `Rng`, `NationStageOps` | Nations League / Copa Mundo | M19-SIM-02 | Bracket, país sede; retestar nations |
| `simulation/human_default` | decisões humanas | fluxo interativo | M19-SIM-03 | Recusas e padrão; retestar human |
| `simulation/human_substitutions` | `SubstituteOps`, grid match | substituições durante a partida | M19-SIM-04 | Slots e estado do jogo; retestar grid |
| `simulation/trophy` | catálogo de países, `exists` | galerias | M19-SIM-05 | Fallback de imagens; retestar trophy |
| `simulation/season` | rating, país e flags | encerramento | M19-SIM-06 | Premiações/estrela; retestar season+awards |
| `simulation/sorting` | tabela, nível, tiebreak | cup e league | M19-SIM-07 | Ordem; retestar cup+sorting |
| `systems/award_coaches` | força e posições | `award_history` | M19-SYS-01 | Pontos técnico; retestar coach |
| `systems/award_history` | jogadores/clubes candidatos | `award_lifecycle` | M19-SYS-02 | Prêmios e histórico; retestar history |
| `systems/award_lifecycle` | 13 serviços externos | `game/end_season` | M19-SYS-03 | Efeitos externos, transações; retestar lifecycle |
| `systems/award_clubs` | jogador/temporada | perfil, Hall da Fama | M19-SYS-04 | Ídolos; retestar clubs |
| `public/*.wasm` | runtime original egui/Trunk | navegador | Native reference | Reuso apenas; sem crédito de TS; test static Wasm |
