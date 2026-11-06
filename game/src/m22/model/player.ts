/** Fonte: model/src/player.rs. Fisiologia, estatísticas e suspensões individuais.
 * Entrada/saída: objetos explícitos, sem dependência da arena; funções mutáveis alteram apenas jogador passado. */
export interface CardStats{yellowCards:number;redCards:number;ratedGames:number;ratingSum:number;}
/** `CompetitionStats::is_suspended` / `serve_suspension`: prioridade aos amarelos. */
export function isSuspended(s:CardStats):boolean{return s.yellowCards>=3||s.redCards>=1;}
export function serveSuspension(s:CardStats):void{if(s.yellowCards>=3)s.yellowCards=0;else if(s.redCards>=1)s.redCards--;}
/** `CompetitionStats::add_rating` soma qualquer nota; `SeasonStats` só aceita >=2. */
export function addRating(s:CardStats,rating:number,season=false):void{if(!season||rating>=2){s.ratedGames++;s.ratingSum+=rating;}}
export function averageRating(s:CardStats,season=false):number|undefined{return s.ratedGames>0?s.ratingSum/s.ratedGames:season?undefined:0;}
export interface PlayerCondition{age:number;fitness:number;youth:boolean;startedRecently:boolean;star:boolean;worldClass:boolean;potential:number;side:number;strength:number;}
/** `set_age`: inválidos viram 18 (base) ou 35 (profissional). */
export function setAge(p:PlayerCondition,age:number):void{p.age=p.youth?(age>=16&&age<=20?age:18):(age>=16&&age<=48?age:35);}
/** `set_star`, `set_potential`, `set_side`. */
export function setStar(p:PlayerCondition,star:boolean):void{p.star=star||p.worldClass;}
export function setPotential(p:PlayerCondition,n:number):void{p.potential=p.star&&n>8?10:n;}
export function setSide(p:PlayerCondition,n:number):void{p.side=n===0?0:1;}
/** `tire` e `recover`: Rust aceita fitness negativo prévio e fixa 1 quando cruza zero. */
export function tire(p:PlayerCondition,amount:number):void{p.fitness-=amount;if(p.fitness<0)p.fitness=1;}
export function recover(p:PlayerCondition,amount:number):void{p.fitness=Math.min(100,p.fitness+amount);}
/** `tire_after_match` por faixas de idade. */
export function tireAfterMatch(p:PlayerCondition):void{tire(p,p.age<=20?1:p.age<=25?2:p.age<=31?3:p.age<=36?4:5);}
/** `recover_between_matches`: versão completa de faixas para humanClub. */
export function recoverBetweenMatches(p:PlayerCondition,human:boolean):void{
 const a=p.age;
 const n=p.startedRecently?(human?(a<=20?13:a<=25?24:a<=31?37:a<=36?40:30):(a<=20?20:a<=25?30:a<=31?50:a<=36?52:42)):(a<20?30:a<26?30:a<33?35:a<45?35:30);
 recover(p,n);
}
/** `effective_strength`: divisão inteira fitness/100 antes de multiplicar. */
export function effectiveStrength(p:PlayerCondition):number{return Math.trunc(p.fitness/100)*p.strength;}
