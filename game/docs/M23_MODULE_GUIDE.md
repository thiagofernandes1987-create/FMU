# FMU M23 — Guia de manutenção de 60 fontes `app`

## Escopo, origem e limites

- **Origem Rust:** snapshot Brasfoot Next `bd2ccbdd5f1aaacb6437b58b198d7963c61b3780`.
- **Base do projeto TS:** M22 commit `7c57fbb`, árvore M21→M22; histórico preservado por bundle e patch.
- **Novos módulos:** `src/m23/app/*.ts`, 60 arquivos com regras/dados extraídos de `app` (fora `types.ts` e `standings_ext.ts`, que são auxiliares).
- **Inventário por função:** `docs/M23_APP_FUNCTIONS.csv` e `.json` listam origem Rust, arquivo TS, símbolos públicos e comentário de módulo. A matriz global está em `docs/M23_PORTING_MATRIX.csv`.
- **Limite de equivalência:** trata-se de **view-models, regras de seleção, formatação e estados**; nenhum dos 60 arquivos constitui port completo do renderizador `egui`, da navegação nativa e dos serviços reais da aplicação. A marcação `release_ready=NO` é obrigatória.

## Responsabilidades, dependências e efeitos por domínio

| Família | Módulos TS (exemplos) | Funções e finalidade | Dependências e efeitos | Testes |
|---|---|---|---|---|
| Ciclo de carreira | `career`, `career_screen`, `app`, `opening`, `start`, `menu` | seleção de saves, ações e telas, metadados de save, avanço com rollback do `world` via callbacks | `CareerState`, funções `clone`/`run` injetadas; **não persiste `.bfn`** nem gerencia renderização | `m23_app_integration.test.ts` |
| Transferência/contrato | `market`, `offer`, `contract`, `history`, `squad_offer`, `proposals`, `loans` | valores e limites de ofertas, listas, histórico, propostas, empréstimos, duração de contrato | registros TS explícitos; operações de mercado real seguem fora dos seletores | `m23_app_core`, `m23_app_selectors`, `m23_app_integration` |
| Gestão e instalações | `management`, `assets`, `satellites`, `finances`, `stadium`, `teams`, `youth` | estado de abas, ordens e preços, filtros e ações permitidas | regras de UI extraídas, sem execução financeira ou atualização do `World` | `m23_app_selectors` |
| Liga/partidas | `round`, `standings`, `standings_ext`, `lineup`, `pitch`, `calendar`, `head_to_head`, `team_of_round`, `view` | janelas de rodada, classificação, escalações, coordenadas e disputas | tabelas/matches injetados; **não calcula partidas no engine** | `m23_app_selectors` e `m23_app_integration` |
| Histórico e premiação | `awards`, `champions`, `club_history`, `club_ranking`, `leaders`, `trophies`, `player`, `coaches`, `home` | ranking, artilharia, títulos, histórico, técnicos e notas | vetores da carreira; desempates e faixas confirmados por fontes Rust | `m23_app_selectors` e `m23_app_integration` |
| Formatos/UX sem render | `format`, `motion`, `glyphs`, `theme`, `widgets`, `form`, `modkit`, `controls`, `preferences`, `retire`, `support` | formatação de moedas e datas, símbolos, easing, cores, texto e widgets | **36 glifos Unicode extraídos sem arquivos de fonte**, tokens; nenhum CSS/DOM/egui renderizado | `m23_app_core`, `m23_app_integration` |
| Jornal/busca/notificações | `newspaper`, `search`, `findings`, `messages`, `new_game`, `player_actions` | filtros, estados, busca, exibição de notícias e ações | DTOs de jogador/mensagens; faltam services reais e front-end | `m23_app_core`, `m23_app_selectors`, `m23_app_integration` |
| Pacotes/arquivos | `patch_library`, `patch_store`, `patch_download`, `patches`, `game_files` | chaves hash e GitHub, progresso de download, bytes clonados em memória, prevenção de traversal | `MemoryPatchStore` é implementação **in-memory de testes**; transporte HTTP e file system reais não implementados | `m23_app_integration` |

## Contratos críticos da migração

1. **Identidade e tempo:** Rust IDs de arena, relógio local do jogo e IDs de clubes devem ser convertidos no importador. DTOs TS usam identificadores sem equivalência automática.
2. **Persistência:** `src/m23/app/career.ts` executa `clone(run(world))` com rollback do `world` em falha, **não equivale a transação completa** se callbacks modificarem Ledger, RNG, banco ou efeitos externos.
3. **Busca:** o valor padrão é força **1–100**, idade **16–45**, atributos individuais **1–100**; filtro de idade superior converte o limite especial 45 em 100. Alterações exigem testes de regressão.
4. **Líderes:** cap histórico original **401** linhas, não 100. Não alterar para “otimização” sem aceite do produto.
5. **Formações:** `lineup.ts` lista 14 formações da fonte Rust. Clique vazio não inicia seleção; troca em dois cliques retorna estado novo, sem alterar o original.
6. **Pacotes externos:** normalização/validação de URL e SHA, `MemoryPatchStore` não é instalação de patch. Download real, persistência em browser, serviços da web e assinatura digital **ainda não existem**.
7. **Visual:** portar a regra sem desenhar os elementos não entrega a UI. A migração de `egui` para interface web requer componentes, rotas, acessibilidade, renderizações mobile/tablet/desktop e QA visual.

## Localização dos testes e regressões

```bash
npm run build
npm run m23:tests
npm test
python3 tools/m23_audit.py --check
```

O pacote inclui todas as fontes Rust de referência e o WASM original da versão web, que **não conta como código TypeScript convertido**. Para corrigir qualquer regra, localizar a linha correspondente na matriz, abrir a função TypeScript documentada e executar o teste de domínio e a suíte completa.

## Pontos restantes

- `app`: 6 arquivos sem correspondência (2 exemplos, `src/main.rs`, `src/screens/mod.rs`, 2 testes de interação/catalogação).
- Nas outras crates: 40 arquivos sem correspondência; persistência `.bfn`, orquestração do jogo e diferenciais Rust/TS ainda não homologados.
- Mesmo os **185 arquivos nominalmente mapeados** incluem muitos ports parciais: **80,09% não significa 80,09% das funcionalidades completas**.
