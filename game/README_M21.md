# FMU Next M21 — lote ampliado TypeScript

A base M20 foi preservada. Foram implementadas funções de **28 novos arquivos Rust** em cinco crates, com documentação de origem, dependências e testes no próprio código. Consultar `docs/M21_SOURCES.md` para as 28 correspondências exatas. Os projetos originais Rust e WebAssembly seguem no pacote como referências e **não contam como port TypeScript**.

## Execução local

```bash
node --version                    # testado com Node 22
npm run build                     # TypeScript estrito
npm test                          # 163 testes M19–M21
npm run m21:verify                # 231 hashes + tabelas de dados + testes
npm run m20:verify                # integridade dos contratos anteriores
```

## Componentes

- `src/ported/model/`: IDs de arena, JavaHashMap, `StrictMath.log`, ordenação Java, marcas, países, rótulos e estruturas de mundo.
- `src/ported/engine/`: ganchos e preços/público do estádio.
- `src/ported/simulation/`: finanças, contratos, mensagens, estádio e registros de clubes.
- `src/ported/systems/`: 13 ticks, táticas e recomendações do diretor.
- `src/ported/datapack/`: códigos, troféus, níveis de severidade, arquivos em camadas e opções do manifesto.

## Números e limites

M20 autônomo 27/231 (11,69%), M21 +28/231 (+12,12 pp), M20+M21 55/231 (23,81%). **Essa não é a conversão total histórica do FMU**: a árvore M18 (74/231 no último relatório) ainda não está disponível para reconciliação e o percentual funcional de paridade permanece indeterminável. A meta +30 pp não foi atingida neste lote.

Use `docs/M21_PROGRESS.json` e `docs/M21_PORTING_MATRIX.csv` para rastrear a classificação de cada port. O pacote contém um Git bundle (`git/M21_full_history.bundle`) e o patch incremental (`patches/M20_to_M21.patch`). A licença de origem é GPL-3.0-only; o pacote não inclui bases de dados privadas, segredos ou arquivos de fontes tipográficas.
