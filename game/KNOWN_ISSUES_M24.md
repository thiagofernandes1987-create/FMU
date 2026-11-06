# M24 — Achados, riscos e restrições

- **BLOCKER (conversão Rust integral):** 37 arquivos do inventário permanecem UNPORTED, e os 194 com correspondência incluem muitos ports parciais e testes/adaptadores.
- **BLOCKER (paridade funcional):** não há equivalência comprovada entre o motor Rust e a simulação demonstrativa M24; aplicação egui original e interface nativa não foram reconstruídas integralmente.
- **MAJOR (produção):** suporte `.bfn` limitado a metadados, sem payload Zstd/CBOR → `World`; saves M24 são JSON com schema exclusivo.
- **MAJOR (produto):** cálculo de partidas, patrocínio, contratações e progressão do M24 são modelos fictícios demonstrativos, não a economia final do FMU.
- **MINOR (ambiente QA):** navegação `http://localhost`/`file://` bloqueada por policy da ferramenta de browser; testes injetaram bytes reais de HTML/CSS/JS no Chromium. O HTTP server não foi usado para homologação de rota.
- **FIXED (visual):** header do mobile ultrapassava largura em 3 px; ajustado padding e gap CSS, regressão no QA.
- **FIXED (UX):** tecla Esc no drawer mobile não funcionava sem foco no root. Handler movido para `document` e testado.
- **FIXED (domínio):** fitness podia passar de 100%, patrocínio anual necessário para longa duração; testes de 8 temporadas.
- **FIXED (input):** save inválido agora reporta erro sem substituir o estado válido.

Nenhum MAJOR é autoaceito para lançamento integral do Brasfoot Next. Incremento sandbox M24 pode ser distribuído como demonstração claramente rotulada.
