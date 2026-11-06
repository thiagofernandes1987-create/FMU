# FMU M26 — Inspeção `.bfn` com CBOR/Zstandard e diagnóstico de carreira

O M26 parte integralmente do ZIP/Git bundle M25 e adiciona leitura do **envelope real `.bfn`** em Node.js, inclusive decodificação Zstandard e CBOR, com limite de tamanho, detecção de versões legadas e preservação de inteiros 64-bit. Também inclui funções e CLI read-only para analisar partidas, competições, jogadores e saves demo.

## Comandos

```bash
npm run build
npm run m26:inspect -- bfn tests/fixtures/m26_sample_data_only.bfn
npm run m26:inspect -- demo caminho/save-fmu-demo-v1.json
npm run m26:inspect -- demo-smoke 36 2026
npm run m26:tests
npm test
python3 tools/m26_audit.py --check
```

`m26_sample_data_only.bfn` é um fixture de formato, **não** um save `World` válido para abrir no Brasfoot Next. A CLI usa um resumo não modificável; o `.bfn` do usuário fica intocado. O arquivo também não contém dados privados.

## QA e progresso

- M25: 411/411 testes; **196/231 = 84,85%** de correspondência nominal.
- M26: **453/453 testes**; **205/231 = 88,74%**; **+3,90 pontos percentuais**, 26 arquivos sem correspondência.
- Das 11 fontes trabalhadas, 9 são novos **adaptadores de diagnóstico**, e 2 são **aprofundamentos** de correspondências já existentes (`persistence/src/native.rs` e `persistence/examples/open_bfn.rs`).
- O percentual funcional Rust↔TS permanece **não verificado**. A conversão completa não está concluída.

Veja `docs/M26_MODULE_GUIDE.md`, `CONTRACTS_M26.md`, `DEPENDENCY_MATRIX_M26.md`, `TRACEABILITY_MATRIX_M26.md`, `KNOWN_ISSUES_M26.md` e `QA_REPORT_M26.md`.

**Licença:** GPL-3.0-only. Projeto de código de domínio, não artefato para importação `.s22` completa ou produção do jogo.
