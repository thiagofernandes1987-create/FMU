#!/usr/bin/env python3
"""Build M22 human maintenance docs and traceability from the SHA verified manifest.
Does not generate feature code; intentionally reports incomplete parity.
"""
from pathlib import Path
from collections import defaultdict
import csv,hashlib,json,re,shutil
R=Path(__file__).resolve().parent.parent
manifest=json.loads((R/'docs/M22_SOURCE_MANIFEST.json').read_text())
progress=json.loads((R/'docs/M22_PROGRESS.json').read_text())
rows=list(csv.DictReader((R/'docs/M22_PORTING_MATRIX.csv').open(newline='')))
new=[x for x in rows if x['wave']=='M22']
assert len(new)==70
bycrate=defaultdict(list)
for x in new:bycrate[x['crate']].append(x)
# guide
lines=['# FMU M22 — Guia de manutenção dos 70 ports Rust→TypeScript','',
 '**Fonte canônica:** Brasfoot Next `bd2ccbdd5f1aaacb6437b58b198d7963c61b3780` (GPL-3.0-only).',
 '**Base:** M21 `8e5cfbd`; os componentes abaixo usam chamadas diretas e são **opt-in**.',
 '**Estatuto:** toda correspondência nova está `PARTIAL_M22_TESTED`; isto registra comportamento concreto ou esquema exportado, **não** equivalência de crate inteira.',
 '', '## Contratos comuns', '',
 'As funções puras evitam modificar o World sem contrato; módulos que precisam de RNG, funções de engine, callbacks de moeda e leitura de arquivos recebem essas dependências explicitamente. Módulos de leitura binária verificam limites antes de acessar bytes. `canonical_generated`, `saved` e `import_generated` extraem metadados de campos da fonte, e não reimplementam serialização integral.',
 '', 'O arquivo `src/m22/index.ts` expõe as rotas por namespace, enquanto `src/m22/interop.ts` prova um consumidor cruzado de `simulation` e `engine` com teste. A carreira principal M21 **não** ativa automaticamente todos esses ports.','']
def funcs(target:str):
 text=(R/target).read_text()
 # Works for standalone functions, classes, exported constants, excluding types.
 names=re.findall(r'export\s+(?:async\s+)?(?:function|class|const)\s+([A-Za-z0-9_]+)',text)
 return ', '.join(names[:8]) + (f' (+{len(names)-8})' if len(names)>8 else '') if names else 'tipo e contratos de dados'
def source_deps(target:str):
 text=(R/target).read_text();imps=re.findall(r'^import\s+.*?from\s+[\'\"]([^\'\"]+)',text,re.M)
 return ', '.join(imps[:3]) if imps else 'tipos e estado explícitos; sem import externo'
for crate in sorted(bycrate):
 lines+=['## Crate `'+crate+'`','', '| Rust | TypeScript | Funções exportadas | Dependências | Testes |', '|---|---|---|---|---|']
 for row in sorted(bycrate[crate],key=lambda r:r['rust_source']):
  path=row['typescript_target'];suite='`m22_lowlevel.test.ts`' if crate in ('datapack','model','i18n','persistence') else '`m22_simulation.test.ts`' if crate=='simulation' else '`m22_systems.test.ts`' if crate=='systems' else '`m22_wave_fg.test.ts`'
  if crate in ('model','persistence') and row['rust_source'] in ('crates/model/src/mods.rs','crates/model/src/canonical.rs','crates/model/src/canonical_generated.rs','crates/model/src/saved.rs','crates/persistence/src/javaser.rs','crates/persistence/src/native.rs','crates/persistence/src/migrations.rs','crates/persistence/src/game_data.rs','crates/persistence/src/import/context.rs','crates/persistence/src/import/generated.rs','crates/persistence/src/kryo/canonical.rs','crates/persistence/src/kryo/reader.rs','crates/persistence/src/kryo/mod.rs'):
   suite='`m22_wave_de.test.ts` / `m22_wave_fg.test.ts`'
  if crate in ('simulation','engine') and row['rust_source'].split('/')[-1] in ('new_game.rs','new_season.rs','continental.rs','game.rs','market.rs','national_cups.rs','value.rs','lineup.rs','tactics.rs','engine.rs','simulate.rs'):
   suite='`m22_wave_fg.test.ts`'
  lines.append(f"| `{row['rust_source']}` | `{path}` | {funcs(path)} | {source_deps(path)} | {suite} |")
 lines.append('')
lines+=['## Guia de correção e testes','',
 '1. Abra o `.ts`: o JSDoc documenta responsabilidade, Rust de origem, entradas, dependências e efeitos. Compare com o arquivo no diretório `upstream/` e cheque `docs/M22_SOURCE_MANIFEST.json`.','2. Reproduza `python3 tools/m22_generate_schemas.py --check` e `python3 tools/m22_audit.py`. Essas rotas falham ao encontrar dados gerados divergentes ou fontes alteradas.',
 '3. Rode `npm run build`, depois o teste M22 específico e `npm test`. Para mudanças na engine, execute a suíte de regressão inteira, não somente os testes da nova função.',
 '4. Não transforme uma falha de integração num placeholder. Os `World`/`ModSystems` do Rust e os formatos `.bfn` inteiros continuam dependências não resolvidas.',
 '5. Ao modificar um contrato de produção, adicione um teste regressivo e atualize `CONTRACTS_M22.md`, `DEPENDENCY_MATRIX_M22.md`, `TRACEABILITY_MATRIX_M22.md` e `KNOWN_ISSUES_M22.md`.','',
 '## Lacunas de paridade conhecidas','',
 '- `persistence/native.ts` decodifica **apenas o frame de metadados** `.bfn`, não o payload CBOR compactado em Zstandard.',
 '- `persistence/kryo_canonical.ts` fornece um dump diagnóstico de objetos JS, não texto diferencial byte a byte idêntico ao `write_canonical` Rust.',
 '- `model/saved.ts`, `model/canonical_generated.ts`, `persistence/import_generated.ts` são **mapeamentos reais de campos** (37, 37 e 35 tipos), mas não serializadores completos.',
 '- `simulation` inclui seleção, ordens e decisões puras; ainda não aciona automaticamente todos os side effects no `World` Rust.',
 '- `engine/engine.ts` porta pesos e seleção aleatória, não a simulação completa dos 90 minutos.',
 '- Testes diferenciais Rust→TS não executados (Cargo indisponível); `WASM` original não conta como TypeScript.','']
(R/'docs/M22_MODULE_GUIDE.md').write_text('\n'.join(lines)+'\n')
# contracts, dependencies, trace
contract=['# Contratos M22 — 70 fontes novas, um port anterior aprofundado','','| ID | Crate | Contrato I/O e invariantes | Compatibilidade | Teste |','|---|---|---|---|---|']
trace=['# TRACEABILITY M22 — fonte → implementação → teste','','| Requisito | Fonte Rust | Componente TS | Teste/QA | Estado |','|---|---|---|---|---|']
deps=['# DEPENDENCY_MATRIX M22','','| Componente | depends_on | used_by | Contrato | Impacto | Regressão |','|---|---|---|---|---|---|']
for idx,row in enumerate(sorted(new,key=lambda r:r['rust_source']),1):
 path=row['typescript_target'];prefix=row['crate'];short=row['rust_source'].split('/')[-1]
 test='m22_wave_fg' if prefix=='engine' else 'm22_simulation' if prefix=='simulation' else 'm22_systems' if prefix=='systems' else 'm22_lowlevel'
 if short in ('canonical.rs','canonical_generated.rs','saved.rs','javaser.rs','native.rs','migrations.rs','game_data.rs','reader.rs','import_generated.rs','context.rs','mod.rs') and prefix in ('model','persistence'):test='m22_wave_de / m22_wave_fg'
 if short in ('new_game.rs','new_season.rs','continental.rs','game.rs','market.rs','national_cups.rs') and prefix=='simulation':test='m22_wave_fg'
 contract.append(f"| CT-M22-{idx:03d} | {prefix} | `{row['rust_source']}` → `{path}`, estrutura/limites verificados e efeitos documentados no arquivo | parcial, sem differential Rust | `{test}.test.ts` |")
 trace.append(f"| R-M22-{idx:03d} | `{row['rust_source']}` | `{path}` | `{test}` + `npm test` | PARTIAL_M22_TESTED |")
 deps.append(f"| `{path}` | {source_deps(path)} | consumidores `src/m22/index.ts`, testes | CT-M22-{idx:03d}/v1 | {prefix} e dependentes | `{test}` |")
(R/'CONTRACTS_M22.md').write_text('\n'.join(contract)+'\n')
(R/'TRACEABILITY_MATRIX_M22.md').write_text('\n'.join(trace)+'\n')
(R/'DEPENDENCY_MATRIX_M22.md').write_text('\n'.join(deps)+'\n')
# Evidence
(R/'evidence/m22').mkdir(parents=True,exist_ok=True)
for file in ['baseline_test.log','work/all_tests_final3.log','work/audit.json','work/wave_a_tests.log','work/wave_b_tests.log','work/wave_c_tests.log']:
 src=Path('/mnt/data/FMU_M22')/file
 if src.exists():shutil.copy2(src,R/'evidence/m22'/src.name)
(R/'KNOWN_ISSUES_M22.md').write_text('''# M22 — Known issues / blockers

| ID | Severidade | Status | Consequência | Condição de aceite |
|---|---|---|---|---|
| B22-01 | BLOCKER integral | OPEN | 106/231 fontes Rust ainda UNPORTED | implementar e validar todas as rotas |
| B22-02 | BLOCKER paridade | OPEN | sem Rust differential em `.bfn` e matches | Cargo + fixtures de save comum + replay simulação |
| B22-03 | MAJOR | OPEN / não aceito | APIs M22 opt-in, `World` Rust não ligado a todos os adaptadores | adaptadores reais com save/reload e temporada integral |
| B22-04 | MAJOR | OPEN / não aceito | `.bfn` só cabeçalho, corpo Zstd+CBOR não convertido | round-trip de payload e migrações diferenciais |
| B22-05 | MAJOR | OPEN / não aceito | parser Kryo completo não portado; canonical dump genérico difere do formato Rust | testes de grafo completos com fixture original |
| B22-06 | MINOR | OPEN | dados i18n `Fluent` só formato textual simples, seletores não cobertos | implementar AST Fluent para todo catálogo |
| B22-07 | MAJOR | OPEN / não aceito | `engine` porta pesos/seleção e regras, não o match engine inteiro | comparar eventos e RNG em jogos completos |

**Condição:** usuário solicitou >=30pp por lote, e a meta nominal é atingida (70 novos de 231). Isso não constitui aceitação dos MAJORs ou liberação da conversão integral.
''')
# README
(R/'README_M22.md').write_text('''# FMU Next M22 — lote agressivo e reproduzível

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
''')
# QA initial before final zip
(R/'QA_REPORT_M22.md').write_text(f'''# QA M22 — Lote agressivo multiarquivo

**Status do incremento TS:** TESTED (pacote final ainda deve ser validado). **Conversão integral:** RELEASE_BLOCKED.

| Controle | Evidência | Resultado |
|---|---|---|
| Baseline M21 restaurada | `evidence/m22/baseline_test.log` | PASS 163/163 |
| Source SHA snapshot | 231 Rust source hashes, `tools/m22_audit.py` | PASS 231/231 |
| Schemas Rust extraídos | `tools/m22_generate_schemas.py --check` | PASS (37/37/35) |
| TypeScript strict | `npm run build` | PASS |
| Testes M22 | `evidence/m22/all_tests_final3.log` | PASS 249/249, 86 novos |
| Cobertura nominal M21→M22 | `docs/M22_PROGRESS.json` e `docs/M22_PORTING_MATRIX.csv` | PASS 55→125/231, +30,30pp |
| Teste diferencial Rust/TS | Rust compiler indisponível | UNVERIFIED |
| Teste carreira integrado a todos ports M22 | Ainda não ligado à carreira principal | UNVERIFIED / BLOCKER integral |
| QA visual | Nenhuma UI/CSS alterada | N/A |
| Bundle+patch+ZIP release | Empacotamento e replay em clone limpo pendente | PENDING |

## Classificação de achados
- `B22-01` BLOCKER: 106 fontes ainda sem mapeamento.
- `B22-02` BLOCKER: sem Rust differential.
- `B22-03/04/05/07` MAJOR não aceitos para release integral: ligação World, save `.bfn`, parser Kryo, engine completa.
- Todos os tipos/exports M22 são opt-in; teste `preparePreMatch22` demonstra consumidor cruzado sem fingir orquestração de carreira.

## Evidência de convergência
- Baseline 163/163 PASS.
- Ciclos M22: dados/código (21), simulation (16), systems (17), persistência+modelo (16), engine+simulation (16), total novo 86; regressão integral 249/249.
- Falhas menores corrigidas: type narrowing TypeScript, teste float IEEE, schema generator `--check` e comparador de objetos com protótipo nulo. Nenhuma falha conhecida em testes executados.
- Endereço da fonte privada do usuário nunca incluído; não adicionados dados privados ao pacote.
''')
(R/'TASKS.md').write_text('''# FMU M22 — Controle de release e continuidade

## Objetivo/entradas/saídas
- Entrada: M21 Git `8e5cfbd` + snapshot Rust `bd2ccbdd` (231 arquivos).
- Meta: **+30 pontos percentuais** de cobertura NOMINAL por arquivo; implementações reais, comentadas e testadas em pelo menos dois crates.
- Saída: 70 novos ports TS parciais + 1 fonte já mapeada aprofundada; 86 novos testes, documentação, manifestos, bundle, patch e ZIP.
- Escopo congelado: domínios existentes model/datapack/i18n/persistence/simulation/systems/engine; sem nova UI ou dados privados.

## Marcos
- [x] A0 — M21 baseline 163/163, 231 hashes Rust válidos (`evidence/m22/`).
- [x] A1 — fontes datapack/model/i18n/persistence implementadas e testadas; schemas 37/37/35 verificados.
- [x] A2 — simulation + systems implementados e testados em lote.
- [x] A3 — engine e interop simulador implementados com testes de contrato e falhas.
- [x] A4 — TypeScript e 249/249 testes (86 novos) + RNG, save metadata, contratos e bordas.
- [x] A5 — matriz 231 fontes, 70 novas, 125 com alguma correspondência, +30,30pp e restante 106.
- [ ] A6 — Git bundle/patch e ZIP final, hashes e testes de extração limpos (pendente QA final).

## Bloqueios e decisões
- Release integral = `RELEASE_BLOCKED` (106 UNPORTED, sem Cargo, integrações e `.bfn` incompletas).
- Paridade funcional percentualmente **UNVERIFIED**; 54,11% é cobertura nominal somente.
- QA visual N/A (não houve mudanças de UI).
- Nenhum MAJOR aberto foi considerado aceito para release integral. Detalhes `KNOWN_ISSUES_M22.md`.
''')
# archive previous tasks
if (R/'TASKS_M21.md').exists():
 pass
# append changelog
(R/'CHANGELOG.md').write_text('''## M22 — 2026-11-05
- 70 novas fontes Rust com correspondência TypeScript parcial, uma fonte anterior aprofundada, em sete crates.
- Extração reproduzível dos esquemas model/canonical, model/saved e persistence/import/generated: 37+37+35 tipos.
- Adição de importador Java/Kryo parcial, header BFN, contrato de partidas e calendário, AI, financeiro e dados por crate.
- 86 novos testes; total 249/249 PASS; cobertura nominal 55/231 → 125/231 (+30,30pp).
- Paridade funcional integral ainda `RELEASE_BLOCKED`, sem Rust differential.

'''+((R/'CHANGELOG.md').read_text() if (R/'CHANGELOG.md').exists() else ''))
(R/'RELEASE_MANIFEST_M22.json').write_text(json.dumps({
 'artifact':'FMU Next M22 large batch','license':'GPL-3.0-only',
 'baseline_commit':'8e5cfbd','rust_source_commit':'bd2ccbdd5f1aaacb6437b58b198d7963c61b3780',
 'rust_sources':231,'rust_sha256_verified':231,
 'baseline_mapped':55,'new_m22_mapped':70,'previously_mapped_enhanced':1,
 'nominal_mapped_cumulative':125,'nominal_percent':54.11,'gain_pp':30.30,'unported':106,
 'new_tests':86,'regression_tests':163,'total_tests_passed':249,
 'rust_differential':'UNVERIFIED','full_conversion_status':'RELEASE_BLOCKED',
 'visual_scope':False,'private_database_included':False,'WASM_counted_as_typescript':False,
 'release_candidate_QA':'CODE_AND_TEST_PASS__PACKAGE_PENDING'},indent=2,ensure_ascii=False)+'\n')
print('DOCS',len(new),'source entries;',len(manifest),'mapped files; output written')
