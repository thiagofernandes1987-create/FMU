/** M26 — Save BFN real (header + Zstd + CBOR) e regras de segurança. */
declare function require(name:string):any;
const test=require('node:test'),assert=require('node:assert/strict'),zlib=require('node:zlib');
import {decodeCbor,encodeCbor,CborValue} from '../src/m26/persistence/cbor';
import {readBfnPayload,writeBfnPayload,summarizeBfnPayload} from '../src/m26/persistence/bfn_codec';
import {BFN_FORMAT_VERSION,decodeBfnHeader,encodeBfnHeader} from '../src/m22/persistence/native';
const meta={app_version:'m26',club:'Clube Exemplo',coach:'Técnico',date:'2031-03-15',season:2031,saved_at:0,imported_from:null,format_version:3};
function roundTrip(value:CborValue):CborValue {return decodeCbor(encodeCbor(value));}
test('M26 CBOR: mapa, arrays, strings UTF-8, booleanos, negativos, bytes e zeros',()=>{
 const x={club:'Atlético É',players:[1,0,-4,true,false,null],bytes:Uint8Array.from([0,1,254,255]),map:{cash:123,pi:3.14}};
 const y=roundTrip(x) as typeof x;assert.equal(y.club,x.club);assert.deepEqual(y.players,x.players);assert.deepEqual(y.bytes,x.bytes);
 assert.equal(y.map.cash,123);assert.equal(y.map.pi,3.14);
});
test('M26 CBOR: i64 bigint preserva exatidão',()=>{
 const x=9007199254740995n;assert.equal(roundTrip(x),x);assert.equal(roundTrip(-x),-x);
});
test('M26 CBOR: tags e mapas com chaves não textuais',()=>{
 const x={tag:42n,value:new Map<CborValue,CborValue>([[2,'dois'],['três',3]])};
 const y=roundTrip(x) as typeof x;assert.equal(y.tag,42n);assert.ok(y.value instanceof Map);
 assert.equal(y.value.get(2),'dois');assert.equal(y.value.get('três'),3);
});
test('M26 CBOR: chunk UTF-8 inválido é recusado',()=>{
 assert.throws(()=>decodeCbor(Uint8Array.from([0x7f,0x62,0x6f,0x6c,0x61,0xc3,0xff])),/utf-8/);
});
test('M26 CBOR: strings/chunks indefinidos válidos',()=>{
 assert.equal(decodeCbor(Uint8Array.from([0x7f,0x62,0x6f,0x6b,0x62,0x61,0x79,0xff])),'okay');
 assert.deepEqual(decodeCbor(Uint8Array.from([0x9f,1,2,0xff])),[1,2]);
 assert.equal((decodeCbor(Uint8Array.from([0xbf,0x61,0x61,1,0xff])) as Record<string,CborValue>).a,1);
});
test('M26 CBOR: float16, float32, float64',()=>{
 assert.equal(decodeCbor(Uint8Array.from([0xf9,0x3c,0x00])),1);
 assert.equal(decodeCbor(Uint8Array.from([0xfa,0x3f,0x80,0x00,0x00])),1);
 assert.equal(decodeCbor(Uint8Array.from([0xfb,0x3f,0xf0,0,0,0,0,0,0])),1);
});
test('M26 CBOR: nomes de campos perigosos não contaminam Object.prototype',()=>{
 const data=decodeCbor(Uint8Array.from([0xa1,0x69,95,95,112,114,111,116,111,95,95,0xf5])) as Record<string,CborValue>;
 assert.equal(Object.getPrototypeOf(data),null);assert.equal(Object.getPrototypeOf({}).hasOwnProperty('toString'),true);
 assert.equal(Object.hasOwn(data,'__proto__'),true);
});
test('M26 CBOR: documento truncado ou bytes extras são recusados',()=>{
 assert.throws(()=>decodeCbor(Uint8Array.from([0x64,0x6f])),/Truncated/);
 assert.throws(()=>decodeCbor(Uint8Array.from([0,0])),/Trailing/);
 assert.throws(()=>decodeCbor(Uint8Array.from([0xff])),/break/);
});
test('M26 CBOR: chaves repetidas e chunk misturado são recusados',()=>{
 assert.throws(()=>decodeCbor(Uint8Array.from([0xa2,0x61,0x61,1,0x61,0x61,2])),/Duplicate/);
 assert.throws(()=>decodeCbor(Uint8Array.from([0x7f,0x41,0x00,0xff])),/chunk/);
});
test('M26 CBOR: limites de profundidade, item e entrada',()=>{
 assert.throws(()=>decodeCbor(Uint8Array.from([0x81,0x81,1]),{maxDepth:1}),/nesting/);
 assert.throws(()=>decodeCbor(Uint8Array.from([0x82,1,2]),{maxItems:2}),/item limit/);
 assert.throws(()=>decodeCbor(Uint8Array.from([1,2]),{maxInputBytes:1}),/too large/);
});
test('M26 CBOR: valores não finitos não são exportados como JSON silenciosamente',()=>{
 assert.throws(()=>encodeCbor(Number.POSITIVE_INFINITY),/non-finite/);
 assert.throws(()=>encodeCbor(1n<<100n),/out of range/);
});
test('M26 BFN: preserva envelope de metadados Rust + frame zstd CBOR',()=>{
 const payload={game:{players:[1,2,3],season:2031,day:11},players:[{name:'São Paulo',salary:15000}],mods:{}};
 const packed=writeBfnPayload(meta,payload);
 const h=decodeBfnHeader(packed);
 assert.equal(h.meta.format_version,BFN_FORMAT_VERSION);assert.equal(h.meta.club,meta.club);
 assert.deepEqual(Array.from(h.payload.subarray(0,4)),[0x28,0xb5,0x2f,0xfd]); // zstd magic
 const result=readBfnPayload(packed);assert.equal(result.worldLoaded,false);assert.equal(result.migrationRequired,false);
 assert.equal(JSON.stringify(result.payload),JSON.stringify(payload));
 assert.deepEqual(summarizeBfnPayload(result).topFields,['game','mods','players']);
});
test('M26 BFN: zstd payload exportado é aceito por decoder zlib independente',()=>{
 const original={hello:'world'};const bytes=writeBfnPayload(meta,original);
 assert.deepEqual({...decodeCbor(zlib.zstdDecompressSync(decodeBfnHeader(bytes).payload)) as Record<string,unknown>},original);
});
test('M26 BFN: metadados v2 exigem migração e não afirmam carregar World',()=>{
 const h=encodeBfnHeader({...meta,format_version:2});
 // encodeBfnHeader normaliza para v3; simula header legado válido sem alterar o codec.
 const json=new TextEncoder().encode('BFNX'+JSON.stringify({...meta,format_version:2}));
 const legacy=new Uint8Array(8+json.length);new DataView(legacy.buffer).setUint32(0,0x184d2a50,true);
 new DataView(legacy.buffer).setUint32(4,json.length,true);legacy.set(json,8);
 const cb=encodeCbor({game:{season:2026}}),z=zlib.zstdCompressSync(cb);
 const all=new Uint8Array(legacy.length+z.length);all.set(legacy);all.set(z,legacy.length);
 const result=readBfnPayload(all);assert.equal(result.migrationRequired,true);
 assert.equal(result.worldLoaded,false);assert.equal(result.meta.format_version,2);
 assert.ok(h.length>8);
});
test('M26 BFN: rejeita payload sem zstd e metadados de versão futura',()=>{
 const broken=new Uint8Array([...encodeBfnHeader(meta),1,2,3,4,5]);
 assert.throws(()=>readBfnPayload(broken),/zstd decode failed/);
 const futureJson=new TextEncoder().encode('BFNX'+JSON.stringify({...meta,format_version:45}));
 const bad=new Uint8Array(8+futureJson.length);new DataView(bad.buffer).setUint32(0,0x184d2a50,true);
 new DataView(bad.buffer).setUint32(4,futureJson.length,true);bad.set(futureJson,8);
 assert.throws(()=>readBfnPayload(bad),/future|format/i);
});
test('M26 BFN: CBOR inválido produz erro sem marcar mundo como carregado',()=>{
 const cb=zlib.zstdCompressSync(Uint8Array.from([0xa1]));
 const h=encodeBfnHeader(meta),x=new Uint8Array(h.length+cb.length);x.set(h);x.set(cb,h.length);
 assert.throws(()=>readBfnPayload(x),/Truncated/);
});
