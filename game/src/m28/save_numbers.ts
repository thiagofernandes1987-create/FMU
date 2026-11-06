/**
 * M28: port explícito de crates/model/src/save_numbers.rs.
 * API pura: entrada RustWorld, saída plano ou cópia validada via worldTransaction.
 * Dependências: World CBOR do M27, Arena IDs como índices u32, sem renumeração.
 * Efeitos: reatribui `Player.save_number` e `save_list`, atualiza campos `Transfer`,
 *   `Competition.legacy_id` e `CompetitionStats.competition_number/id`.
 * Os métodos são usados ANTES do save e DEPOIS do load no código Rust original.
 * Aposentados conservam números antigos; os campos auxiliares não garantem ligação
 *   a aposentados após reabrir (comportamento deliberado da fonte Rust).
 * Referência: tests/m28_save_numbers.test.ts.
 */
import {RustWorld,WorldDocument} from '../m27/persistence/bfn_world';
import {worldTransaction} from '../m27/persistence/world_access';
import {CborRecord,CborValue} from '../m26/persistence/cbor';
function id(value:CborValue):number|undefined {
 if(typeof value==='number'&&Number.isSafeInteger(value)&&value>=0)return value;
 if(typeof value==='bigint'&&value>=0n&&value<=0xffffffffn)return Number(value);
 return undefined;
}
function int(value:CborValue):number|undefined{
 if(typeof value==='number'&&Number.isSafeInteger(value))return value;
 if(typeof value==='bigint'&&value>=BigInt(Number.MIN_SAFE_INTEGER)&&value<=BigInt(Number.MAX_SAFE_INTEGER))return Number(value);
 return undefined;
}
function object(value:CborValue,path:string):CborRecord {
 if(!value||typeof value!=='object'||Array.isArray(value)||value instanceof Uint8Array||value instanceof Map||'tag' in value)throw Error(`Expected struct at ${path}`);
 return value;
}
function list(value:CborValue,path:string):CborValue[]{if(!Array.isArray(value))throw Error(`Expected list at ${path}`);return value;}
function arenaIndex(value:CborValue,n:number,what:string):number {
 const i=id(value);if(i===undefined||i>=n)throw Error(`Invalid ${what} arena index ${String(value)}`);return i;
}
/** `World::number_players_for_save` — all main players then youth get sequential numbers. */
export function numberPlayersForSave(w:RustWorld):{players:number;transfers:number} {
 let number=0;
 for(const [kind,source] of [[1,w.game.players],[2,w.game.youth_players]] as const){
  for(const ref of list(source,'Game player lists')){
   const i=arenaIndex(ref,w.players.length,'player');const p=object(w.players[i]!,`players[${i}]`);
   if(number>0x7fffffff)throw Error('Save number overflow');
   p.save_number=number++;p.save_list=kind;
  }
 }
 let transfers=0;
 for(const raw of list(w.game.transfers,'Game.transfers')){
  const t=object(raw,'game.transfers[]');
  if(t.player!==null&&t.player!==undefined){
   const i=arenaIndex(t.player,w.players.length,'transfer player'),p=w.players[i]!;
   t.player_number=int(p.save_number)??-1;t.player_list=int(p.save_list)??-1;
  }else t.player_number=-1;
  transfers++;
 }
 return {players:number,transfers};
}
/** Original `World::save_numbers`: FIRST player for a duplicated (list, number) pair wins. */
export function indexPlayersBySaveNumber(w:RustWorld):Map<string,number> {
 const result=new Map<string,number>();
 for(const [kind,source] of [[1,w.game.players],[2,w.game.youth_players]] as const){
  for(const ref of list(source,'Game player lists')){
   const i=arenaIndex(ref,w.players.length,'player'),n=int(w.players[i]!.save_number);
   if(n!==undefined&&n>=0){const key=`${kind}:${n}`;if(!result.has(key))result.set(key,i);}
  }
 }
 return result;
}
/** `World::relink_transfers` — resets ALL transient refs before linking, including misses. */
export function relinkTransfersFromSaveNumbers(w:RustWorld):{relinked:number;unresolved:number} {
 const keys=indexPlayersBySaveNumber(w);
 let relinked=0,unresolved=0;
 for(const raw of list(w.game.transfers,'Game.transfers')){
  const t=object(raw,'game.transfers[]');t.player=null;
  const n=int(t.player_number),kind=int(t.player_list);
  const ref=n===undefined||kind===undefined?undefined:keys.get(`${kind}:${n}`);
  if(ref!==undefined){t.player=ref;relinked++;}else unresolved++;
 }
 return {relinked,unresolved};
}
/** `World::relink_transfer` — one transfer, does NOT reset the reference if there is no match. */
export function relinkOneTransfer(w:RustWorld,transferIndex:number):boolean {
 const all=list(w.game.transfers,'Game.transfers');
 if(!Number.isSafeInteger(transferIndex)||transferIndex<0||transferIndex>=all.length)throw RangeError('Invalid transfer index');
 const t=object(all[transferIndex]!,'game.transfers[]'),n=int(t.player_number),kind=int(t.player_list);
 if(n===undefined||n<0||(kind!==1&&kind!==2))return false;
 const players=kind===1?w.game.players:w.game.youth_players;
 for(const ref of list(players,'Game player lists')){
  const i=arenaIndex(ref,w.players.length,'player');
  if(int(w.players[i]!.save_number)===n){t.player=i;return true;}
 }
 return false;
}
/** Original `calendar_competitions`: first appearance order, not arena order. */
export function calendarCompetitions(w:RustWorld):number[]{
 const seen=new Set<number>(),out:number[]=[];
 for(const raw of list(w.game.days,'Game.days')){
  const day=object(raw,'game.days[]');
  for(const ref of list(day.competitions,'day.competitions')){
   const i=arenaIndex(ref,w.competitions.length,'competition');
   if(!seen.has(i)){seen.add(i);out.push(i);}
  }
 }
 return out;
}
/** `World::link_competition_stats`: first calendar record on duplicate legacy number wins. */
export function linkCompetitionStats(w:RustWorld):number {
 const byLegacy=new Map<number,number>();
 for(const idx of [...calendarCompetitions(w)].reverse()){
  const n=int(w.competitions[idx]!.legacy_id);if(n!==undefined)byLegacy.set(n,idx);
 }
 let linked=0;
 for(const ref of list(w.game.players,'game.players')){
  const p=w.players[arenaIndex(ref,w.players.length,'player')]!;
  for(const raw of list(p.competition_stats,'player.competition_stats')){
   const st=object(raw,'player.competition_stats[]'),n=int(st.competition_number);
   if(n!==undefined&&n>=0){const c=byLegacy.get(n);if(c!==undefined){st.competition_id=c;linked++;}}
  }
 }
 return linked;
}
/** `World::number_competitions_for_save`: order→legacy IDs; then clear and relink. */
export function numberCompetitionsForSave(w:RustWorld):{competitions:number;statsLinked:number} {
 const ordered=calendarCompetitions(w);
 ordered.forEach((i,n)=>{w.competitions[i]!.legacy_id=n;});
 for(const ref of list(w.game.players,'game.players')){
  const p=w.players[arenaIndex(ref,w.players.length,'player')]!;
  for(const raw of list(p.competition_stats,'player.competition_stats')){
   const stat=object(raw,'competition_stats[]');
   if(stat.competition_id!=null){const c=arenaIndex(stat.competition_id,w.competitions.length,'competition');
    const legacy=int(w.competitions[c]!.legacy_id);if(legacy!==undefined&&legacy>=0)stat.competition_number=legacy;
   }
  }
 }
 for(const p of w.players)for(const raw of list(p.competition_stats,'player.competition_stats'))object(raw,'competition_stats[]').competition_id=null;
 return {competitions:ordered.length,statsLinked:linkCompetitionStats(w)};
}
/** Atomic COW: neither numbering nor relinking changes the loaded document on failure. */
export function prepareWorldForSave(doc:WorldDocument):WorldDocument {
 return worldTransaction(doc,w=>{numberPlayersForSave(w);numberCompetitionsForSave(w);});
}
