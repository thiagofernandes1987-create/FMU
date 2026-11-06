/** M21 — crates/model/src/templates.rs: DTOs de templates de clube e liga.
 * Os arrays são copiados ao construir defaults; conteúdo do banco privado não é incluído. */
export interface PlayerTemplate{name:string;star:boolean;country:number;age:number;position:number;status:number;trait1:number;trait2:number;side:number;hash:number;worldClass:boolean;tid:number;sid:number;aid:number;}
export interface TeamTemplate{fileRef:string;valid:boolean;id:number;country:number;state:number;level:number;name:string;stadium:string;capacity:number;coach:string;coachCountry:number;players:PlayerTemplate[];youth:PlayerTemplate[];reputation:number;baseColor:number;tid:number;sid:number;aid:number;vid:number;color1:string;color2:string;classicRivals:string[];}
export interface LeagueConfig{country:number;division:number;formula:number;tiebreak:number;teams:number;twoRounds:boolean;groups:number;gamesWithinGroup:boolean;relegatedByGroup:boolean;knockoutTeams:number;valid:boolean;relegated:number;twoLeggedKnockout:boolean[];qualifyByOverallTable:boolean;bestThirdPlaces:boolean;name?:string;divisionName?:string;relegationPlayoff:number;twoLeggedRelegationPlayoff:boolean[];twoLeggedPromotionKnockout:boolean[];promotionPlaces:number;relegatedDirectly:number;fileVersion:number;}
export interface StateLeagueConfig{state:number;division:number;formula:number;relegated:number;tiebreak:number;twoLeggedFinals:[number,number,number];}
/** `Default for LeagueConfig`, fiel a 27 campos do Rust. */
export function defaultLeagueConfig():LeagueConfig{return {country:-1,division:-1,formula:0,tiebreak:0,teams:0,
 twoRounds:true,groups:0,gamesWithinGroup:true,relegatedByGroup:false,knockoutTeams:0,
 valid:false,relegated:2,twoLeggedKnockout:Array(7).fill(true),qualifyByOverallTable:false,
 bestThirdPlaces:false,relegationPlayoff:0,twoLeggedRelegationPlayoff:Array(3).fill(false),
 twoLeggedPromotionKnockout:Array(3).fill(false),promotionPlaces:0,relegatedDirectly:2,fileVersion:0};}
/** `Default for StateLeagueConfig`. */
export function defaultStateLeagueConfig():StateLeagueConfig{return {state:-1,division:-1,formula:0,relegated:2,tiebreak:0,twoLeggedFinals:[2,2,2]};}
