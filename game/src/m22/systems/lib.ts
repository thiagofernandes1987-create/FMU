/** Fonte: systems/src/lib.rs. Ordem/seed dos RNGs estáticos dos módulos.
 * `StaticRandoms` Rust usa JavaRandom; esta função devolve a semente canônica,
 * sem inicializar RNG global (evita alteração da sequência dos outros sistemas). */
export const STATIC_RANDOM_CLASSES22=['Comissao','Base','Estadios','Emprestimos','Cotas','Credito','Janelas','CampeonatoBase','Economia','Investidor','Patrocinio','Mercado','Patrimonio','SuperMundial','Satelites','Motor'] as const;
export function staticRandomSeed22(name:string):number{const i=(STATIC_RANDOM_CLASSES22 as readonly string[]).indexOf(name);if(i<0)throw RangeError('Unknown static RNG class');return 900000+i;}
