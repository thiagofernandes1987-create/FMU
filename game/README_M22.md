# FMU Next M22 — lote agressivo e reproduzível

O lote M22 adiciona **70 novas correspondências Rust → TypeScript testadas** e aprofunda uma anterior (`engine/src/events.rs`) na árvore M21.

**Cobertura nominal:** M21 55/231 (23,81%) → M22 125/231 (54,11%), ganho **+30,30 pontos percentuais**. Restam 106 arquivos sem mapeamento. A métrica é por arquivo com **alguma** implementação; não é a porcentagem de equivalência funcional integral.

**Testes:** 249/249 (86 novos e 163 anteriores), sem compilação diferencial Rust. Código em `src/m22/`, API importável por namespace via `src/m22/index.ts`. Fonte Rust oficial em `upstream/brasfoot-next-main/` para auditabilidade. Código derivado sob GPL-3.0-only.

**Instalar pré-requisitos:** Node.js 22+, TypeScript 5.8+ (instalado no ambiente de QA).

```bash
npm run build
npm run test
python3 tools/m22_generate_schemas.py --check
python3 tools/m22_audit.py
```

Os documentos por função e dependências estão em `docs/M22_MODULE_GUIDE.md` e `CONTRACTS_M22.md`, `DEPENDENCY_MATRIX_M22.md`, `TRACEABILITY_MATRIX_M22.md`. O inventário completo é `docs/M22_PORTING_MATRIX.csv` e `docs/M22_PROGRESS.json`.

O bundle Git offline e patch M21→M22 estão em `git/M22_full_history.bundle` e `patches/M21_to_M22.patch`. Para recuperar o projeto sem internet: `git clone git/M22_full_history.bundle project`.

**Importante:** o `.bfn` só tem cabeçalho parcial em TS, a carreira principal não dispara automaticamente todas as rotas e não houve paridade diferencial com Rust. O WASM original, se presente, é componente legado, **não** TS convertido.
