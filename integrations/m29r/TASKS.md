# Tarefas — incremento isolado M29R

**Objetivo:** Resolver em uma rodada o máximo verificável dos bloqueios M28/M29: avanço de calendário, partidas, finanças, RNG com rollback, coesão de referências e persistência.

**Contrato da base:** Fonte Rust original `brasfoot-next-main.zip`, commit de origem a auditar. O ZIP histórico M28/M29 está referenciado na Biblioteca, porém bytes não materializados; portanto este é um **kit independente**, não um patch aplicado ao projeto M28/M29.

- [x] Port e testes JavaRandom/RandomSource; 5.124 comparações JDK PASS (`evidence/jdk_parity_5124.log`).
- [x] World DTO/arenas, ownership e recuperação por idade; testes PASS (`evidence/npm_test_41.log`).
- [x] Avanço de rodada transacional com engine injetada; rollback de World+RNG; testes PASS.
- [x] Checkpoint `.fmu-day` com SHA/backup/recuperação; testes de corrupção PASS.
- [x] Duas temporadas fictícias de 90 partidas; output reproduzível, **não Rust**.
- [x] QA de artefato preliminar: 41/41 testes e 5.124 checks JDK no ZIP extraído; SHA e CRC íntegros. Pacote definitivo será validado na mesma rodada.
- [ ] Integração do kit no ZIP M28/M29 real (BLOCKED: bytes indisponíveis).
- [ ] Paridade integral contra Rust/fixtures reais (BLOCKED: fixtures e toolchain ausentes).
