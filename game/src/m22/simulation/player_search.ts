/** Fonte: simulation/src/player_search.rs. Buscador por posição, força, faixa e prefixo.
 * Dependências: dados reais de atleta e país; sem mutação. */
export interface SearchedPlayer22{id:string;name:string;position:number;age:number;strength:number;marketValue:number;}
export const SEARCH_VALUE_BANDS22:[[number,number],...Array<[number,number]>]=[[1,100999],[101000,500999],[501000,1000000],[1000001,3000000],[3000001,5000000],[5000001,10000000],[10000000,1000000000]];
/** Accent fold é NFKD aproximado, não expansão tabelada Latin Extended-A Rust. */
export function searchPlayer22(players:readonly SearchedPlayer22[],filter:{name?:string;position?:number;age?:readonly [number,number];strength?:readonly [number,number];band?:number}):SearchedPlayer22[]{
 const fold=(s:string)=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const band=filter.band===undefined?undefined:SEARCH_VALUE_BANDS22[filter.band];
 if(filter.band!==undefined&&!band)throw RangeError('Invalid value band');
 return players.filter(p=>(filter.position===undefined||p.position===filter.position)&&(!filter.name||fold(p.name).startsWith(fold(filter.name)))&&
 (!filter.age||p.age>=filter.age[0]&&p.age<=filter.age[1])&&(!filter.strength||p.strength>=filter.strength[0]&&p.strength<=filter.strength[1])&&
 (!band||p.marketValue>=band[0]&&p.marketValue<=band[1])).sort((a,b)=>a.position-b.position||b.strength-a.strength);
}
