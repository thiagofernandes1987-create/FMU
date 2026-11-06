/**
 * M28 — exact arithmetic wrappers over crates/model/src/world.rs methods:
 * `club_wages`, `club_income`, `club_payment`, `club_expense`.
 * Entrada: RustWorld, ClubId arena index and i32/i64 amounts. Side effects on
 * `Club.cash` and, exclusively for human clubs, `Club.finances` categories.
 * Importante: the original does not automatically credit/debit AI clubs for
 * transfer operations, and this model-level finance wrapper does not infer
 * treasury taxes or FMU economic policy. `bigint` preserves i64 precision.
 */
import {RustWorld} from '../m27/persistence/bfn_world';
import {CborRecord,CborValue} from '../m26/persistence/cbor';
const MIN64=-(1n<<63n),MAX64=(1n<<63n)-1n;
function amountI32(x:number):number {
 if(!Number.isInteger(x)||x<-2147483648||x>2147483647)throw RangeError('Expected i32 amount');return x;
}
function amountI64(x:number|bigint):bigint {
 const n=typeof x==='bigint'?x:Number.isSafeInteger(x)?BigInt(x):undefined;
 if(n===undefined||n<MIN64||n>MAX64)throw RangeError('Expected i64 amount');return n;
}
function valueI64(v:CborValue):bigint {
 if(typeof v==='bigint')return amountI64(v);
 if(typeof v==='number'&&Number.isSafeInteger(v))return amountI64(v);
 throw RangeError('Invalid money integer');
}
function checkedAdd(x:bigint,y:bigint):bigint{const z=x+y;if(z<MIN64||z>MAX64)throw RangeError('i64 balance overflow');return z;}
function checkedI32(x:number,y:number):number{
 const z=x+y;if(!Number.isSafeInteger(z)||z<-2147483648||z>2147483647)throw RangeError('i32 finance overflow');return z;
}
function clubAt(w:RustWorld,clubIndex:number):CborRecord {
 if(!Number.isInteger(clubIndex)||clubIndex<0||clubIndex>=w.clubs.length)throw RangeError('Invalid ClubId');
 return w.clubs[clubIndex]!;
}
function finances(c:CborRecord):CborRecord {
 const f=c.finances;if(!f||typeof f!=='object'||Array.isArray(f)||f instanceof Uint8Array||f instanceof Map||'tag' in f)throw Error('Missing ClubFinances');
 return f;
}
function update(c:CborRecord,amount:bigint,direction:1|-1,key?:string):void{
 const cash=checkedAdd(valueI64(c.cash),direction===1?amount:-amount);
 const f=c.human===true?finances(c):undefined;
 let newFinance:bigint|number|undefined;
 if(f&&key){
  if(['expense_transfers','income_transfers','expense_salaries'].includes(key))newFinance=checkedAdd(valueI64(f[key]),amount);
  else {const n=f[key];if(typeof n!=='number'||!Number.isInteger(n))throw Error('Invalid finance category '+key);
   newFinance=checkedI32(n,Number(amount));}
 }
 c.cash=cash;
 if(f&&key)f[key]=newFinance!;
}
/** `World::club_wages`: sums first-team and youth salaries into an i64. */
export function worldClubWages(w:RustWorld,index:number):bigint {
 const c=clubAt(w,index);let total=0n;
 for(const raw of [...(c.squad as CborValue[]),...(c.youth_squad as CborValue[])]){
  const id=typeof raw==='bigint'?Number(raw):raw;
  if(typeof id!=='number'||!Number.isSafeInteger(id)||id<0||id>=w.players.length)throw RangeError('Invalid wage PlayerId');
  total=checkedAdd(total,BigInt(amountI32(Number(w.players[id]!.salary))));
 }
 return total;
}
/** `World::club_income`: only human clubs track kind 1/3/5/6/9. */
export function worldClubIncome(w:RustWorld,index:number,amount:number,kind:number):void{
 amountI32(amount);const key=({1:'income_transfers',3:'income_type3',5:'income_type5',6:'income_type6',9:'income_type9'} as Record<number,string>)[kind];
 update(clubAt(w,index),BigInt(amount),1,key);
}
/** `World::club_payment`: only human clubs track kinds 1/4/7/8; rest expense_other. */
export function worldClubPayment(w:RustWorld,index:number,amount:number,kind:number):void{
 amountI32(amount);const key=({1:'expense_transfers',4:'expense_type4',7:'expense_type7',8:'expense_type8'} as Record<number,string>)[kind]??'expense_other';
 update(clubAt(w,index),BigInt(amount),-1,key);
}
/** `World::club_expense`: human wage bookkeeping with exact i64. */
export function worldClubExpense(w:RustWorld,index:number,amount:bigint|number):void{
 update(clubAt(w,index),amountI64(amount),-1,'expense_salaries');
}
