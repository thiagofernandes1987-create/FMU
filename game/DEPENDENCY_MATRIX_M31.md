# Matriz de dependências M31

| Componente | Depende de | Usado por | Contrato | Impacto | Regressões |
|---|---|---|---|---|---|
| m22/kryo_input | Uint8Array / DataView | m31/kryo_reader, m22 parser tests | CT31-02 | leitura binária e limites UTF16 | M22+M31 |
| m31/kryo_graph | Rust class/node ID structure | m31 reader, canonical, preflight | CT31-01 | aliases/referências | M31 graph |
| m31/kryo_reader | m22/kryo_schema e input; esquema externo | canonical CLI, preflight | CT31-02 | parsing .s22 condicionado à fonte | M31 reader |
| m31/kryo_canonical | m31/graph | m31 CLI, diff | CT31-03 | comparação byte textual | M31 canonical |
| m31/kryo_compare | strings canonical e hash do input | diff CLI, testes diferenciais | CT31-05/06 | evitar falso PASS | M31 diff |
| m31/s22_preflight | m31 reader, m22/import_context | importador World futuro | CT31-04 | raiz/arenas | M31 preflight |
| m31/kryo_cli | reader, canonical, compare, fs, zlib | usuário/dev local | CT31-07 | dump/golden | M31 CLI |
