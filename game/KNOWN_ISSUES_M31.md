# M31 — Questões abertas

| ID | Severidade | Estado | Próxima condição |
|---|---|---|---|
| B31-01 | BLOCKER | OPEN | Obter o **`kryo-schema.json` real** da exportação do JAR Brasfoot original: o snapshot Rust não o contém. |
| B31-02 | BLOCKER | OPEN | Obter `.s22` e `.canon.txt.zst` executados pelo próprio jogo para diferencial de `reader.rs`. |
| B31-03 | BLOCKER | OPEN | Converter 11 funções semânticas `.s22` → `World` e validar duas temporadas reais, além de 18 fontes sem mapeamento. |
| M31-04 | MAJOR | OPEN, not accepted | O parser foi validado em fixtures sintéticas, mas ainda não há validação do esquema/serializers de produção. |
| M31-05 | MAJOR | OPEN, not accepted | O comparador de golden requer proveniência de execução real e não infere paridade só porque dois textos sintéticos coincidem. |
| N31-06 | MINOR | OPEN | Leitor opera em Node e limites conservadores de 64 MiB/1M nós/1024 profundidade, pode exigir streaming para saves maiores. |

**Conversão integral:** `RELEASE_BLOCKED`. **Incremento M31:** passível de validação técnica com QA e pacote.
