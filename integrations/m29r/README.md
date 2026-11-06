# FMU M29R — Integração transacional isolada (não é o jogo completo)

Este kit TypeScript foi desenvolvido a partir de `brasfoot-next-main.zip`, o código Rust original fornecido. Resolve de forma reproduzível uma parte dos bloqueios de avanço de carreira do FMU: calendário, resultados externos, recuperação física, salários/juros, registros de confrontos, RNG Java idêntico ao JDK, rollback da transação e checkpoints íntegros.

**Estado:** incremental e testado, mas **NÃO integrado ao ZIP M28/M29**. Os históricos ZIPs M28/M29 constam na Biblioteca do projeto, porém não puderam ser materializados no ambiente atual. Não foi possível executar a base M28/M29 nesta sessão nem verificar os 569/612 testes históricos. Não reivindicamos conversão integral dos 20 arquivos Rust restantes, nem alteração do percentual nominal de 91,34%.

## Instalação e execução

Exige Node.js 22+, TypeScript (`tsc`). A suíte de testes usa apenas Node.js built-in (sem dependências npm runtime). O teste diferencial do RNG requer JDK (`java` e `javac`).

```bash
npm test                # TypeScript e testes automatizados
npm run parity:java     # 5124 verificações contra java.util.Random
npm run demo            # duas temporadas fictícias de 90 partidas cada
npm run audit           # verifica as 231 fontes Rust e manifesto
node dist/src/cli.js demo 3
node dist/src/cli.js inspect /caminho/arquivo.fmu-day
```

## Contratos para integrar ao M28/M29

O kit recebe **somente um `WorldDocument` previamente decodificado e validado** pelo carregador `.bfn` do projeto. `normalizeImportedWorld` produz uma cópia tipada, preservando arenas e campos extras. `advanceWorld` recebe o `World`, um `RandomSource` e os callbacks obrigatórios do motor. O resultado contém **um novo World e um novo RNG**; o chamador deve persistir ambos somente após a transação passar.

```ts
import { normalizeImportedWorld, attachWorldToDocument } from './src/bridge';
import { RandomSource } from './src/rng';
import { advanceWorld } from './src/advance';

// decoded = loadBfnWorld(bytes), implementado no FMU M28/M29, não neste kit.
const world = normalizeImportedWorld(decoded);
const rng = new RandomSource(2026n); // semente fixa apenas para teste diferencial
// O objeto `hooks` deve ligar o motor real e todas as rotas requeridas.
const next = advanceWorld(world, rng, hooks);
// Persistir `next.world` e `next.rng` juntos — sem fazer side effects nos hooks.
const updated = attachWorldToDocument(decoded, next.world);
// writeBfnWorldAtomic(path, updated) pertence ao carregador original, não ao kit.
```

**Importante:** o `.fmu-day` produzido por este kit contém um checkpoint Node.js com checksum SHA256 e estado de RNG; é **um formato próprio** e não é um `.bfn` do Brasfoot Next. Só a ferramenta de carregamento do FMU pode produzir o `.bfn` original. Não tente abrir arquivos `.fmu-day` no jogo.

A engine em `demo.ts` é intencionalmente **fictícia e injetada**, usada exclusivamente para teste de continuidade por duas temporadas. Sem os hooks do motor original, a simulação bloqueia ao encontrar um comportamento Rust não portado. O código não inventa resultados para partidas oficiais.

## Port e limitações

| Módulo | Origem | O que efetivamente faz | Não cobre |
|---|---|---|---|
| `rng.ts` | `model/src/rng.rs` | JavaRandom LCG, `nextInt`, `nextLong`, boolean, float, double, shuffle, `RandomSource` snapshot/rollback | `nextGaussian` StrictMath, seeds do relógio OS |
| `world.ts` | `model/src/world.rs`, `player.rs`, `saved.rs` | DTO de arenas, referências, contratos e `recover_between_matches`, salários/juros | Todo esquema e métodos Rust |
| `records.ts` | `simulation/src/matchday.rs`, `league.rs` | confronto direto, gate income, posição e rebaixados, meio de temporada | ratings completos, coach records, gols/cartões |
| `advance.ts` | `simulation/src/game.rs`, `matchday.rs` | dia/round transacional e callbacks fail-closed; snapshot RNG incluído | `Sim::advance` completo, hooks de mercado/temporada oficial |
| `persistence.ts` | contrato de persistência FMU | arquivos `.fmu-day`, SHA, fsync, 3 backups | serialização `.bfn` Rust |
| `bridge.ts` | M27/M28 `WorldDocument` | normalização de BigInt e manutenção das arenas existentes | importação `.s22` Kryo e validação tipada integral |
| `demo.ts` | somente verificação independente | fixture fictício ida/volta e resultados RNG | motor Rust oficial |

**Licença:** GPL-3.0-only. Fontes Rust fornecidas em `upstream-brasfoot-next/` apenas como fonte de consulta e rastreabilidade. Consulte `docs/QA_REPORT.md`, `docs/CONTRACTS.md`, `docs/DEPENDENCY_MATRIX.md`, `docs/TRACEABILITY_MATRIX.md`, `docs/KNOWN_ISSUES.md` e `TASKS.md`.