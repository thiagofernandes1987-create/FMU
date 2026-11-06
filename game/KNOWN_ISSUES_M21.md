# Pendências M21

- F21-01 **BLOCKER**: objetivo de +30 pp de cobertura por lote não atingido: +28 fontes, +12,12 pp na árvore M20/M21.
- F21-02 **BLOCKER**: 176 fontes Rust `UNPORTED` na árvore M20/M21.
- F21-03 **BLOCKER**: árvore histórica M18 não recuperada, impossível reconciliar percentuais totais sem checar sobreposição.
- F21-04 **MAJOR**, não aceito: DTOs novos ainda opt-in, não carregam diretamente `World` do BFN e não rodam via UI.
- F21-05 **MAJOR**, não aceito: `datapack/tree` usa arquivos ZIP previamente extraídos (descompressor externo), e `datapack/format` apenas schema/defaults.
- F21-06 **BLOCKER** de paridade: sem rustc/cargo e fixtures de save idênticas; equivalência integral não validada.

Incremento M21 pode ser entregue como pacote **parcial verificado**, sem alegar release completo.
