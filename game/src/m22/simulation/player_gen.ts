/** Fonte: simulation/src/player_gen.rs. Nomes Java UTF-16 e potencial da base por reputação.
 * Nenhum jogador criado aqui: é o cálculo puro de potencial do gerador Rust. */
export function javaNameLength22(name:string):number{return name.length;}
/** `word_count`: Java split trata separadores iniciais como termo vazio. */
export function javaWordCount22(name:string):number{if(!name)return 0;const parts=name.split(/[ \t\n\v\f\r]+/).filter(Boolean);return parts.length+(parts.length>0&&/^[ \t\n\v\f\r]/.test(name)?1:0);}
/** `youth_potential`: três curvas conforme nível e reputação, sorteio 1..100. */
export function youthPotential22(level:number,reputation:number,draw:number):number{
 const bands=level<19&&reputation<=3?(level>=15?[[2,1],[5,2],[10,4],[30,5],[65,6],[90,7],[95,8],[98,9]]:[[4,1],[8,2],[15,3],[25,4],[50,5],[75,6],[95,7],[98,8],[99,9]]):[[2,1],[5,2],[10,4],[25,5],[60,6],[80,7],[90,8],[98,9]];
 for(const [max,value] of bands)if(draw<=max!)return value!;return 10;
}
