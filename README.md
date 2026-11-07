# FMU — Football Manager Universe

> **Equipe multichat:** veja [FMU_TEAM.md](FMU_TEAM.md) para papéis e contratos, [cadastro de chats](https://github.com/thiagofernandes1987-create/FMU/issues/4) e [reunião de kickoff](https://github.com/thiagofernandes1987-create/FMU/issues/5). A comunicação via GitHub é **assíncrona** e depende de cada chat consultar os tópicos.

Repositório oficial de desenvolvimento do FMU. A licença GPL-3.0 do projeto original foi preservada.

## Código restaurado em 6 de novembro de 2026

- [**Código principal — M29 + M30**](game/RECOVERY_README.md): World CBOR/Zstd, migrações, simulador parcial, dados e finanças, transações, RNG Java e journal recuperável.
- [**M29R anterior**](integrations/m29r/README.md): permanece acessível como módulo independente e histórico de integração.
- [**Demo de navegador**](game/public/fmu-m24/index.html): interface demonstrativa, não simulador integral. O WASM binário histórico não foi copiado para o Git; permanece preservado nos ZIPs originais arquivados na Biblioteca FMU.
- [**Relatório de integridade**](game/QA_RECOVERY_M29_M30.md) e [manifesto](docs/RECOVERY_M29_M30_SOURCES.json).

Para desenvolver:

```bash
cd game
npm install --global typescript@5.9.3
npm test
npm run m27:audit
npm run serve
```

**Testes da recuperação:** M28 569/569, M29 612/612, M30 46/46, versão consolidada 663/663 (inclui cinco testes M29↔M30). O motor Rust completo e a paridade jogável ainda NÃO estão concluídos.

**Dados**: `FMU_Database` é privado e contém o esquema inicial e rotinas de importação segura. Nenhum jogador real foi incluído neste repositório público, e nenhum dado licenciado de terceiros foi importado.

**Preservação**: commits antigos e branches de backup foram mantidos, sem sobrescrever código anterior.
