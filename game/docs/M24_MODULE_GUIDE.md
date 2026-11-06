# FMU M24 — Interface real, carreira sandbox e exemplos de persistência

## Escopo e origem

Fonte Rust verificada: Brasfoot Next `bd2ccbdd` (231/231 arquivos com SHA-256).
Base TypeScript: M23 `9873184`. **M24 não é um port 1:1 da UI egui.** É uma aplicação web real e responsiva conectada aos seletores M23, mas a carreira é um sandbox fictício.

## Arquivos e funções públicas

| Origem Rust | TypeScript / Browser | Entradas / Saídas | Dependências | Efeitos, invariantes e testes |
|---|---|---|---|---|
| `app/src/main.rs` | `src/m24/web/browser.ts`, `public/fmu-m24/index.html` | Boot, rota, menus, ações → DOM interativo | Browser DOM, storage, career_demo | Navega oito telas, executa ações, erro/feedback, browser QA |
| `app/src/screens/mod.rs` | `browser.ts`, CSS | Estado de navegação → oito telas | seletores M23 | Shell web parcial; **não substitui todas as telas egui** |
| `app/examples/render_screens.rs` | `tools/m24_browser_qa.py` | HTML/CSS/JS → screenshots Chromium | Playwright + Chromium | Render desktop/tablet/mobile; é análogo, não screenshot nativo Rust |
| `app/tests/interaction.rs` | `tools/m24_browser_qa.py` | Cliques e teclas → navegação, negociação, upload/download | Chromium real | Menu Esc, catálogo, fluxo de rodadas/táticas/mercado, save inválido |
| `app/tests/catalog.rs` | `tools/m24_browser_qa.py` | 8 IDs de rota → headings visíveis | DOM renderizador M24 | Todos os oito destinos resolvem; não cobre todas as telas Rust |
| `app/examples/advance_career.rs` | `tools/m24_advance_career.js` | nº temporadas → JSON com campeão e partidas | career_demo + Node.js | Duas temporadas × 90 partidas; **não usa `.s22`** |
| `persistence/examples/graph_stats.rs` | `src/m24/persistence/graph_stats.ts` | KryoGraph22 já decodificado → contagens de referências por classe/campo | `src/m22/persistence/kryo_graph.ts` | Leitura pura; não decodifica bytes `.s22` |
| `persistence/examples/bfn_schema_diff.rs` | `src/m24/persistence/schema_diff.ts` | Duas árvores decodificadas → diferenças de campos/classes | JSON tree | Recursão `path[]`, classes `class`; não lê Zstd/CBOR |
| `persistence/examples/open_bfn.rs` | `src/m24/persistence/bfn_inspect.ts` | Bytes `.bfn` → metadados do header | `src/m22/persistence/native.ts` | Retorna `worldLoaded:false`; **não lê o payload do mundo** |

### Núcleo de carreira (`src/m24/web/career_demo.ts`)

| Operação | Contrato | Efeito / testes |
|---|---|---|
| `createDemoCareer` | coach 2–35 caracteres, 10 clubes fictícios, 22 jogadores/cada, seed | produz estado serializável; semente reproduzível |
| `createFixtures` | N clubes par, N >= 4 | N×(N−1) jogos com ida/volta, cada clube 1 jogo/rodada |
| `standings` | partidas jogadas + tabela M23 | 3/1/0, saldo, critérios de desempate, promotion/relegation M23 |
| `advanceDemoRound` | partida válida, 11 titulares e métricas corretas | avança cinco jogos, eventos e contas num clone; nunca modifica a entrada |
| `nextDemoSeason` | exige conclusão das 18 rodadas | envelhece jogadores, dá aporte fictício de patrocínio e agenda nova temporada |
| `setDemoFormation` | uma entre 4-3-3, 4-4-2, 3-5-2 | atualiza tática que afeta força simplificada |
| `swapDemoStarter` | titular existente + reserva do mesmo elenco | troca 1 por 1 mantendo 11 titulares |
| `hireDemoFreeAgent` | fundo suficiente + elenco abaixo 30 | debita preço, registra transferência, move atleta livre para o elenco |
| `sortedPlayers`, `recentDemoDeals` | estado validado | reutilizam `sortedHomeSquad` e `seasonDeals` M23 |
| `serializeDemoCareer`, `restoreDemoCareer` | esquema `fmu-demo-v1`, JSON <= 2 MB | valida, serializa e isola cópia; recusa `.bfn` |

**Notas de manutenção:** `src/m24/web/browser.ts` não deve construir DOM com entradas não escapadas; `esc()` protege HTML de nomes do save. `localStorage` é opcional e o download JSON só ocorre por ação do usuário. Renderer `egui` original ainda não foi convertido. Uso de CSS/media queries responsivo, incluindo correção de 3 px de overflow mobile.

### Empacotamento sem gerenciador externo

`tools/m24_bundle.js` lê módulos CommonJS compilados, segue `require` relativos e emite IIFE em `public/fmu-m24/app.bundle.js`. Não permite imports externos, `eval` ou acesso fora de `dist`. **A integridade do bundle é comprovada pelo QA Chromium real.**

```bash
npm run m24:bundle
npm test
npm run m24:two-seasons
python3 tools/m24_browser_qa.py
python3 -m http.server 8000 --directory public
# Abra /fmu-m24/ no navegador
```

**Dependências de QA visual:** Chromium e Python Playwright, instalados neste ambiente. O browser não conseguiu navegar via localhost/file por restrição do ambiente; o script injeta os MESMOS bytes de HTML, CSS e bundle no Chromium e testa a interface real. Visual definido para três viewports, não comparação com screenshots egui antigos.

### Compatibilidade

- `egui` native renderer: **não portado**.
- `World` Rust, simulação de competição/transferências e save nativo BFN: **não portados nesta interface**.
- Sandbox M24: jogável na web, 10 clubes fictícios, duas temporadas testadas, JSON próprio.
- GPL-3.0-only; não distribuir bancos privados nem fontes.
