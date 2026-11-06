/** M21 — port completo das tabelas e funções `crates/datapack/src/codes.rs`.
 * Códigos e posições gerados por parser do Rust, com verificação de contagem. */
export const COUNTRY_FIFA = Object.freeze(["AFG", "RSA", "ALB", "GER", "AND", "ANG", "AIA", "ATG", "CUW", "KSA", "ALG", "ARG", "ARM", "ARU", "AUS", "AUT", "AZE", "BAH", "BHR", "BAN", "BRB", "BEL", "BLZ", "BEN", "BER", "BLR", "BOL", "BIH", "BOT", "BRA", "BRU", "BUL", "BFA", "BDI", "BHU", "CPV", "CMR", "CAM", "CAN", "QAT", "KAZ", "CHA", "CHI", "CHN", "CYP", "TLS", "COL", "CGO", "PRK", "KOR", "CIV", "CRC", "CRO", "CUB", "DEN", "DJI", "DMA", "EGY", "SLV", "UAE", "ECU", "ERI", "SCO", "SVK", "SVN", "ESP", "EST", "ETH", "USA", "FIJ", "FIN", "PHI", "FRA", "GAB", "GAM", "GHA", "GEO", "GRN", "GRE", "GUA", "GUY", "GUI", "GNB", "EQG", "HAI", "NED", "HON", "HKG", "HUN", "YEM", "CAY", "COK", "FRO", "SOL", "VGB", "IND", "IDN", "ENG", "IRN", "IRQ", "IRL", "NIR", "ISL", "ISR", "ITA", "MNE", "JAM", "JPN", "JOR", "KEN", "KVX", "KUW", "LAO", "LES", "LVA", "LBN", "LBY", "LBR", "LIE", "LTU", "LUX", "MAC", "MKD", "MAD", "MAS", "MWI", "MDV", "MLI", "MLT", "MAR", "MTN", "MEX", "MYA", "MOZ", "MDA", "MCO", "MNG", "NAM", "NEP", "NCA", "NIG", "NGA", "NOR", "NZL", "OMA", "WAL", "PLE", "PAN", "PNG", "PAK", "PAR", "PER", "POL", "PUR", "POR", "KGZ", "CTA", "COD", "DOM", "CZE", "ROU", "RWA", "RUS", "SAM", "SMR", "LCA", "SKN", "STP", "VIN", "SEN", "SLE", "SRB", "SEY", "SGP", "SYR", "SOM", "SRI", "SWZ", "SDN", "SWE", "SUI", "SUR", "TJK", "THA", "TAH", "TPE", "TAN", "TOG", "TGA", "TRI", "TUN", "TKM", "TUR", "UKR", "UGA", "URU", "UZB", "VAN", "VEN", "VIE", "ZAM", "ZIM", "COM", "FSM", "MHL", "MRI", "NRU", "PLW", "KIR", "SSD", "TUV", "VIR", "MSR", "TCA", "ASA", "NCL", "GIB", "GLP", "GUM", "MTQ", "GUF", "BOE", "SMN", "SMA"]) as readonly string[];
export const STATE_CODES = Object.freeze(["AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"]) as readonly string[];
export const POSITIONS = Object.freeze(["GK", "FB", "CB", "MF", "FW"]) as readonly string[];
export const SIDES = Object.freeze(["R", "L"]) as readonly string[];
export const TRAITS = Object.freeze(["positioning", "penalty-saving", "reflexes", "rushing-out", "playmaking", "heading", "crossing", "tackling", "dribbling", "finishing", "marking", "passing", "stamina", "pace"]) as readonly string[];
export const STATE_FORMATS = Object.freeze(["6-teams", "8-teams-4-qualify", "10-teams-4-qualify", "11-teams-4-qualify", "12-teams-4-qualify", "12-teams-8-qualify", "14-teams-8-qualify", "16-teams-4-groups-sp-2021", "16-teams-4-qualify", "16-teams-8-qualify", "20-teams-4-groups"]) as readonly string[];

export const BRAZIL=29;
/** `lookup` devolve undefined em id inválido, como Option::None. */
export function codeOf(table:readonly string[],id:number):string|undefined{return Number.isInteger(id)&&id>=0?table[id]:undefined;}
/** `index` diferencia maiúsculas e minúsculas como Rust `str::eq`. */
export function idOf(table:readonly string[],code:string):number|undefined{const i=table.indexOf(code);return i<0?undefined:i;}
export const countryCode=(id:number)=>codeOf(COUNTRY_FIFA,id);
export const countryId=(code:string)=>idOf(COUNTRY_FIFA,code);
export const stateCode=(id:number)=>codeOf(STATE_CODES,id);
export const stateId=(code:string)=>idOf(STATE_CODES,code);
export const positionCode=(id:number)=>codeOf(POSITIONS,id);
export const positionId=(code:string)=>idOf(POSITIONS,code);
export const sideCode=(id:number)=>codeOf(SIDES,id);
export const sideId=(code:string)=>idOf(SIDES,code);
export const traitCode=(id:number)=>codeOf(TRAITS,id);
export const traitId=(code:string)=>idOf(TRAITS,code);
export const stateFormatCode=(id:number)=>codeOf(STATE_FORMATS,id);
export const stateFormatId=(code:string)=>idOf(STATE_FORMATS,code);
