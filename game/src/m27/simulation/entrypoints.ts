/**
 * M27 — crates/simulation/src/lib.rs: `matchday_rivalry` + hook defaults.
 * Input: WorldDocument tipado com MatchId, ClubId e clássico fixo `tables.rs`.
 * Saída: boolean; efeitos: nenhum. Arena refs validadas no carregamento BFN.
 * Limite: `advance` e `advance_with` exigem motor+Runtime Rust completos;
 *   seus métodos ainda não possuem tradução integral. Não chamar o sandbox M24
 *   como se fosse a engine de simulação Rust.
 */
import {CLASSIC_DERBIES} from '../../simulation/generated/tables';
import {WorldDocument,worldArenaObject} from '../persistence/bfn_world';
function integerRef(v:unknown):number|undefined {
 if(typeof v==='number'&&Number.isSafeInteger(v)&&v>=0)return v;
 if(typeof v==='bigint'&&v>=0n&&v<=BigInt(Number.MAX_SAFE_INTEGER))return Number(v);
 return undefined;
}
/** `I.ic()` — returns false if a fixture lacks teams/files, checks declared rivals in both directions. */
export function matchdayRivalry(doc:WorldDocument,matchId:number):boolean {
 const match=worldArenaObject(doc,'matches',matchId);
 const h=integerRef(match.home),a=integerRef(match.away);
 if(h===undefined||a===undefined)return false;
 const home=worldArenaObject(doc,'clubs',h),away=worldArenaObject(doc,'clubs',a);
 const from=home.file_ref,to=away.file_ref;
 if(typeof from!=='string'||typeof to!=='string'||!from||!to)return false;
 const hr=home.classic_rivals,ar=away.classic_rivals;
 if(Array.isArray(hr)&&hr.includes(to)||Array.isArray(ar)&&ar.includes(from))return true;
 return CLASSIC_DERBIES.some(pair=>pair[0]===from&&pair[1]===to||pair[0]===to&&pair[1]===from);
}
/** SimulationHooks defaults inherited from Rust `SimulationHooks` trait: no intervention. */
export interface SimulationHookDefaults {gameBuyer(drawn:number|undefined):number|undefined;
 approveSale(playerId:number,buyerId:number,fee:number):boolean;
 seasonEndScreen():void;}
export function noSimulationSystems():SimulationHookDefaults {
 return {gameBuyer:drawn=>drawn,approveSale:()=>true,seasonEndScreen:()=>{}};
}
/** Visible blocker for incomplete Rust `Sim::advance`, never silently execute demo logic. */
export function advanceOriginalWorld():never {
 throw new Error('M27: Rust Sim::advance is not ported. Real runtime and system callbacks required.');
}
