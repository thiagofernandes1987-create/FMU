/** M21 — crates/datapack/src/trophies.rs: mapeamento de troféus para pack.
 * Tabelas geradas da fonte Rust. Origin country lookup usa nomes legados e FIFA. */
import {COUNTRY_FIFA,STATE_CODES} from './codes';
export const REGIONAL_TROPHIES = [
 ['tr_riosaopaulo','rio-sao-paulo'],['tr_sulminas','sul-minas'],
 ['tr_copanordeste','copa-do-nordeste'],['tr_copaverde','copa-verde']
] as readonly (readonly [string,string])[];
export const GAME_COUNTRY_CODES=["AFG", "AFS", "ALB", "ALE", "AND", "AGO", "AIA", "ATG", "CUR", "ARS", "ALG", "ARG", "ARM", "ARU", "AUS", "AUT", "AZE", "BAH", "BHR", "BAN", "BAR", "BEL", "BLZ", "BEN", "BER", "BIE", "BOL", "BOS", "BOT", "BRA", "BRU", "BUL", "BKF", "BUR", "BUT", "CAV", "CAM", "CMJ", "CAN", "CAT", "CAZ", "CHA", "CHI", "CHN", "CPR", "TML", "COL", "CNG", "CRN", "CRS", "COM", "CSR", "CRO", "CUB", "DIN", "DJI", "DOM", "EGI", "ELS", "EMI", "EQU", "ERI", "ESC", "ELQ", "ESV", "ESP", "EST", "ETI", "EUA", "FIJ", "FIN", "FIL", "FRA", "GAB", "GAM", "GAN", "GEO", "GRA", "GRE", "GUA", "GUN", "GUI", "GNB", "GNE", "HAI", "HOL", "HON", "HKG", "HUN", "IEM", "ICA", "ICO", "IFA", "ISA", "IVB", "IND", "IDO", "ING", "IRA", "IRQ", "IRL", "IRN", "ISL", "ISR", "ITA", "MON", "JAM", "JAP", "JOR", "QUE", "KOS", "KUW", "LAO", "LES", "LET", "LBN", "LIB", "LRI", "LIE", "LIT", "LUX", "MAC", "MCD", "MAD", "MAL", "MWI", "MLD", "MLI", "MTA", "MAR", "MAU", "MEX", "MIA", "MOC", "MOL", "MNC", "MGL", "NAM", "NEP", "NIC", "NIR", "NIG", "NOR", "NOZ", "OMA", "PGA", "PAL", "PAN", "PNG", "PAQ", "PAR", "PER", "POL", "PRI", "POR", "QUI", "RCA", "RDG", "RDO", "RTC", "ROM", "RUA", "RUS", "SAM", "SAN", "STL", "SCN", "STP", "SVG", "SEN", "SLE", "SER", "SEY", "SIN", "SIR", "SOM", "SRI", "ESS", "SUD", "SUE", "SUI", "SUR", "TAD", "TAI", "TTI", "TAW", "TAN", "TGO", "TON", "TRT", "TUN", "TCM", "TUR", "UCR", "UGA", "URU", "UZB", "VAN", "VEN", "VIE", "ZAM", "ZIM", "ICM", "MIC", "IMA", "IMR", "NAU", "PLU", "KIR", "SUS", "TUV", "IVA", "MST", "ITC", "SME", "NCA", "GIB", "GDA", "GMA", "MTI", "GFR", "BON", "SMF", "SMH"] as readonly string[];
export const CONTINENTAL_TROPHIES=[["tr_copaafrica", "africa-cup-of-nations"], ["tr_copaamerica", "copa-america"], ["tr_recopaeuropa", "european-super-cup"], ["tr_copaasia", "asian-cup"], ["tr_recopasulamaericana", "recopa-sudamericana"], ["tr_copaofc", "ofc-nations-cup"], ["tr_copaouro", "gold-cup"], ["tr_sulamericana", "copa-sudamericana"], ["tr_conference", "conference-league"], ["tr_finalissima", "finalissima"], ["tr_liganacoes", "nations-league"], ["tr_liganacoesc", "nations-league-c"], ["tr_eurocopa", "euro"], ["tr_copamundo", "world-cup"], ["tr_libertadores", "libertadores"], ["tr_ligacaf", "caf-champions-league"], ["tr_ligaafc", "afc-champions-league"], ["tr_ligacampeoes", "champions-league"], ["tr_ligaconcacaf", "concacaf-champions-cup"], ["tr_ligaeuropa", "europa-league"], ["tr_ligaofc", "ofc-champions-league"], ["tr_mundial", "intercontinental-cup"]] as readonly (readonly [string,string])[];

/** `pack_path`: ícones alternativos da liga, Copa, SuperCopa e estaduais. */
export function trophyPackPath(stem:string):string|undefined{
 const lower=stem.toLowerCase();
 const fixed:Record<string,string>={tr_nacionalgenerico:'league/default',tr_copa:'cup/default',
  tr_supercopa_generico:'super-cup/default',tr_estadualgenerico:'state/default'};
 if(fixed[lower])return `trophies/${fixed[lower]}.png`;
 for(const [src,slug] of [...REGIONAL_TROPHIES,...CONTINENTAL_TROPHIES])
  if(src===lower)return `trophies/${REGIONAL_TROPHIES.some(([name])=>name===src)?'regional':'continental'}/${slug}.png`;
 const match=/^tr_(nacional|copa|supercopa|estadual)_(.+)$/.exec(lower);
 if(!match)return undefined;
 const kind=({'nacional':'league','copa':'cup','supercopa':'super-cup','estadual':'state'} as const)[match[1] as 'nacional'|'copa'|'supercopa'|'estadual'];
 let value=match[2]!,division:number|undefined;
 if(value.includes('_d')){
  if(kind!=='league'&&kind!=='state')return undefined;
  const pieces=value.split('_d');if(pieces.length!==2||!/^[1-4]$/.test(pieces[1]!))return undefined;
  value=pieces[0]!;division=Number(pieces[1]);
 }
 let code:string;
 if(kind==='state'){
  if(!STATE_CODES.includes(value.toUpperCase()))return undefined;code=value;
 }else{
  const i=GAME_COUNTRY_CODES.findIndex(x=>x.toLowerCase()===value);
  if(i<0)return undefined;code=COUNTRY_FIFA[i]!.toLowerCase();
 }
 return `trophies/${kind}/${code}${division===undefined?'':`-${division}`}.png`;
}
