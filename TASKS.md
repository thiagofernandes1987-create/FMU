# TASKS — Implantação do protocolo multichat FMU (2026-11-06)

## Objetivo e escopo
Centralizar papéis, contratos, tarefas, reuniões e transferências assíncronas por meio do GitHub sem modificar o motor M29/M30, a demo ou registros operacionais do banco. Fonte de execução normativa: `FMU_TEAM.md`. Este `TASKS.md` acompanha **somente a implantação**, não substitui Issues.

## Entradas, saídas e contratos
- Entradas: repositórios `FMU` público e `FMU_Database` privado; README M29/M30 e README do banco.
- Saídas: protocolo central, entrada para chat, templates de Issues (task/meeting) e PR, instrução do DB, duas Issues de validação.
- Contratos: um chat reivindica papel explicitamente; Issues preservam histórico; mensagens identificam `FROM/TO/TYPE/ISSUE/BASE`; handoffs exigem `ACK` posterior; dados privados nunca vão ao FMU público.
- Compatibilidade: somente novos arquivos de coordenação. Sem mudanças no runtime, save `.bfn`, schema, commits existentes nem releases.

## Marcos e checklists
- [x] M1 Descobrir repositórios e verificar acesso GitHub — evidência: `get_repo/list_repositories`, ambas fontes acessíveis.
- [x] M2 Ler baseline FMU M29+M30 e FMU_Database — evidência: `README.md`, `game/RECOVERY_README.md`, `game/QA_RECOVERY_M29_M30.md`, README privado lidos.
- [ ] M3 Criar e ler de volta documentos de equipe e modelos — necessário verificação remota após escrita.
- [ ] M4 Criar Issue de adesão e reunião assíncrona e testar canal de comentários — necessário links e leitura posterior.
- [ ] M5 Registrar QA do protocolo, dependências e limitações; finalizar status de entrega — depende de M3/M4.

## Matriz de dependências
| componente | depends_on | used_by | contrato/ver | impacto | regs |
|---|---|---|---|---|---|
| FMU_TEAM.md | GitHub main | todos os chats | roles v1, mensagens v1 | coordenação | leitura remota |
| AGENTS.md | FMU_TEAM.md | novos chats | ponteiro válido | onboarding | link test |
| Templates GitHub | FMU_TEAM.md | Issues / PRs | estados e campos | fluxo de handoff | conteúdo e frontmatter |
| FMU_Database/AGENTS.md | FMU_TEAM.md | DATABASE | repo privado | cross-repo | link e permissão |
| GitHub Issues | templates | todos os chats | IDs/URLs e comentários | comunicação | issue/comment readback |

## QA, aceite e riscos
- QA técnico: checar existência remota, links de caminhos, frontmatter YAML, ROLE e estados consistentes; criar Issue e registrar comentário de teste, depois ler de volta.
- QA visual: **não aplicável ao runtime do jogo**; os modelos são Markdown, não houve alteração de UX/UI.
- Aceite: documentação e canal GitHub confirmados, nenhuma alteração no motor nem exposição de dados.
- Bloqueios externos previstos: não há execução automática dos outros chats; segundo chat e teste de ACK ainda exigem interação independente. Isso permanece `UNVERIFIED` e não pode ser declarado PASS.
- Próximas etapas depois do aceite: usuário abre chats para os papéis; cada chat registra ROLE e assume Issues; primeiro PR real testa integração ponta a ponta.
