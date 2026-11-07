# FMU — Protocolo de Equipe Multichat
**Arquivo canônico:** \`FMU_TEAM.md\` · **Versão:** 1.0.0 · **Estado:** ATIVO (coordenação assíncrona) · **Repositório coordenador:** \`thiagofernandes1987-create/FMU\`

> **Objetivo:** fazer vários chats trabalharem como uma equipe sobre um único projeto, sem depender do histórico de uma conversa pesada. Este arquivo define os papéis, contratos, comunicações, reuniões, tarefas e critérios de aceite. **As tarefas e mensagens vivas ficam em GitHub Issues/PRs, não dentro deste documento.**

## 1. O que é possível e o que NÃO é automático

- Cada chat pode **ler/editar arquivos, consultar/criar/comentar Issues e trabalhar com PRs** se tiver o conector GitHub ativo e o usuário autorizar a ação correspondente.
- **Um chat não envia mensagens diretamente à memória interna de outro.** O conteúdo compartilhado é o que foi registrado no GitHub.
- **Não há execução ou reuniões autônomas em segundo plano** apenas por este arquivo. Uma nova atuação ocorre quando um usuário inicia o chat, uma automação disponível é explicitamente configurada, ou um agente externo autorizado executa a tarefa.
- GitHub Issues funcionam como **caixa de entrada por função**. Os agentes devem fazer *pull* de novidades, não presumir notificações automáticas entre chats.
- **O usuário é a autoridade final** para prioridades, escopo, dados privados, gastos e publicação; o Tech Lead coordena, não substitui essa autoridade.

## 2. Primeiros passos obrigatórios de qualquer chat FMU

1. Ler este arquivo **na branch \`main\`**, além de \`AGENTS.md\`, \`README.md\`, os contratos da área e o último estado pertinente em Issues/PRs; registrar o commit-base.
2. Identificar o papel principal da sessão na tabela abaixo. **Não inventar** que um papel foi atribuído ou que outro chat já aceitou a tarefa.
3. Consultar a Issue **[COORD] Registro de chats e funções**; registrar um comentário de adesão com \`ROLE\`, \`CHAT_LABEL\` (nome humano sem link privado), \`SESSION_KEY\` (ID manual único), \`SCOPE\` e \`CURRENT_ISSUE\`. Um chat sem registro está **NÃO ATRIBUÍDO**.
4. Ler Issues abertas dirigidas a seu \`ROLE\` e comentários posteriores à última atividade. Priorizar instruções diretas do usuário e tarefas explicitamente aceitas.
5. Antes de alterar código, abrir/assumir uma Issue com escopo e critérios de aceite; registrar branch, componentes e contratos impactados; evitar duas sessões gravando nos mesmos arquivos.
6. Trabalhar em branch \`<tipo>/<issue>-<resumo>\`, produzir commit/PR com teste e evidências, e registrar um comentário de *handoff* na Issue. Nunca declarar PASS sem evidência.
7. Ao sair, comentar **estado, commit/PR, testes, dependências, riscos e próximo passo**. O próximo chat consegue retomar somente pelo GitHub.

### Mensagem pronta para abrir outro chat
> “Você é o(a) **[PAPEL]** da equipe FMU. Leia \`https://github.com/thiagofernandes1987-create/FMU/blob/main/FMU_TEAM.md\`, \`AGENTS.md\` e as Issues abertas. Registre seu papel na Issue [COORD] de cadastro, assuma só tarefas da sua área e execute conforme contratos, criando commits/PRs e fazendo handoff pelo GitHub. Não presuma mensagens automáticas de outros chats; registre bloqueios e avise neste chat quando precisar de decisão humana.”

## 3. Papéis e fronteiras de responsabilidade

| ROLE (ID fixo) | Função | Entrega principal | Responsável por aprovar / contrato |
|---|---|---|---|
| \`TECH_LEAD\` | Líder técnico e arquitetura | Priorização, decomposição de Issues, contratos entre módulos, decisão arquitetural, review transversal, planos de integração | Contratos e compatibilidade; decisões irreversíveis pedem aceite do usuário |
| \`DEV_ENGINE\` | Desenvolvedor de motor e engenharia reversa | Rust→TypeScript, simulação, match engine, \`.bfn\`→World, RNG determinístico, contratos e testes diferenciais | API da engine e invariantes do save; Tech Lead revisa |
| \`BACKEND\` | Backend / serviços | APIs, autenticação futura, transações autoritativas, persistência da carreira, endpoints e integração da engine | API versionada e integridade; Tech Lead revisa |
| \`FRONTEND\` | Frontend | Fluxos do jogo, integração de APIs, telas responsivas, estados de erro/loading e acessibilidade | Contratos de API e tokens UX/UI; UX/UI + QA revisam |
| \`UX_UI\` | Design e experiência | Fluxos, wireframes, sistema visual, componentes, protótipos, especificações e inspeção visual | Tokens/estados/contraste/responsividade; Frontend consome |
| \`DATABASE\` | Dados / esquema | Schema, migrações, chaves, proveniência/licenças, importadores e testes de integridade no \`FMU_Database\` privado | Migrações compatíveis e limites de dados; Backend consome |
| \`QA_RELEASE\` | Qualidade e release | Matriz de rastreabilidade, QA técnico/visual, regressão, revisão de PR e relatório de release | Evidências de testes e critérios de aceite; Tech Lead coordena |
| \`DEVOPS\` | Integração e publicação | CI/CD, segurança de segredos, workflows, páginas de demo, proteções de branch e artefatos | Build e deploy verificáveis; QA revisa |

**Regra:** um chat possui **um ROLE principal** por sessão; acumular papel só quando explicitado e registrado. Não há um agente “permanentemente trabalhando” fora da sessão ativa. Nome do chat é rótulo de acompanhamento, não identidade autenticada do GitHub.

**Sugestão inicial, ainda sujeita a aceite em Issue:** chat “Branch · Branch · Fazer engenharia reversa” → \`DEV_ENGINE\`; esta conversa de coordenação → \`TECH_LEAD\`; chats \`FRONTEND\`, \`BACKEND\`, \`UX_UI\`, \`DATABASE\` e \`QA_RELEASE\` precisam aderir separadamente.

## 4. Fonte da verdade, repositórios e limites de acesso

| Fonte | Conteúdo canônico | Uso |
|---|---|---|
| \`FMU/main/FMU_TEAM.md\` | Papéis e protocolo | Versão de regras; mudar só com Issue \`[DECISION]\` e revisão |
| \`FMU/main/AGENTS.md\` | Instruções mínimas para iniciar chat | Sempre apontar para este protocolo |
| \`FMU/Issues\` | Demandas, responsáveis funcionais, decisões, bloqueios e atas assíncronas | Uma Issue por unidade de trabalho ou reunião |
| \`FMU/PRs\` | Código revisável, contratos alterados, evidência e integração | Uma entrega por PR; \`main\` não é sandbox |
| \`FMU/game\` | Engine recuperada M29+M30 e código da aplicação | **Não** sobrescrever nem supor paridade Rust integral |
| \`FMU_Database\` privado | Schema, migrações e importação licenciada | Sem copiar dados/segredos para Issues do FMU público |

**Contratos obrigatórios entre áreas:**
- \`DEV_ENGINE → BACKEND\`: API de simulação versionada, tipos, seeds/RNG, serialização \`.bfn\`, rollback, erros, testes.
- \`BACKEND → FRONTEND\`: OpenAPI/tipos ou contrato explícito, URL/basePath, autenticação, erros, paginação, estados de loading.
- \`UX_UI → FRONTEND\`: tokens, layout mobile/tablet/desktop, a11y, estados vazio/carregando/erro/sucesso, critérios visuais.
- \`DATABASE → BACKEND\`: schema/migração versionada, IDs estáveis, integridade referencial, estratégia de rollback e origem dos dados.
- \`QA_RELEASE ↔ todas as áreas\`: requisitos↔testes↔evidências↔regressões; sem alegar homologação por testes parciais.

**Baseline a preservar:** o README atual do FMU registra a recuperação **M29+M30** e **663 testes aprovados** na integração então efetuada. Isso é evidência histórica registrada no repositório, **não** um novo teste desta sessão nem prova de carreira Rust completa.

## 5. Fluxo de tarefas e estados

Cada demanda é uma **GitHub Issue**. Título sugerido: \`[ROLE][TASK] Descrição curta\`; para trabalho transversal \`[TECH_LEAD][INTEGRATION] ...\`. A Issue deve conter:
- \`ID\`, \`OWNER_ROLE\`, \`SESSION_KEY\` (quando assumida), \`STATUS\`, \`PRIORITY\`, \`SCOPE\`, \`INPUTS\`, \`OUTPUTS\`, \`DEPENDS_ON\`, \`AFFECTED_FILES\`, \`ACCEPTANCE\`, \`TEST_PLAN\`, \`QA_EVIDENCE\` e \`HANDOFF_TO\`.
- Estados válidos: \`BACKLOG → READY → IN_PROGRESS → REVIEW → DONE\`; \`BLOCKED\` quando faltar entrada/acesso/decisão; reabertura diante de regressão.
- **Assumir:** comentar \`CLAIM ROLE=<role> SESSION=<key> BASE=<commit> WORK=<issue>\`; outros chats não editam os mesmos caminhos simultaneamente. Se já há claim ativo, negociar no tópico.
- **Concluir:** comentar \`RESULT PASS|FAIL|UNVERIFIED\`, commits/PR, verificações executadas, desvios, riscos e próximo papel. Fechar Issue somente quando aceite demonstrado.

**Não gerar novas tarefas silenciosamente:** defeitos necessários ao escopo entram na Issue; melhorias e novas funcionalidades vão para backlog e precisam de priorização.

## 6. Protocolo de troca de mensagens (GitHub Issue comments)

Use comentários da **mesma Issue** para conversas sobre a tarefa. Mensagens de outra tarefa devem apontar para a Issue de origem. Formato:

\`\`\`text
[FMU-MSG/v1]
FROM: DEV_ENGINE | BACKEND | FRONTEND | UX_UI | DATABASE | QA_RELEASE | DEVOPS | TECH_LEAD
TO: ROLE_DESTINO
TYPE: QUESTION | HANDOFF | BLOCKER | DECISION_REQUEST | STATUS | MEETING
ISSUE: #n
BASE: <commit ou n/a>
CONTEXT: <fatos verificáveis>
ACTION_REQUIRED: <pedido objetivo>
ARTIFACTS: <links para commits/PRs/arquivos>
EVIDENCE: <testes + PASS/FAIL/UNVERIFIED>
\`\`\`

**Handoff obrigatório:** o emissor comenta com \`TYPE: HANDOFF\`, indica contrato, versão, arquivo, teste, bloqueios e próxima ação. O destinatário confirma lendo o comentário e responde \`ACK\` em nova interação; **um comentário não acorda o outro chat**.

Para divergências de arquitetura ou conflito de edição, abrir \`[DECISION]\` e solicitar \`TECH_LEAD\`; decisões de escopo, gasto, dados ou publicação aguardam usuário.

## 7. Reuniões e decisões

- “Reunião” padrão = **assíncrona**: Issue \`[MEETING] Assunto / data\` com pauta, roles convidados, perguntas, decisões, responsáveis e prazos. Cada chat contribui **quando acionado e conectado**; não há reunião em tempo real automática.
- Ata ao final na própria Issue: \`DECISION\`, \`RATIONALE\`, \`ACTION_ITEMS\`, \`OWNER_ROLE\`, \`DEPENDENCIES\`, \`STATUS\`; tarefas aprovadas viram Issues separadas, com links recíprocos.
- Conflito não resolvido = \`BLOCKED\`, não decisão presumida. Uma reunião síncrona real requer ferramenta de calendário/comunicação configurada separadamente.

## 8. Branches, PR, testes e aceitação

- Branch: \`feat/<issue>-<slug>\`, \`fix/<issue>-<slug>\`, \`docs/<issue>-<slug>\`, \`test/<issue>-<slug>\`. Nunca \`force push\` em \`main\`; não reescrever história recuperada M29/M30.
- PR referencia \`Closes #n\` ou \`Refs #n\`, lista contratos/consumidores, teste local, regressão relevante, QA visual **quando houver interface**, integridade e risco restante.
- \`TECH_LEAD\` solicita revisão do papel consumidor; \`QA_RELEASE\` valida evidências, não apenas “build verde”. Usuário decide mudanças sensíveis; merge só após critérios definidos e permissões apropriadas.
- Mínimos: zero BLOCKER/CRITICAL abertos para o escopo aprovado, nenhum MAJOR sem aceite explícito, rollback/migração quando afetado, integridade de save, referências preservadas, nenhuma credencial/dado privado publicado.
- Não confundir “port nominal”, teste unitário, demo visual ou save sintético com paridade integral e jogabilidade real.

## 9. Segurança e coordenação inter-repositório

- GitHub \`FMU\` é **público**: não enviar tokens, secrets, dumps, backups, dados pessoais de usuários, conteúdo privado do \`FMU_Database\` ou material sem licença.
- Issue pública pode conter **resumo sanitizado** de dependência do DB; detalhes sensíveis ficam em Issues privadas do DB.
- Citar licença/proveniência ao importar atletas, marcas e escudos; respeitar GPL-3.0 da base derivada e permissões de dados de terceiros.
- Comunicação compartilhada entre duas sessões da mesma conta GitHub **não prova** identidade de chats. \`SESSION_KEY\` é identificação operacional declarada, não autenticação.

## 10. Critério de sucesso e teste de integração do processo

1. \`FMU_TEAM.md\` e \`AGENTS.md\` disponíveis em \`main\`; leitura de volta confirma conteúdo.
2. GitHub Issues aceitam registro de papel, tarefa e ata; um comentário de handoff pode ser lido depois.
3. Um segundo chat, **quando aberto pelo usuário**, lê as Issues atualizadas e responde com \`ACK\`.
4. Um PR de cada área pode ser ligado à Issue e validado antes do merge.

**Estado de implantação:** os itens 1–2 devem ser verificados pelas operações GitHub da implantação. O item 3 depende de abrir outro chat; o item 4 depende de código/PR real. Nenhum item não observado deve ser declarado PASS.
