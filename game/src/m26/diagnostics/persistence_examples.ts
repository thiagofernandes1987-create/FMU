/**
 * M26 — saídas read-only inspiradas por examples de `persistence`:
 * `game_data.rs`, `comp_ids.rs`, `save_features.rs`, `open_bfn.rs`.
 * DEPENDÊNCIAS: BfnDecoded, ReadBfnPayload (Zstd/CBOR real) e DTOs importados.
 * NUNCA converter payload CBOR em World sem o decoder/migrador completos.
 * EFEITOS: zero mutação; resumo de campos disponíveis com explícitos `unverified`.
 */
import {BfnDecoded,readBfnPayload,summarizeBfnPayload} from '../persistence/bfn_codec';
import {CborValue,CborRecord} from '../persistence/cbor';
const rec=(x:unknown):Record<string,CborValue>|undefined=>x&&typeof x==='object'&&!Array.isArray(x)&&!(x instanceof Map)&&!(x instanceof Uint8Array)&&!('tag' in x)?x as Record<string,CborValue>:undefined;
const arr=(x:CborValue|undefined):CborValue[]=>Array.isArray(x)?x:[];
/** `.bfn` save features, sem afirmar tipagem World. Campos ausentes ficam undefined. */
export function inspectBfnFeatures(save:BfnDecoded):{
 season:number|undefined;startYear:number|undefined;day:number|undefined;
 flags:Readonly<Record<string,boolean|undefined>>;clubs:number|undefined;players:number|undefined;
 competitions:Readonly<Record<string,number>>;worldLoaded:false;
 } {
 const world=rec(save.payload),game=rec(world?.game),competition=arr(world?.competitions);
 const flags:Record<string,boolean|undefined>=Object.create(null);
 for(const f of ['plays_international_clubs','plays_all_national_teams','plays_regionals','individual_skills','flag_bc']){
  flags[f]=typeof game?.[f]==='boolean'?game[f] as boolean:undefined;
 }
 const counts:Record<string,number>=Object.create(null);
 for(const c of competition){const val=rec(c);const kind=val?.kind;
  if(typeof kind==='number'){const key=String(kind);counts[key]=(counts[key]??0)+1;}}
 const n=(x:CborValue|undefined)=>typeof x==='number'&&Number.isSafeInteger(x)?x:undefined;
 return {season:n(game?.season)??n(save.meta.season as CborValue),startYear:n(game?.start_year),day:n(game?.day),
  flags,clubs:Array.isArray(world?.clubs)?world.clubs.length:undefined,players:Array.isArray(world?.players)?world.players.length:undefined,
  competitions:counts,worldLoaded:false};
}
/** `comp_ids.rs`: inclui legacy IDs quando já presentes no CBOR, sem procurar arenas. */
export function inspectBfnCompetitionIds(save:BfnDecoded):{index:number;name:string;legacyId:number|null;kind:number|null}[] {
 const world=rec(save.payload);
 return arr(world?.competitions).map((c,index)=>{const d=rec(c);return {
  index,name:typeof d?.name==='string'?d.name:'',legacyId:typeof d?.legacy_id==='number'?d.legacy_id:null,
  kind:typeof d?.kind==='number'?d.kind:null};});
}
/** `game_data.rs`: resumo de templates JÁ lidos; não abre .ban JavaSer aqui. */
export function summarizeTeamTemplates(teams:readonly {country:number;name:string}[],leagueConfigs:readonly {country:number}[]):{
 teams:number;countries:number;byCountry:{country:number;count:number}[];leagueConfigurations:number;
 } {
 const by=new Map<number,number>();
 for(const t of teams){if(!Number.isInteger(t.country))throw Error('Invalid team country');by.set(t.country,(by.get(t.country)??0)+1);}
 return {teams:teams.length,countries:by.size,byCountry:[...by].sort((a,b)=>a[0]-b[0]).map(([country,count])=>({country,count})),leagueConfigurations:leagueConfigs.length};
}
/** `open_bfn.rs`: lê realmente Zstd+CBOR; `worldLoaded=false` protege consumidor. */
export function inspectBfnBytes(bytes:Uint8Array):{
 header:ReturnType<typeof summarizeBfnPayload>;features:ReturnType<typeof inspectBfnFeatures>;
 competitions:ReturnType<typeof inspectBfnCompetitionIds>;
 } {
 const save=readBfnPayload(bytes);
 return {header:summarizeBfnPayload(save),features:inspectBfnFeatures(save),competitions:inspectBfnCompetitionIds(save)};
}
