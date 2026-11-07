# Brasfoot Next → TypeScript — M31, leitor binário Kryo e `.s22` preflight

O M31 aprofunda o port original Rust→TS na parte de saves legados. A base M29+M30 (código de carreira, Web, RNG e journal) é mantida. Sem alteração de UI nem do banco privado.

## Testar e inspecionar

```bash
npm test                # 707/707 (663 anteriores + 44 M31)
npm run m31:tests       # 44/44
npm run m31:audit       # 231 hashes Rust + matriz
npm run m31:kryo -- canonical tests/fixtures/m31/synthetic-object.s22 tests/fixtures/m31/synthetic-kryo-schema.json
npm run m31:kryo -- diff tests/fixtures/m31/synthetic-object.s22 tests/fixtures/m31/synthetic-kryo-schema.json tests/fixtures/m31/synthetic.canon.txt
```

**Se tiver um save `.s22` original**, o comando precisa também do esquema gerado do JAR da mesma versão. O parser **não** incorpora o arquivo `kryo-schema.json`, ausente do material fornecido. O resultado de preflight não é um `World` jogável.

**Cobertura nominal:** M29+M30 211/231=91,34%; M31 213/231=**92,21%** (+0,87 ponto), 18 arquivos sem correspondência. Duas novas correspondências são testes/ferramentas **parciais**, não paridade funcional. O motor completo e a importação semântica real seguem `RELEASE_BLOCKED`.

Documentação: `docs/M31_MODULE_GUIDE.md`, `CONTRACTS_M31.md`, `DEPENDENCY_MATRIX_M31.md`, `TRACEABILITY_MATRIX_M31.md`, `QA_REPORT_M31.md`, `KNOWN_ISSUES_M31.md`.
