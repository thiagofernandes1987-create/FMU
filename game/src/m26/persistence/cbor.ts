/**
 * M26 — CBOR, subconjunto interoperável do `ciborium` de persistence/native.rs.
 * ENTRADA: bytes CBOR; SAÍDA: JSON-like ou bigint/tag/Map quando necessário.
 * CONTRATOS: limite de tamanho, nesting e itens; nunca executar código do save.
 * Preserva chaves desconhecidas, números de 64 bits como BigInt e tags opacas.
 * Não decodifica sozinho Zstd e NÃO substitui a validação tipada do World Rust.
 */
export interface CborRecord {[key:string]:CborValue;}
export interface CborMap extends Map<CborValue,CborValue> {}
export type CborValue = null|boolean|number|bigint|string|Uint8Array|CborValue[]|CborRecord|CborMap|CborTag|undefined;
export interface CborTag {tag:bigint;value:CborValue;}
export interface CborDecodeOptions {maxDepth?:number;maxItems?:number;maxInputBytes?:number;}
const DEFAULT={maxDepth:96,maxItems:1_000_000,maxInputBytes:64*1024*1024};
function isTag(x:unknown):x is CborTag {return !!x&&typeof x==='object'&&'tag' in x&&'value' in x;}
export function decodeCbor(bytes:Uint8Array,opts:CborDecodeOptions={}):CborValue {
 const config={...DEFAULT,...opts};
 if(!Number.isSafeInteger(config.maxDepth)||config.maxDepth<1||config.maxDepth>512||!Number.isSafeInteger(config.maxItems)||config.maxItems<1||!Number.isSafeInteger(config.maxInputBytes)||config.maxInputBytes<1)throw Error('Invalid CBOR limits');
 if(bytes.length>config.maxInputBytes)throw Error('CBOR input too large');
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),utf8=new TextDecoder('utf-8',{fatal:true});
 let pos=0,count=0;
 const eof=(length:number)=>{if(pos+length>bytes.length)throw Error('Truncated CBOR payload');};
 const readUint=(width:number):bigint=>{
  eof(width);let n=0n;for(let i=0;i<width;i++)n=(n<<8n)|BigInt(bytes[pos++]!);return n;
 };
 const size=(n:bigint):number=>{if(n>BigInt(Number.MAX_SAFE_INTEGER))throw Error('CBOR oversized length');return Number(n);};
 const integer=(n:bigint):number|bigint=>n<=BigInt(Number.MAX_SAFE_INTEGER)&&n>=BigInt(Number.MIN_SAFE_INTEGER)?Number(n):n;
 const BREAK=Symbol('CBOR_BREAK');
 function readArg(ai:number):bigint|undefined {
  if(ai<24)return BigInt(ai);
  if(ai===24)return readUint(1);if(ai===25)return readUint(2);if(ai===26)return readUint(4);if(ai===27)return readUint(8);
  if(ai===31)return undefined;
  throw Error('Invalid CBOR additional information');
 }
 function parse(depth:number):CborValue|typeof BREAK {
  if(depth>config.maxDepth)throw Error('CBOR nesting limit exceeded');
  if(++count>config.maxItems)throw Error('CBOR item limit exceeded');
  eof(1);const head=bytes[pos++]!,major=head>>5,ai=head&31;
  if(major===7&&ai===31)return BREAK;
  const arg=readArg(ai);
  if(major===0||major===1){if(arg===undefined)throw Error('Indefinite CBOR integer');return integer(major===0?arg:-arg-1n);}
  if(major===2||major===3){
   const parts:Uint8Array[]=[];
   if(arg===undefined){
    for(;;){const start=pos;eof(1);if(bytes[pos]===0xff){pos++;break;}
     const header=bytes[pos++]!,kind=header>>5,ai2=header&31;
     if(kind!==major)throw Error('CBOR indefinite string chunk has wrong type');
     const len=readArg(ai2);if(len===undefined)throw Error('Nested indefinite CBOR chunk');
     const n=size(len);eof(n);parts.push(bytes.subarray(pos,pos+n));pos+=n;
     if(start===pos)throw Error('Invalid CBOR chunk');
    }
   }else{const n=size(arg);eof(n);parts.push(bytes.subarray(pos,pos+n));pos+=n;}
   const length=parts.reduce((x,p)=>x+p.length,0);
   if(length>config.maxInputBytes)throw Error('CBOR string exceeds size limit');
   const out=new Uint8Array(length);let o=0;for(const p of parts){out.set(p,o);o+=p.length;}
   return major===3?utf8.decode(out):out;
  }
  if(major===4){const items:CborValue[]=[];if(arg!==undefined&&arg>BigInt(config.maxItems))throw Error('CBOR array length over limit');
   if(arg===undefined){for(;;){const v=parse(depth+1);if(v===BREAK)break;items.push(v);}}
   else for(let i=0;i<Number(arg);i++){const v=parse(depth+1);if(v===BREAK)throw Error('Unexpected CBOR break');items.push(v);}
   return items;
  }
  if(major===5){
   const entries:[CborValue,CborValue][]=[];
   if(arg!==undefined&&arg>BigInt(config.maxItems))throw Error('CBOR map length over limit');
   const one=()=>{const key=parse(depth+1);if(key===BREAK)throw Error('Unexpected CBOR map break');const val=parse(depth+1);if(val===BREAK)throw Error('Unexpected CBOR map break');entries.push([key,val]);};
   if(arg===undefined){for(;;){eof(1);if(bytes[pos]===255){pos++;break;}one();}}
   else for(let i=0;i<Number(arg);i++)one();
   if(entries.every(([k])=>typeof k==='string')){
    const record:Record<string,CborValue>=Object.create(null);
    for(const [k,v] of entries){if(Object.hasOwn(record,k as string))throw Error('Duplicate CBOR object key');record[k as string]=v;}
    return record;
   }
   return new Map(entries);
  }
  if(major===6){if(arg===undefined)throw Error('Invalid indefinite tag');const value=parse(depth+1);if(value===BREAK)throw Error('Unexpected CBOR break');return {tag:arg,value};}
  if(major===7){
   if(ai===20)return false;if(ai===21)return true;if(ai===22)return null;if(ai===23)return undefined;
   if(ai===24)return Number(arg);
   if(ai===25){const v=Number(arg);const s=(v&0x8000)?-1:1,e=(v>>10)&31,m=v&0x3ff;
    return e===0?s*2**(-14)*(m/1024):e===31?(m?NaN:s*Infinity):s*2**(e-15)*(1+m/1024);}
   if(ai===26){const buf=new DataView(new ArrayBuffer(4));buf.setUint32(0,Number(arg));return buf.getFloat32(0);}
   if(ai===27){const buf=new DataView(new ArrayBuffer(8));buf.setBigUint64(0,arg!);return buf.getFloat64(0);}
   if(ai<20)return ai;
  }
  throw Error('Unsupported CBOR major type');
 }
 const data=parse(0);if(data===BREAK)throw Error('Unexpected CBOR break');if(pos!==bytes.length)throw Error('Trailing bytes after CBOR value');return data;
}
/** CBOR encoder for canonical test fixtures and optional `.bfn` writing (no float loss). */
/** Optional lossless World mode writes IEEE-754 NaN/Inf/-0 without coercion.
 * Default mode retains the safer fixture behavior rejecting non-finite numbers. */
export function encodeCbor(value:CborValue, options:{allowNonFinite?:boolean}={}):Uint8Array {
 const out:number[]=[];
 const arg=(major:number,n:bigint)=>{
  if(n<0n||n>0xffffffffffffffffn)throw Error('CBOR integer out of range');
  if(n<24n){out.push((major<<5)|Number(n));return;}
  const width=n<=255n?1:n<=65535n?2:n<=0xffffffffn?4:8;
  out.push((major<<5)|({1:24,2:25,4:26,8:27}[width]));
  for(let shift=width-1;shift>=0;shift--)out.push(Number((n>>BigInt(shift*8))&255n));
 };
 const bytes=(buf:Uint8Array)=>{for(const b of buf)out.push(b);};
 function write(v:CborValue,depth:number):void {
  if(depth>128)throw Error('CBOR encode nesting limit');
  if(v===null){out.push(0xf6);return;}if(v===undefined){out.push(0xf7);return;}
  if(typeof v==='boolean'){out.push(v?0xf5:0xf4);return;}
  if(typeof v==='bigint'){v>=0n?arg(0,v):arg(1,-v-1n);return;}
  if(typeof v==='number'){
   if(!Number.isFinite(v)&&!options.allowNonFinite)throw Error('CBOR non-finite number');
   if(Number.isSafeInteger(v)&&!Object.is(v,-0)){const n=BigInt(v);n>=0n?arg(0,n):arg(1,-n-1n);return;}
   out.push(0xfb);const buf=new DataView(new ArrayBuffer(8));buf.setFloat64(0,v);bytes(new Uint8Array(buf.buffer));return;
  }
  if(typeof v==='string'){const buf=new TextEncoder().encode(v);arg(3,BigInt(buf.length));bytes(buf);return;}
  if(v instanceof Uint8Array){arg(2,BigInt(v.length));bytes(v);return;}
  if(Array.isArray(v)){arg(4,BigInt(v.length));for(const x of v)write(x,depth+1);return;}
  if(isTag(v)){arg(6,v.tag);write(v.value,depth+1);return;}
  if(v instanceof Map){arg(5,BigInt(v.size));for(const [k,x] of v){write(k,depth+1);write(x,depth+1);}return;}
  if(typeof v==='object'){
   const entries=Object.entries(v);arg(5,BigInt(entries.length));for(const [k,x] of entries){write(k,depth+1);write(x,depth+1);}return;
  }
  throw Error('Unsupported CBOR value');
 }
 write(value,0);if(out.length>64*1024*1024)throw Error('CBOR encoded payload too large');return Uint8Array.from(out);
}
