/** M21 — crates/datapack/src/format.rs: contratos de dados do formato v1.
 * DTOs preservam estrutura e defaults. Parser TOML/CSV usa camada externa. */
export const PACK_FORMAT_VERSION=1;
export const MANIFEST='manifest.toml',CLUB='club.toml',SQUAD='squad.csv',YOUTH='youth.csv',CREST='crest.png';
export const KITS=['kit.png','kit2.png','kit3.png'] as const;
export interface Removals{clubs:string[];leagues:string[];stateLeagues:string[];}
export function emptyRemovals():Removals{return {clubs:[],leagues:[],stateLeagues:[]};}
export function removalsIsEmpty(r:Removals):boolean{return r.clubs.length===0&&r.leagues.length===0&&r.stateLeagues.length===0;}
export interface PackManifest{format:number;id:string;kind:'base'|'patch';name:string;description?:string;version?:string;extends?:string;remove:Removals;}
export interface PackStadiumFile{name:string;capacity:number;}
export interface PackCoachFile{name:string;country:string;}
export interface PackClubFile{name:string;country:string;state?:string;level:number;reputation:number;colors:[string,string];rivals:string[];stadium:PackStadiumFile;coach:PackCoachFile;}
export interface PackPlayerRow{name:string;position:string;side:string;age:number;country:string;potential:number;starter:boolean;star:boolean;worldClass:boolean;trait1:string;trait2:string;}
export interface PackDivisionFile{division:number;name?:string;divisionName?:string;teams:number;twoRounds:boolean;roundCount:number;groups:number;gamesWithinGroup:boolean;knockoutTeams:number;twoLeggedKnockout:boolean[];qualifyByOverallTable:boolean;bestThirdPlaces:boolean;tiebreak:number;}
/** Parse/normalize manifest; preserva `deny_unknown_fields` do serde de origem. */
export function normalizeManifest(raw:Record<string,unknown>):PackManifest{
 const allowed=new Set(['format','id','kind','name','description','version','extends','remove']);
 for(const key of Object.keys(raw))if(!allowed.has(key))throw new Error('Unknown manifest field '+key);
 if(raw.format!==PACK_FORMAT_VERSION||typeof raw.id!=='string'||typeof raw.name!=='string'||(raw.kind!=='base'&&raw.kind!=='patch'))throw new Error('Invalid manifest format');
 const r=raw.remove as Partial<Removals>|undefined;
 return {format:1,id:raw.id,kind:raw.kind,name:raw.name,
  ...(typeof raw.description==='string'?{description:raw.description}:{}),
  ...(typeof raw.version==='string'?{version:raw.version}:{}),
  ...(typeof raw.extends==='string'?{extends:raw.extends}:{}),
  remove:{clubs:[...(r?.clubs??[])],leagues:[...(r?.leagues??[])],stateLeagues:[...(r?.stateLeagues??[])]}};
}
