/**
 * Port de crates/simulation/src/trophy.rs: imagens de troféus e galerias.
 * Inputs: classe/país/estado do campeonato e catálogos fornecidos pelo World.
 * Efeitos: nenhum; não consulta filesystem implicitamente, `exists` é callback.
 * Limite: classes desconhecidas retornam string vazia como Rust.
 */
export const STATE_CODES=['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'] as const;
export const GENERIC=['tr_nacionalgenerico','tr_supercopa_generico','tr_estadualgenerico'] as const;
export type CompetitionClass=string;
export interface TrophyCompetition {id:string;class:CompetitionClass;country:number;leagueCountry?:number;
 division:number;state?:number;region?:number;}
export type CountryCode=(id:number)=>string;
const FIXED:Record<string,string>={AfricaCupOfNations:'tr_copaafrica',CopaAmerica:'tr_copaamerica',SuperCupD:'tr_recopaeuropa',
 AsianCup:'tr_copaasia',SuperCupE:'tr_recopasulamaericana',OceaniaNationsCup:'tr_copaofc',GoldCup:'tr_copaouro',
 CopaSudamericana:'tr_sulamericana',ConferenceLeague:'tr_conference',Finalissima:'tr_finalissima',
 NationsLeagueM:'tr_liganacoes',NationsLeagueN:'tr_liganacoesC',EuropeanChampionship:'tr_eurocopa',
 WorldCup:'tr_copamundo',Libertadores:'tr_libertadores',CafChampionsLeague:'tr_ligacaf',AfcChampionsLeague:'tr_ligaafc',
 ChampionsLeague:'tr_ligacampeoes',ConcacafChampionsCup:'tr_ligaconcacaf',EuropaLeague:'tr_ligaeuropa',
 OfcChampionsLeague:'tr_ligaofc',IntercontinentalCup:'tr_mundial'};
/** `division_picture`: nome com sufixo _d, 1ª divisão própria ou genérica. */
export function divisionPicture(base:string,division:number,generic:string,exists:(stem:string)=>boolean):string {
 const own=`${base}_d${division}`;
 return exists(own)?own:division===1&&exists(base)?base:generic;
}
/** `trophy_picture`: escolha da imagem/fallback por classe. */
export function trophyPicture(c:TrophyCompetition,exists:(stem:string)=>boolean,countryCode:CountryCode):string {
 const pick=(name:string,generic:string)=>exists(name)?name:generic;
 const leagueCode=countryCode(c.leagueCountry??-1);
 switch(c.class){
  case 'NationalCup':return pick(`tr_copa_${leagueCode}`,'tr_copa');
  case 'NationalSuperCup':return pick(`tr_supercopa_${countryCode(c.country)}`,'tr_supercopa_generico');
  case 'NationalLeague':return divisionPicture(`tr_nacional_${leagueCode}`,c.division,'tr_nacionalgenerico',exists);
  case 'StateChampionship':return divisionPicture(`tr_estadual_${STATE_CODES[c.state??-1]??''}`,c.division,'tr_estadualgenerico',exists);
  case 'RegionalCup':{const names=['tr_riosaopaulo','tr_sulminas','tr_copanordeste','tr_copaverde',''];const own=names[c.region??-1]??'';
   return exists(own)?own:'tr_nacionalgenerico';}
  default:return FIXED[c.class]??'';
 }
}
export interface TrophyRecord {season:number;competitionKind:number;competitionSubkind:number;competition?:string;clubId?:string;}
export interface GalleryCard {competition?:string;count:number;seasons:number[];}
/** `club_gallery`: máximo 16 cartões, uma edição por temporada, último primeiro. */
export function clubGallery(trophies:readonly TrophyRecord[],nationalTeam:boolean,confederation:number):GalleryCard[] {
 const out:GalleryCard[]=[];
 const add=(kind:number,sub?:number)=>{
  const card:GalleryCard={count:0,seasons:[]};let last=-1;
  for(const t of [...trophies].reverse())if(t.competitionKind===kind&&(sub===undefined||t.competitionSubkind===sub)&&t.season!==last){
   card.count++;card.seasons.push(t.season);card.competition=t.competition;last=t.season;
  }
  if(card.count>0&&out.length<16)out.push(card);
 };
 if(nationalTeam){add(7,7);add(7,confederation);if(confederation===0)add(14,0);
  else if(confederation===4)add(14,4);if(confederation===0||confederation===1)add(13);
 }else{add(5);for(const k of [4,6,12,8])add(k);add(1,1);add(2);add(11);
  for(let i=2;i<=4;i++)add(1,i);add(10);for(let i=1;i<=4;i++)add(3,i);}
 return out;
}
export interface CoachTrophy extends TrophyRecord {clubId?:string;}
export interface CoachTitle {season:number;competition:string;club?:string;}
export interface NationalEdition {season:number;championCoach:number;competition:string;club?:string;}
/** `coach_gallery`: 3 colunas internacional/nacional/estadual. */
export function coachGallery(coachGameId:number,trophies:readonly CoachTrophy[],editions:Readonly<Record<string,readonly NationalEdition[]>>):[CoachTitle[],CoachTitle[],CoachTitle[]] {
 const cols:[CoachTitle[],CoachTitle[],CoachTitle[]]=[[],[],[]];
 for(const cl of ['WorldCup','NationsLeagueM','NationsLeagueN','EuropeanChampionship','CopaAmerica','AfricaCupOfNations',
  'AsianCup','GoldCup','OceaniaNationsCup','Finalissima']){
  for(const e of editions[cl]??[])if(e.championCoach>=0&&e.championCoach===coachGameId)cols[0].push({season:e.season,competition:e.competition,club:e.club});
 }
 const add=(col:0|1|2,kind:number,division?:number)=>{
  for(const t of [...trophies].reverse())if(t.competitionKind===kind&&(division===undefined||t.competitionSubkind===division)&&t.competition){
   cols[col].push({season:t.season,competition:t.competition,club:t.clubId});
  }
 };
 for(const k of [5,4,6,12,8])add(0,k);
 add(1,1,1);add(1,2);add(1,11);for(let d=2;d<=4;d++)add(1,1,d);
 add(2,10);for(let d=1;d<=4;d++)add(2,3,d);
 return cols;
}
