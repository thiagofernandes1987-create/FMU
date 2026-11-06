# Dependências M21

| componente | depends_on | used_by | contract/ver | impact | regs |
|---|---|---|---|---|---|
| model JavaHash/Sort/fdlibm | DataView, UTF-16, ECMAScript number | equivalência do RNG, sorting e valores | C21-MODEL-01..03 | ordem de desempates, bits | M21 Model |
| model World/Runtime | DTOs de arenas e rubricas | contratos, finanças e partidas | C21-MODEL-04 | caixa, save, estatística | M21 Cross |
| simulation Human | World financeira e clock injetados | telas de contratos, estádio e inbox | C21-SIM-01 | dinheiro, jogador, obra | M21 Domain |
| simulation Clubs | World records da carreira | tabelas e comissões | C21-SIM-01 | classificação histórica | M21 Cross |
| systems Clock/Tactics | hooks da engine e dos 13 sistemas | loop de carreira (opcional) | C21-SYS-01..02 | ordem eventos/tática | M21 Domain |
| systems Director | `SLOT_ROLE`, modValue, estimate, price | sugestões de mercado | C21-SYS-02 | mercado/compra | M21 Cross |
| engine Stadium | defaults e freshInt do Runtime | renda de jogos | C21-ENGINE-01 | finanças e público | M21 Cross |
| datapack Codes/Trophies | fonte do país/UF, PNG path | importador e assets | C21-DATA-01 | identidades das bandeiras/troféus | M21 Domain |
| datapack Tree/Format/Issues | camadas em memória, schema, lista de alertas | importadores futuros | C21-DATA-02 | validação de database | M21 Domain |
