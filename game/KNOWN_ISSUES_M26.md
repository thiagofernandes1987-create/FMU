# Known issues M26

| ID | Severity | Status | Justificativa |
|---|---|---|---|
| F26-01 | BLOCKER | OPEN | `.bfn` agora descompacta e desserializa CBOR, mas não converte o payload num `World` Rust jogável. |
| F26-02 | BLOCKER | OPEN | Não há diferencial Rust↔TS nem fixtures `.s22` binários importados. |
| F26-03 | MAJOR | OPEN | Save `format_version` 1/2 exige migrações semânticas antes da conversão. O decoder sinaliza `migrationRequired=true`. |
| F26-04 | MAJOR | OPEN | Nove exemplos Rust agora têm equivalentes de diagnóstico, porém muitos usam carreiras fictícias. Não marcar como funcionalidade original convertida. |
| F26-05 | MINOR | OPEN | O CBOR aceita tipos simples usados pela rota; tags e mapas complexos ainda requerem interpretação específica das estruturas Rust. |
| F26-06 | MINOR | OPEN | CLI suporta Node.js 22.16+ com `zstd` embutido, não roda em navegadores. |

**Estado do jogo integral:** `RELEASE_BLOCKED`. Nenhum MAJOR foi automaticamente aceito como defeito da versão de produção.
