# FMU
JOGO MANAGER FUTEBOL

## Estado da sincronização — 2026-11-06

Este repositório preserva o histórico inicial e recebe um primeiro módulo versionado de desenvolvimento.

- [Integração M29R — código TypeScript](integrations/m29r/README.md): avanço transacional da carreira, RNG compatível com Java, rollback, checkpoints e testes.
- [Contratos técnicos](integrations/m29r/docs/CONTRACTS.md) e [relatório de QA](integrations/m29r/docs/QA_REPORT.md).
- A integração M29R é um **kit independente**: não foi incorporada à base integral M28/M29 e não é o jogo jogável em produção.
- Validação local anterior: 41 testes TypeScript; 5.124 verificações RNG comparadas ao JDK; duas temporadas de sandbox.
- A execução atual do GitHub Actions será a validação remota; somente após CI aprovado deve ser considerada verificada nesse ambiente.

Para reproduzir:

```bash
cd integrations/m29r
npm install --global typescript@5.9.3
npm test
npm run demo
npm run parity:java
```

**Dados dos jogadores:** mantidos separadamente em repositório privado de modelo/ingestão. Nenhum dump de banco, token, credencial ou dado privado deve ser commitado aqui.

**Origem e licença:** código derivado de Brasfoot Next (GPL-3.0-only), com licença preservada na raiz. O manifesto SHA-256 do Rust original está em `integrations/m29r/docs/RUST_SOURCE_AUDIT.json`; para reproduzir a auditoria `npm run audit` é necessário obter o snapshot Rust de origem, não incluído nesta sincronização.

**Próximas integrações bloqueadas:** importação de save `.bfn` para World original, motor Rust completo, transações de temporadas reais e histórico M28/M29 que não estava acessível como arquivos editáveis nesta sessão.
