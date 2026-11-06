/**
 * M28 — safe transactional subset of simulation/src/market.rs::move_player.
 * Inputs: validated WorldDocument, player/club arena IDs, fee i32 and date hooks.
 * Output: a NEW WorldDocument, transfer record, no mutation of input; callers
 * use M27 writeBfnWorldAtomic to persist and replay. No fictitious clubs.
 * Effects: update player club/price/contract/shirt, remove from seller squad,
 * add to buyer squad, clear seller takers, update ONLY human club cash+finances,
 * append Transfer (source Rust only human finances are moved here).
 * Prohibits human→human transfers because original Rust `unported!`.
 * Non-parity safety guards: seller must actually own the player, must not
 * be on loan, buyer must have capacity and enough cash, and fee must be non-negative i32.
 * No AI replacement player, national-team movement or loan simulation.
 */
import {WorldDocument,RustWorld} from '../m27/persistence/bfn_world';
import {worldTransaction} from '../m27/persistence/world_access';
import {worldClubIncome,worldClubPayment} from './world_finances';
import {CborRecord,CborValue} from '../m26/persistence/cbor';
const MILLIS_PER_DAY=86_400_000n,MIN64=-(1n<<63n),MAX64=(1n<<63n)-1n;
function number(v:CborValue,path:string):number {
 if(typeof v==='number'&&Number.isSafeInteger(v))return v;
 if(typeof v==='bigint'&&v>=BigInt(Number.MIN_SAFE_INTEGER)&&v<=BigInt(Number.MAX_SAFE_INTEGER))return Number(v);
 throw Error(`Invalid integer ${path}`);
}
function club(w:RustWorld,id:number):CborRecord{
 if(!Number.isSafeInteger(id)||id<0||id>=w.clubs.length)throw RangeError('Invalid ClubId');return w.clubs[id]!;
}
function player(w:RustWorld,id:number):CborRecord{
 if(!Number.isSafeInteger(id)||id<0||id>=w.players.length)throw RangeError('Invalid PlayerId');return w.players[id]!;
}
export interface WorldTransferDate{year:number;month:number;day:number}
export interface WorldTransferHooks {
 /** Runtime Clock.fields(World.today_millis()), month is 0-based. */
 dateFields(epochMillis:bigint):WorldTransferDate;
}
export interface WorldTransferResult{document:WorldDocument;fromClubId:number;toClubId:number;playerId:number;fee:number;transferIndex:number;}
/** Transaction: abort before commit on reference, money or contract errors. */
export function transferWorldPlayer(doc:WorldDocument,playerId:number,toClubId:number,fee:number,hooks:WorldTransferHooks):WorldTransferResult {
 if(!Number.isSafeInteger(fee)||fee<0||fee>0x7fffffff)throw RangeError('Invalid i32 transfer fee');
 let fromClubId=-1,transferIndex=-1;
 const result=worldTransaction(doc,w=>{
  const p=player(w,playerId),to=club(w,toClubId),from=number(p.club,'player.club');
  const seller=club(w,from);fromClubId=from;
  if(from===toClubId)throw Error('Player already belongs to destination club');
  if(seller.human===true&&to.human===true)throw Error('Rust unported: human-to-human World transfer');
  if(p.on_loan===true)throw Error('On-loan player transfer needs loan resolution');
  if(p.youth===true)throw Error('Youth transfer requires Rust transfer_youth handler');
  const nationalTeams=new Set(w.countries.map(c=>c.national_team).filter(x=>x!==null&&x!==undefined));
  if(nationalTeams.has(from)||nationalTeams.has(toClubId))throw Error('National-team registrations cannot be sold as club ownership');
  if(!Array.isArray(seller.squad)||!Array.isArray(to.squad))throw Error('Invalid squad data');
  const fromSquad=seller.squad as CborValue[],toSquad=to.squad as CborValue[];
  if(fromSquad.filter(x=>x===playerId).length!==1)throw Error('Ownership mismatch: player must occur exactly once in seller squad');
  if(toSquad.includes(playerId))throw Error('Player already in destination squad');
  if(toSquad.length>=35)throw Error('Destination squad exceeds Rust limit');
  if(to.human===true){
   const balance=to.cash;const money=typeof balance==='bigint'?balance:
    typeof balance==='number'&&Number.isSafeInteger(balance)?BigInt(balance):undefined;
   if(money===undefined||money<BigInt(fee))throw Error('Insufficient cash for purchase: safety preflight');
  }
  const date=w.game.days as CborRecord[],day=number(w.game.day,'game.day');
  const now=date[day]?.date;if(now===undefined)throw Error('No playable calendar day for transfer');
  const when=BigInt(number(now,'day.date'));
  const fields=hooks.dateFields(when);
  if(!Number.isInteger(fields.year)||!Number.isInteger(fields.month)||!Number.isInteger(fields.day)||
    fields.month<0||fields.month>11||fields.day<1||fields.day>31)throw RangeError('Invalid Clock.fields date');
  const fromGameId=number(seller.id,'seller.id'),toGameId=number(to.id,'buyer.id');
  const current=BigInt(number(p.contract_until,'player.contract_until'));
  const next=when+180n*MILLIS_PER_DAY;
  if(current<MIN64||next<MIN64||next>MAX64)throw RangeError('Contract i64 overflow');
  // Model::extend_contract(from_today=true) and market::move_player side effects.
  p.previous_club=fromGameId;p.club=toClubId;p.shirt_number=0;
  p.listed_for_loan=false;p.listed_for_sale=false;p.contract_until=next;p.price=p.market_value;
  // Market::move_player only touches human cash here. Preserves Rust behavior even
  // though FMU's independent economy may apply treasury fees elsewhere.
  if(seller.human===true)worldClubIncome(w,from,fee,1);
  if(to.human===true)worldClubPayment(w,toClubId,fee,1);
  for(const key of ['captain','penalty_taker'] as const)if(seller[key]===playerId)seller[key]=null;
  fromSquad.splice(fromSquad.indexOf(playerId),1);toSquad.push(playerId);
  if(!Array.isArray(w.game.transfers))throw Error('Missing transfer history');
  transferIndex=w.game.transfers.length;
  w.game.transfers.push({player:playerId,day:fields.day,month:fields.month+1,year:fields.year,
   from_club:fromGameId,to_club:toGameId,fee,player_list:-1,player_number:-1});
 });
 return {document:result,fromClubId,toClubId,playerId,fee,transferIndex};
}
