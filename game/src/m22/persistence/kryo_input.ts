/** Fonte: persistence/src/kryo/input.rs, codificação primitiva Kryo 4.0.2.
 * Dependências: Uint8Array, DataView; erros incluem offset; sem acesso ao save/IO externo.
 * Bytes e strings testados com vetores presentes nos testes Rust de origem. */
export class KryoInput22 {
 private cursor=0;constructor(private readonly bytes:Uint8Array){}
 get offset():number{return this.cursor;}
 isAtEnd():boolean{return this.cursor>=this.bytes.length;}
 private take(size:number):Uint8Array{if(this.cursor+size>this.bytes.length)throw Error('Kryo unexpected end at '+this.cursor);const p=this.bytes.subarray(this.cursor,this.cursor+size);this.cursor+=size;return p;}
 readByte():number{return (this.take(1)[0]!<<24)>>24;}
 readBoolean():boolean{return this.readUnsignedByte()===1;}
 readUnsignedByte():number{return this.take(1)[0]!;}
 readShort():number{const p=this.take(2);return new DataView(p.buffer,p.byteOffset,2).getInt16(0,false);}
 readChar():number{const p=this.take(2);return new DataView(p.buffer,p.byteOffset,2).getUint16(0,false);}
 readFixedInt():number{const p=this.take(4);return new DataView(p.buffer,p.byteOffset,4).getInt32(0,false);}
 readFixedLong():bigint{const p=this.take(8);return new DataView(p.buffer,p.byteOffset,8).getBigInt64(0,false);}
 /** Raw f32 bits keep NaN payloads when translating Kryo canonical streams. */
 readFloatBits():number{const p=this.take(4);return new DataView(p.buffer,p.byteOffset,4).getUint32(0,false);}
 /** Raw f64 bits keep NaN payloads when translating Kryo canonical streams. */
 readDoubleBits():bigint{const p=this.take(8);return new DataView(p.buffer,p.byteOffset,8).getBigUint64(0,false);}
 readFloat():number{const p=this.take(4);return new DataView(p.buffer,p.byteOffset,4).getFloat32(0,false);}
 readDouble():number{const p=this.take(8);return new DataView(p.buffer,p.byteOffset,8).getFloat64(0,false);}
 readVarInt(positive:boolean):number{
  let result=0;for(let shift=0;shift<=28;shift+=7){const b=this.readUnsignedByte();result|=(b&127)<<shift;if((b&128)===0)break;}
  return positive?result:(result>>>1)^-(result&1);
 }
 readVarLong(positive:boolean):bigint{
  let value=0n,more=true;
  for(let shift=0;shift<56;shift+=7){const b=this.readUnsignedByte();value|=BigInt(b&127)<<BigInt(shift);if((b&128)===0){more=false;break;}}
  if(more)value|=BigInt(this.readByte())<<56n;
  value=BigInt.asIntN(64,value);
  return positive?value:BigInt.asIntN(64,(BigInt.asUintN(64,value)>>1n)^(-(value&1n)));
 }
 /** `readString`: ASCII curta terminada pelo bit mais alto, ou contagem UTF-16 +1. */
 readString():string|null{
  const first=this.readUnsignedByte();
  if((first&0x80)===0){let out=String.fromCharCode(first);while(true){const b=this.readUnsignedByte();out+=String.fromCharCode(b&127);if((b&128)!==0)return out;}}
  let count=first&0x3f;
  if(first&0x40){for(let shift=6;shift<=27;shift+=7){const b=this.readUnsignedByte();count|=(b&127)<<shift;if((b&128)===0)break;}}
  if(count===0)return null;if(count===1)return '';
  // Prevent a hostile Kryo length prefix from allocating an excessive array.
  if(!Number.isSafeInteger(count)||count>1_000_001)throw Error('Kryo string length limit at '+this.cursor);
  const units:number[]=[];
  for(let i=0;i<count-1;i++){const b=this.readUnsignedByte();let cp=b;
   if(b>=0xc0&&b<0xe0){cp=((b&31)<<6)|(this.readUnsignedByte()&63);}
   else if(b>=0xe0&&b<0xf0){const b2=this.readUnsignedByte(),b3=this.readUnsignedByte();cp=((b&15)<<12)|((b2&63)<<6)|(b3&63);}
   else if(b>=0x80){cp=0xfffd;}
   units.push(cp);
  }
  // Avoid call-stack overflow when a valid Kryo string has many UTF-16 units.
  let value='';for(let i=0;i<units.length;i+=8192)value+=String.fromCharCode(...units.slice(i,i+8192));
  return value;
 }
}
