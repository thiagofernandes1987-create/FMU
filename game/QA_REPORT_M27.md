# FMU M27 — QA TÉCNICO

## Baseline e compilação
- Base M26 Git `f437e8b`, 453/453 testes PASS.
- Novo M27: 49 testes de CBOR→World, migrações, arena/contratos, transações/CLI e entrada de crates.
- Suíte completa em desenvolvimento: **502/502 PASS** (ver `evidence/m27/regression.log`).
- Parser Rust schema: 89 estruturas, 956 campos, 18 enums; auditoria de 231 hashes exatos.

## Verificações de interoperabilidade
- `encodeBfnWorld`→`loadBfnWorld`: roundtrip campos unknown/BigInt/Map/NaN/±∞/−0, 9 arenas e metadados Rust: PASS em fixture estrutural sintético.
- Migração v1→v2→v3 e `relinkWorldReferences`: PASS em casos sintéticos; salva novo envelope v3, origem não modificada.
- Gravação atômica+bak1..bak3, falha antes do commit, copy-on-write: PASS.
- Executável Rust Linux versão 0.1.0 usado com `BF_OPEN` e arquivo sintético: **processo exit 101 com panic `crates/model/src/world.rs:42:1: index out of bounds len 0, index 0`**; assim, decodificação progrediu até o uso de arenas, mas **não prova funcionalidade jogável**. Registrado em `evidence/m27/rust_app_open.log`.
- **Rust diferencial real:** UNVERIFIED (fixtures reais `.s22`/golden indisponíveis nesta árvore, `cargo` não instalado).
- **QA visual:** N/A — nenhuma tela do FMU Web alterada no M27.

## Cobertura e status
- M26 205/231 = 88,74%; M27 211/231 = **91,34%** (+2,60 p.p.) cobertura NOMINAL.
- 26 últimas fontes inventariadas, seis com correspondência nova, **20 ainda UNPORTED**; paridade completa não verificada.
- Protocolo: solicitação de 100% de conversão real **RELEASE_BLOCKED**. O incremento limitado pode ser entregue como código investigativo testado.

## Package QA
- Clone independente do bundle: **502/502 PASS** (`/mnt/data/FMU_M27/clone_tests.log`).
- Patch M26→M27 aplicado sobre Git M26 limpo: **mesma árvore Git**, **502/502 PASS** (`patch_tests.log`).
- ZIP de pré-liberação: extraído em diretório novo, **502/502 PASS** (`zip_prelim_tests.log`), auditoria `m27:audit` e **972 hashes por arquivo PASS**.
- Pacote definitivo: revalidar após fechamento do `TASKS_M27.md` e registrar em QA final externo.
- Observar que nenhuma aplicação ou UI foi alterada neste lote; QA visual fora de escopo.
