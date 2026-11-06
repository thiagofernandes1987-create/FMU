# FMU Next M23 — lógica das telas Rust para TypeScript

**Cobertura nominal M22 → M23: 125/231 (54,11%) → 185/231 (80,09%), +25,97 pontos percentuais.** Existem 46 arquivos Rust sem qualquer correspondência TypeScript; os 185 mapeamentos incluem adaptações parciais, e o `app` continua **sem renderizador `egui`/web**. Não afirmar que 80% das funcionalidades foram concluídas.

## Implementação

`src/m23/app/`: 60 módulos de lógica de telas, estados, filtro, classificação, escalação, notícias, contratos, ofertas, premiações, clubes, técnicos, arquivos, pacotes e UI tokens. A origem das funções e módulos é comentada no próprio TypeScript. O inventário por arquivo/função está em `docs/M23_APP_FUNCTIONS.csv`, o guia em `docs/M23_MODULE_GUIDE.md` e o andamento auditado em `docs/M23_PROGRESS.json`.

## Executar

```bash
node --version                     # testado com Node 22
npm run build
npm run m23:tests                 # 67 novos casos
npm test                         # 316 casos totais
npm run m23:audit                 # SHA Rust + 185 mappings
```

Scripts dependem de `tsc` e Node; Python 3 para auditoria. O projeto contém WASM original como material de referência, que não é código TypeScript convertido. Nenhuma base privada foi incluída.

## Recuperação Git e patch

Após extrair o ZIP, `git clone git/M23_full_history.bundle pasta_m23` restaura a árvore Git. Para reproduzir a diferença M22 → M23, clonar o bundle M22 e aplicar `git apply patches/M22_to_M23.patch`, depois `git add -A` e comparar `git write-tree`.

**Legal:** a base derivada mantém `GPL-3.0-only`; ao redistribuir observar exigências da licença e terceiros.
