## FMU M31 — Leitor Kryo 4 para saves `.s22`

[README M31](README_M31.md) · [Guia e contrato](docs/M31_MODULE_GUIDE.md) · [Matriz](docs/M31_PORTING_MATRIX.csv). Ainda exige o esquema de classes do jogo para ler saves reais; **não** libera paridade funcional Rust.

## M28 — World Real

Veja [README_M28.md](README_M28.md) e [guia técnico](docs/M28_MODULE_GUIDE.md).

# FMU M26 — [instruções](README_M26.md) e [guia funcional](docs/M26_MODULE_GUIDE.md)

## M25 — Rodada ao vivo e Replay demonstrativo

Consulte [README_M25.md](README_M25.md) e [guia funcional](docs/M25_MODULE_GUIDE.md). Interface web M25 tem nove telas. Não é engine Rust completa.

## FMU M23 — 60 regras `app` portadas parcialmente

[README do M23](README_M23.md) · [Guia por função](docs/M23_MODULE_GUIDE.md) · [Matriz Rust](docs/M23_PORTING_MATRIX.csv).

**185/231 = 80,09% de correspondência por arquivo, NÃO de funcionalidades completas.**

# FMU M20 — entrega incremental acelerada

Veja [README_M20.md](README_M20.md) para comandos, componentes, percentuais e limitações.

# FMU M19 — Aceleração responsável da conversão Rust → TypeScript

O pacote possui dois caminhos **independentes**:

1. **Fonte convertida:** 11 arquivos de origem dos crates `simulation` e `systems` foram mapeados em TypeScript, com implementações reais de domínio, tipos, contratos e testes. Eles estão em `src/` e `dist/`; não foram integrados ao repositório M18 ausente desta sessão.
2. **Motor original executável:** a versão web oficial 0.1.0 é mantida intacta, com JavaScript e WebAssembly oficiais em `public/brasfoot-next-0.1.0-web`. Ela permite trabalhar sobre um jogo já compilado enquanto o port TypeScript progride, **mas seu código Rust interno não se torna TypeScript**.

## Executar os módulos convertidos

```bash
npm run build
npm test                 # 57 regressões Node/TypeScript
npm run audit            # 231 fontes e 88 alvos simulation+systems
node tools/batch-plan.mjs
node tools/verify-runtime.mjs
```

Node.js >= 22 e `tsc` 5.x são necessários para os testes; não precisa instalar dependências do NPM.

## Executar o jogo web original

```bash
npm run serve
# acessar http://localhost:8000 no navegador de sua máquina
```

Use Chrome/Edge/Firefox moderno com WebAssembly. O servidor HTTP é necessário para servir arquivos WASM e módulos ES. **A sessão atual não conseguiu realizar QA visual** porque Chromium está bloqueado pelo administrador; o runtime passou somente por teste de compilação estática em Node. Não substituir por afirmação de que foi jogado.

## Situação da meta +25 pontos percentuais

O relatório M18 informou **74/231 = 32,03%** de arquivos Rust com alguma correspondência. Para alcançar pelo menos **57,03%**, são necessários pelo menos **132/231 = 57,14%**, ou **58 fontes adicionais** não cobertas anteriormente. O M19 registra **11 arquivos em módulos standalone**, sem garantir que eram todos `UNPORTED` no M18. O pacote M18 não está montado; portanto **não existe percentual acumulado M19 verificável**. Os 11 novos arquivos são um incremento testado, não 58.

O caminho para acelerar está descrito em `docs/M19_BATCH88_PLAN.csv`: lotes por tamanho/risco, depuração por contratos, regressões locais e reconciliação com `docs/PORTING_MATRIX.csv` do M18 antes de contar cobertura.

## Licença e origem

Fontes Rust e binários web originais do Brasfoot Next fornecidos pelo usuário. Código derivado distribuído sob **GPL-3.0-only**. A versão web oficial é preservada sem alterações. Nenhum banco privado FMU 2026, arquivo tipográfico ou credencial está incluído.

## M21

Novo lote multi-crate (+28 fontes mapeadas) com 163 testes. Leia [README_M21.md](README_M21.md), [inventário por fonte](docs/M21_SOURCES.md), [matriz](docs/M21_PORTING_MATRIX.csv), [percentuais](docs/M21_PROGRESS.json) e [QA](QA_REPORT_M21.md). Cobertura M20+M21 **23,81% nominal independente**, não equivale à paridade funcional nem à série histórica M18.

## M24 — Interface web funcional (sandbox)

**Entrada:** `public/fmu-m24/index.html` — veja [`README_M24.md`](README_M24.md).
Agora há oito telas renderizadas em Chromium, carreira fictícia com táticas, escalação, mercado e JSON. **Não é ainda o jogo Rust completo.**

**Progresso nominal:** M23 80,09% → M24 83,98%, 37 fontes restantes sem correspondência. Indicador de arquivos, não paridade do produto.

## M27 — World Rust a partir de `.bfn` (conversão parcial)

Novo caminho para reconstruir o estado estruturado original com CBOR+Zstd, migrações v1/v2/v3, 9 arenas, 89 estruturas, validação de referências e escrita atômica com 3 backups.

```bash
npm run m27:tests
npm run m27:audit
node dist/src/m27/persistence/world_cli.js inspect carreira.bfn
node dist/src/m27/persistence/world_cli.js upgrade carreira-v2.bfn carreira-v3.bfn
```

Arquivos gerados: `src/m27/persistence/world_schema.generated.json`, `docs/M27_LAST_26_GAP_MATRIX.csv`, `docs/M27_MODULE_GUIDE.md` e `QA_REPORT_M27.md`.

**Importante:** 211/231 (91,34%) é mapeamento nominal de arquivos, não taxa de funcionalidades completas. Das 26 fontes não portadas do M26, seis ganharam ports/adaptadores reais e vinte permanecem sem port. A migração do formato do save está validada estruturalmente, mas a carreira Rust jogável segue bloqueada por dependências de motor e fixtures. O binário Linux original falhou ao abrir World sintético vazio (não por erro detectado de frame .bfn).

## M29 — Avanço transacional de rodada sobre `.bfn`

Leia [README_M29.md](README_M29.md) e [guia de módulos](docs/M29_MODULE_GUIDE.md). Testes `npm run m29:tests` e análise somente leitura `npm run m29:inspect -- inspect /CAMINHO/CARREIRA.bfn`. A interface gráfica não foi alterada e o jogo real continua dependendo dos hooks de simulação, pós-jogo e nova temporada que não foram integralmente portados.
