/** M21 — port integral de constantes e funções de nomes de brands.rs (GPL-3.0).
 * Origem: crates/model/src/brands.rs; mantida ordem exata dos arrays Rust.
 * Dependências: nenhuma. Efeito: puro. Teste: m21_model.test.ts. */
export const BRAND_FIRST = Object.freeze(["Vortex", "Nexo", "Atlas", "Kairo", "Solaris", "Prisma", "Onda", "Rota", "Pixel", "Fortuna", "Aurora", "Titan", "Zenith", "Delta", "Orion", "Vega", "Lumen", "Astra", "Boreal", "Cosmo", "Fênix", "Halo", "Ícaro", "Júpiter", "Krona", "Lótus", "Meridia", "Nimbus", "Polar", "Quasar"]) as readonly string[];
export const BRAND_SECOND = Object.freeze(["Bank", "Energia", "Telecom", "Seguros", "Motors", "Saúde", "Log", "Bebidas", "Tech", "Crédito", "Airways", "Bet", "Foods", "Mobile", "Pay", "Petro"]) as readonly string[];
export const OWNER_FIRST = Object.freeze(["Crescent Oasis", "Northwind", "Bluewater", "Iron Peak", "Desert Falcon", "Golden Dune", "Silverline", "Starlight", "Granite Bay", "Sapphire Coast", "Redwood Arc", "Polaris Bay", "Highcliff", "Emerald Gate", "Coral Tide", "Black Summit"]) as readonly string[];
export const OWNER_SECOND = Object.freeze(["Capital", "Sports Group", "Holdings", "Partners", "Ventures", "Investimentos"]) as readonly string[];
export const MASTER_BRANDS = Object.freeze(["Vortex Bank", "Nexo Energia", "Fly Brasil", "Mercado Total", "Pixel Telecom", "Rota Seguros", "Solaris Motors", "Prisma Saúde", "Atlas Log", "Onda Bebidas", "Kairo Tech", "Fortuna Crédito"]) as readonly string[];
export const SLOT_LINES = Object.freeze(["Bank", "Energia", "Telecom", "Seguros", "Motors", "Saúde", "Log", "Bebidas", "Tech", "Crédito", "Airways", "Foods", "Mobile", "Pay", "Sports", "Arena"]) as readonly string[];
export const STAFF_FIRST_NAMES = Object.freeze(["Paulo", "Marcos", "Rafael", "Diego", "Thiago", "André", "Lucas", "Bruno", "Fernando", "Ricardo", "Javier", "Pablo", "Luis", "Mathieu", "Julien", "Stéphane", "Marco", "Luca", "Stefan", "Jonas", "Tomás", "Nuno", "Rui", "Sérgio", "Daniel", "Gabriel", "Hugo", "Pierre", "Andrea", "Carlos"]) as readonly string[];
export const STAFF_SURNAMES = Object.freeze(["Almeida", "Rocha", "Fonseca", "Carvalho", "Teixeira", "Moreira", "Pires", "Duarte", "Navarro", "Ortega", "Ibáñez", "Lambert", "Moreau", "Girard", "Rossi", "Bianchi", "Ferrara", "Keller", "Brandt", "Hofmann", "Sousa", "Matos", "Vidal", "Peralta", "Dubois", "Fontaine", "Costa", "Barros", "Lemos", "Guerra"]) as readonly string[];
export const NAMING_BRANDS = Object.freeze(["Vortex Bank", "Solaris Motors", "Kairo Tech", "Nexo Energia", "Atlas Airways", "Prisma Seguros", "Titan Telecom", "Aurora Invest", "Zenith Pay", "Onda Global", "Lumen Digital", "Boreal Air"]) as readonly string[];

export const MUNICIPAL_STADIUM = 'Estádio Municipal';
/** Strings com índices de save: rejeitar indice inválido em vez de inventar valor. */
function selected(a: readonly string[], i:number):string {if(!Number.isInteger(i)||i<0||i>=a.length)throw new RangeError('Invalid brand index');return a[i]!;}
export function brand(a:number,b:number):string{return `${selected(BRAND_FIRST,a)} ${selected(BRAND_SECOND,b)}`;}
export function owner(a:number,b:number):string{return `${selected(OWNER_FIRST,a)} ${selected(OWNER_SECOND,b)}`;}
export function staff(a:number,b:number):string{return `${selected(STAFF_FIRST_NAMES,a)} ${selected(STAFF_SURNAMES,b)}`;}
export function slotBrand(a:number,b:number):string{return `${selected(BRAND_FIRST,a)} ${selected(SLOT_LINES,b)}`;}
export function baseStadiumName():string {return MUNICIPAL_STADIUM;}
export function legendStadium(legend:string):string{return `Estádio ${legend}`;}
/** `club_arena`: países 30, 27/18, 10, 35; paridade de ID segue Rust `% 2`. */
export function clubArena(country:number,id:number,name:string):string {
 switch(country){case 30:return `${id%2===0?'Stade ':'Parc '}${name}`;
 case 27:case 18:return `${name}${id%2===0?' Stadium':' Park'}`;
 case 10:return `${name}-Arena`;case 35:return `Stadio ${name}`;default:return `Arena ${name}`;}
}
/** `sponsored_stadium`: recusa adicionar marca vazia e evita duplicação por case fold. */
export function sponsoredStadium(base:string|undefined,brandName:string):string|undefined {
 if(!brandName)return base;
 const short=brandName.split(' ')[0]??'';
 if(base===undefined||base.startsWith(MUNICIPAL_STADIUM))return `${short} Arena`;
 if(base.toLowerCase().includes(short.toLowerCase()))return base;
 return `${short} ${base}`;
}
