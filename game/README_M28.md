# FMU Next M28 — World real e persistência segura

**M28 aprofunda quatro fontes Rust previamente mapeadas**, aumentando a integração real da carreira sem inflar o indicador nominal. Usa `.bfn` original para validar o `World`, reconstruir referências transitórias, inspecionar o calendário, mover atletas sob controles explícitos e regravar com backups. **Não executa partidas reais**: a carreira web do M24 permanece um sandbox fictício.

## Rodar

Requer Node.js 22 (inclui Zstandard nativo) e `tsc`.

```bash
npm run build
npm run m28:tests
npm test
npm run m28:world -- audit /CAMINHO/save.bfn
npm run m28:world -- inspect-day /CAMINHO/save.bfn
npm run m28:world -- prepare-save /CAMINHO/save.bfn /CAMINHO/outro-save.bfn
npm run m24:two-seasons
```

A CLI não sobrescreve o arquivo original. Não inclua dados privados em relatórios ou no pacote ZIP.

## Proveniência, licenciamento e QA

Brasfoot Next Rust commit `bd2ccbdd` (GPL-3.0-only), TypeScript M27 base `97523f9`. Arquivos `.bfn` do jogo original **não foram disponibilizados para teste**; os testes criam um World sintético dentro do esquema Rust. Consulte `docs/M28_MODULE_GUIDE.md` para funções, entradas/saídas e efeitos, `CONTRACTS_M28.md`, `KNOWN_ISSUES_M28.md`, `QA_REPORT_M28.md` e `docs/M28_PORTING_MATRIX.csv`.

**Cobertura nominal inalterada:** 211/231 = 91,34%; `UNPORTED`: 20, paridade Rust completa não aferida. O percentual não mede conclusão funcional.
