# TASKS — Implantação do protocolo multichat FMU (2026-11-06)

## Objetivo e escopo
Centralizar papéis, contratos, tarefas, reuniões e transferências assíncronas por meio do GitHub sem modificar o motor M29/M30, a demo ou registros operacionais do banco. Fonte de execução normativa: `FMU_TEAM.md`. Este `TASKS.md` acompanha **somente a implantação**, não substitui Issues.

## Entradas, saídas e contratos
- Entradas: repositórios `FMU` público e `FMU_Database` privado; README M29/M30 e README do banco.
- Saídas: protocolo central, entrada para chat, templates de Issues (task/meeting) e PR, instrução do DB, três Issues de validação (cadastro, reunião e handoff).
- Contratos: um chat reivindica papel explicitamente; Issues preservam histórico; mensagens identificam `FROM/TO/TYPE/ISSUE/BASE`; handoffs exigem `ACK` posterior; dados privados nunca vão ao FMU público.
- Compatibilidade: somente novos arquivos de coordenação. Sem mudanças no runtime, save `.bfn`, schema, commits existentes nem releases.

## Marcos e checklists
- [x] M1 Descobrir repositórios e verificar acesso GitHub — evidência: `get_repo/list_repositories`, ambas fontes acessíveis.
- [x] M2 Ler baseline FMU M29+M30 e FMU_Database — evidência: `README.md`, `game/RECOVERY_README.md`, `game/QA_RECOVERY_M29_M30.md`, README privado lidos.
- [x] M3 Criar e ler de volta documentos de equipe e modelos — PASS: 9 arquivos lidos no GitHub e conferidos (7 FMU, 2 Database), incluindo READMEs.
- [x] M4 Criar cadastro, reunião e handoff e testar canal de comentários — PASS: Issues #4, #5, #6 criadas; 3 comentários gravados e relidos pelo GitHub.
- [x] M5 Validar papéis, estados, contratos, templates, segurança e limites — PASS: 12/12 verificações semânticas aprovadas, incluindo READMEs, frontmatter, roles, estados e comentários persistidos.
- [ ] M6 Handoff entre dois chats independentes com ACK e primeiro PR real — UNVERIFIED: requer iniciar outra sessão, sem capacidade de acionar chats automaticamente.

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

## Evidência de aceitação da infraestrutura (2026-11-06, São Paulo)

- Fonte: [protocolo](FMU_TEAM.md), [entrada de chats](AGENTS.md), [template de tarefa](.github/ISSUE_TEMPLATE/fmu-task.md), [template de reunião](.github/ISSUE_TEMPLATE/fmu-meeting.md), [template de PR](.github/PULL_REQUEST_TEMPLATE.md) e instruções do Database privado.
- Operações confirmadas: GitHub `create_file`, `update_file` e `fetch_file` para 9 arquivos; `create_issue` para [cadastro #4](https://github.com/thiagofernandes1987-create/FMU/issues/4), [reunião #5](https://github.com/thiagofernandes1987-create/FMU/issues/5), [handoff #6](https://github.com/thiagofernandes1987-create/FMU/issues/6); `add_comment_to_issue` e `fetch_issue_comments` para os 3 tópicos.
- Teste de documentos: 12/12 verificações PASS, incluindo 8 papéis e 6 estados; frontmatter de 2 templates, seção de contrato/revisão de PR, protocolo CLAIM/HANDOFF/ACK e delimitação de privacidade verificados.
- Não foram executados `npm test` nem testes Rust nesta alteração **somente documental**. A baseline de 663 testes é proveniente do README de recuperação, não desta QA.
- GitHub Issues/PRs funcionam para coordenação **assíncrona**, mas avisos entre chats, execução persistente, reuniões síncronas, ACK em segundo chat e integração de PR real não foram provados nem são ativados automaticamente.
- **Resultado da implantação documental:** `PASS`. **Coordenação multichat ponta a ponta:** `PARTIAL / aguardando M6`. **Automação autônoma entre chats:** `NOT_SUPPORTED_BY_FILE`.
