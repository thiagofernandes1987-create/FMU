# Achados e bloqueios

| Severity | ID | Status | Impacto e condição de retomada |
|---|---|---|---|
| BLOCKER | M29R-01 | OPEN | A base M28/M29 completa foi encontrada na Biblioteca mas não pôde ser materializada como código editável. O kit não é um patch aplicado aos ZIPs anteriores. Requer ZIP M28/M29 disponibilizado nesta sessão ou repositório Git acessível. |
| BLOCKER | M29R-02 | OPEN | Não há motor Rust completo `Sim::advance` ou fixtures diferenciais `.bfn` reais para comprovar paridade. A engine demo é explicitamente fictícia. |
| BLOCKER | M29R-03 | OPEN | Os 20 testes/exemplos Rust pendentes não foram convertidos integralmente; cobertura nominal histórica 211/231 não é reavaliada sem a matriz e código M28. |
| MAJOR | M29R-04 | OPEN | `nextGaussian` StrictMath e RNG do relógio original não estão portados. Para testes determinísticos, JavaRandom e RandomSource com seed fixa foram comparados ao JDK. |
| MAJOR | M29R-05 | OPEN | Os callbacks `playMatch`, `afterMatch`, `afterStage` e `endSeason/newSeason` precisam do motor e sistemas originais; o kit falha explicitamente quando ausentes. |
| MAJOR | M29R-06 | OPEN | World DTO é subconjunto de saved.rs, não todo o schema Rust/CBOR; `normalizeImportedWorld` presume WorldDocument previamente validado. |
| MINOR | M29R-07 | OPEN | `.fmu-day` é checkpoint Node.js V8 independente de plataforma/versão; não é compatível com .bfn original nem portável universalmente. |
| MINOR | M29R-08 | OPEN | A rodada real exige outros hooks para empréstimos, estádios, treinadores, notícias e regras de competições internacionais. O kit bloqueia os casos materiais em vez de omitir. |