/** Differential-ready synthetic Kryo 4 stream fixtures; no claim of `.s22` parity. */
declare function require(name:string):any;
const test=require('node:test'),assert=require('node:assert/strict');
import {KryoSchema22} from '../src/m22/persistence/kryo_schema';
import {readKryoGraph} from '../src/m31/persistence/kryo_reader';
import {canonicalKryoGraph} from '../src/m31/persistence/kryo_canonical';
import {KryoGraph,KryoNodeData,validateKryoGraph} from '../src/m31/persistence/kryo_graph';
import {firstCanonicalDifference,checkCanonicalAgainstGolden} from '../src/m31/persistence/kryo_compare';
import {dumpKryoFile,compareKryoFile} from '../src/m31/persistence/kryo_cli';
const bytes=(a:number[]):Uint8Array=>Uint8Array.from(a);
const ascii=(str:string):number[]=>{if(str.length<2)throw Error('Kryo short ASCII requires 2+');return [...str].map((c,i)=>c.charCodeAt(0)|(i===str.length-1?128:0));};
const named=(name:string,id=0)=>[1,id,...ascii(name)];
const registered={
 'java.lang.String':{serializer:'string'},
 'java.lang.Integer':{serializer:'int'},
 'java.lang.Float':{serializer:'float'},
 'java.lang.Long':{serializer:'long'},
 'java.lang.Boolean':{serializer:'boolean'},
 'java.lang.Double':{serializer:'double'},
} as KryoSchema22['classes'];
const schema=(classes:KryoSchema22['classes']={}):KryoSchema22=>({format:'Kryo',classes:{...registered,...classes}});
const f=(name:string,type:string,valueClass?:string)=>({name,type,declaring:'Thing',valueClass});
const thingSchema=()=>schema({Thing:{serializer:'field',fields:[f('age','int'),f('title','object'),f('self','object','Thing')]}});
const thingBytes=()=>bytes([...named('Thing'),1,84,3,1,...ascii('OK'),2]);
const canon=(a:Uint8Array,s:KryoSchema22)=>canonicalKryoGraph(readKryoGraph(a,s));
test('M31: reader object -> object fields and root self-cycle preserve identity',()=>{
 const graph=readKryoGraph(thingBytes(),thingSchema());
 assert.equal(graph.roots.length,1);assert.equal(graph.nodes.length,1);
 assert.equal(graph.nodes[0]!.classId,0);assert.deepEqual(graph.roots,[{type:'node',id:0}]);
 assert.equal(canonicalKryoGraph(graph),'{1 Thing 3\n.age\ni 42\n.title\nS OK\n.self\n^1\n');
});
test('M31: cyclic ArrayList references itself with no recursive expansion',()=>{
 const a=bytes([...named('java.util.ArrayList'),1,1,1,0,2]);
 const result=canon(a,schema({'java.util.ArrayList':{serializer:'collection'}}));
 assert.equal(result,'[1 java.util.ArrayList 1\n^1\n');
});
test('M31: maps preserve insertion order and key/value types',()=>{
 const a=bytes([...named('java.util.HashMap'),1,1,3,1,...ascii('key'),2,14]);
 assert.equal(canon(a,schema({'java.util.HashMap':{serializer:'map'}})), '<1 java.util.HashMap 1\nS key\ni 7\n');
});
test('M31: Kryo registered boxed Integer needs no marker',()=>{
 assert.equal(canon(bytes([2,84]),schema()),'i 42\n');
});
test('M31: two roots reset both references and name dictionary',()=>{
 const r=[...named('java.util.ArrayList'),1,1,1,0,2];
 assert.equal(canon(bytes([...r,...r]),schema({'java.util.ArrayList':{serializer:'collection'}})),
  '[1 java.util.ArrayList 1\n^1\n[1 java.util.ArrayList 1\n^1\n');
});
test('M31: strings interned across roots while ref scopes reset',()=>{
 const a=bytes([3,1,...ascii('Test'),3,1,...ascii('Test')]);
 const g=readKryoGraph(a,schema());assert.equal(g.strings.length,1);
 assert.equal(canonicalKryoGraph(g),'S Test\nS Test\n');
});
test('M31: enum ordinal is stored zero-based, zero means null',()=>{
 const a=bytes([...named('Color'),1,4]);const b=bytes([...named('Color'),1,0]);
 const s=schema({Color:{serializer:'enum'}});
 assert.equal(canon(a,s),'E Color 3\n');assert.equal(canon(b,s),'N\n');
});
test('M31: primitive int array includes all ZigZag numbers and size',()=>{
 const a=bytes([...named('[I'),1,3,1,0xd8,4]);
 assert.equal(canon(a,schema({'[I':{serializer:'int-array'}})),'[1 [I 2\ni -1\ni 300\n');
});
test('M31: empty primitive array (marker zero) is Null',()=>{
 assert.equal(canon(bytes([...named('[I'),1,0]),schema({'[I':{serializer:'int-array'}})),'N\n');
});
test('M31: unsigned BigEndian f32/f64 bits including NaN payload are retained',()=>{
 const s=schema({Thing:{serializer:'field',fields:[f('a','float'),f('b','double')]}});
 const a=bytes([...named('Thing'),1,0x7f,0xc0,0x12,0x34,0x7f,0xf8,0,0,0,0,0,1]);
 assert.equal(canon(a,s),'{1 Thing 2\n.a\nf 7fc01234\n.b\nd 7ff8000000000001\n');
});
test('M31: uint16 chars and bool/byte/short primitive arrays emit Rust prefixes',()=>{
 const g:KryoGraph={classes:[{name:'Chars',fields:[]},{name:'Bools',fields:[]},{name:'Bytes',fields:[]},{name:'Shorts',fields:[]}],strings:[],nodes:[
  {classId:0,data:{kind:'chars',values:[65,65535]}},
  {classId:1,data:{kind:'booleans',values:[true,false]}},
  {classId:2,data:{kind:'bytes',values:[-128,127]}},
  {classId:3,data:{kind:'shorts',values:[-32768,32767]}}
 ],roots:[{type:'node',id:0},{type:'node',id:1},{type:'node',id:2},{type:'node',id:3}]};
 assert.equal(canonicalKryoGraph(g),'[1 Chars 2\nc 65\nc 65535\n[1 Bools 2\nz 1\nz 0\n[1 Bytes 2\nb -128\nb 127\n[1 Shorts 2\ns -32768\ns 32767\n');
});
test('M31: float32/float64 primitive arrays preserve bits',()=>{
 const g:KryoGraph={classes:[{name:'F',fields:[]},{name:'D',fields:[]}],strings:[],nodes:[
  {classId:0,data:{kind:'floats',bits:[0x80000000,0x7f800000]}},
  {classId:1,data:{kind:'doubles',bits:[0x8000000000000000n,0xfff0000000000000n]}}
 ],roots:[{type:'node',id:0},{type:'node',id:1}]};
 assert.equal(canonicalKryoGraph(g),'[1 F 2\nf 80000000\nf 7f800000\n[1 D 2\nd 8000000000000000\nd fff0000000000000\n');
});
test('M31: calendar canonical writes timezone, epoch, lenient and Gregorian cutover',()=>{
 const g:KryoGraph={classes:[{name:'GregorianCalendar',fields:[]}],strings:[],nodes:[{
  classId:0,data:{kind:'calendar',value:{timeZone:'America/Sao_Paulo',millis:1792506615250n,lenient:true,
    firstDayOfWeek:1,minimalDaysInFirstWeek:1,gregorianChange:-12219292800000n}}
 }],roots:[{type:'node',id:0}]};
 assert.equal(canonicalKryoGraph(g),'@1 GregorianCalendar\nS America/Sao_Paulo\nl 1792506615250\nz 1\ni 1\ni 1\nl -12219292800000\n');
});
test('M31: newline, carriage, backslash and control strings exact Rust escape',()=>{
 const g:KryoGraph={classes:[],strings:['A\\B\nC\rD\t\0ã'],nodes:[],roots:[{type:'string',id:0}]};
 assert.equal(canonicalKryoGraph(g),'S A\\\\B\\nC\\rD\\x09\\x00ã\n');
});
test('M31: object fields must align 1:1 with serialized schema order',()=>{
 const g:KryoGraph={classes:[{name:'Broken',fields:['x','y']}],strings:[],nodes:[{classId:0,data:{kind:'object',values:[{type:'int',value:1}]}}],roots:[{type:'node',id:0}]};
 assert.throws(()=>validateKryoGraph(g),/Field count/);
});
test('M31: dangling ref fails before canonical rather than emitting partial content',()=>{
 const g:KryoGraph={classes:[],strings:[],nodes:[],roots:[{type:'node',id:5}]};
 assert.throws(()=>canonicalKryoGraph(g),/Broken Kryo node ref/);
});
test('M31: schema missing class fails closed (no fabricated objects)',()=>{
 assert.throws(()=>readKryoGraph(thingBytes(),schema()),/class not in schema/);
});
test('M31: malformed reference to not-yet-read object fails closed',()=>{
 const a=bytes([...named('java.util.ArrayList'),1,1,1,0,3]);
 assert.throws(()=>readKryoGraph(a,schema({'java.util.ArrayList':{serializer:'collection'}})),/not read yet/);
});
test('M31: truncated content returns byte-position error',()=>{
 assert.throws(()=>readKryoGraph(bytes([...named('Thing'),1]),thingSchema()),/at [0-9]+|unexpected end/);
});
test('M31: read limits guard number of nodes, roots, items and input bytes',()=>{
 const s=schema({'java.util.ArrayList':{serializer:'collection'}});
 const a=bytes([...named('java.util.ArrayList'),1,1,0]);
 assert.throws(()=>readKryoGraph(a,s,{maxItems:1,maxBytes:2}),/exceeds limit/);
 assert.throws(()=>readKryoGraph(a,s,{maxNodes:0}),/Invalid Kryo limit/);
 assert.throws(()=>readKryoGraph(bytes([0,0]),s,{maxRoots:1}),/too many roots/);
 assert.throws(()=>readKryoGraph(bytes([...named('java.util.ArrayList'),1,2,0,0]),s,{maxItems:1}),/item limit/);
});
test('M31: unsupported schema serializer is an error, not silent omission',()=>{
 assert.throws(()=>readKryoGraph(bytes([...named('Unsupported'),1]),schema({Unsupported:{serializer:'magic'}})),/no reader/);
});
test('M31: first canonical diff reports original Rust world.rs field trail',()=>{
 const a='{1 World 1\n.game\n{2 Game 1\n.season\ni 10\n',b='{1 World 1\n.game\n{2 Game 1\n.season\ni 11\n';
 const x=firstCanonicalDifference(a,b)!;
 assert.equal(x.line,5);assert.deepEqual(x.fieldTrail,['.season','.game']);assert.equal(x.actualLine,'i 10');assert.equal(x.expectedLine,'i 11');
});
test('M31: canonical comparator detects truncated expected output',()=>{
 const x=firstCanonicalDifference('i 1\ni 2\n','i 1\n')!;assert.equal(x.line,2);
 assert.equal(x.expectedLine,undefined);
});
test('M31: canonical comparator normalizes CRLF only',()=>{
 assert.equal(firstCanonicalDifference('S x\r\ni 2\r\n','S x\ni 2\n'),undefined);
 assert.equal(firstCanonicalDifference('S x\ni 2\n','S x\ni 3\n')!.line,2);
});
test('M31: full differential is UNVERIFIED without executed original provenance',()=>{
 assert.equal(checkCanonicalAgainstGolden('N\n',undefined,undefined).status,'UNVERIFIED');
 assert.equal(checkCanonicalAgainstGolden('N\n','N\n',undefined).status,'UNVERIFIED');
 const input=Uint8Array.from([1,2,3]);const provenance={rustCommit:'bd2ccbdd',inputSha256:require('node:crypto').createHash('sha256').update(input).digest('hex'),binarySha256:'b'.repeat(64)};
 assert.equal(checkCanonicalAgainstGolden('N\n','N\n',input,provenance).status,'PASS');
 assert.equal(checkCanonicalAgainstGolden('N\n','i 3\n',input,provenance).status,'FAIL');
});
test('M31: CLI canonical and differential read only synthetic Kryo fixtures',()=>{
 const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),zlib=require('node:zlib');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fmu-m31-kryo-'));
 try{
  const input=path.join(dir,'synthetic.s22'),sch=path.join(dir,'schema.json'),gold=path.join(dir,'golden.txt');
  fs.writeFileSync(input,thingBytes());fs.writeFileSync(sch,JSON.stringify(thingSchema()));
  const result=dumpKryoFile(input,sch);fs.writeFileSync(gold,result);
  assert.equal(result,'{1 Thing 3\n.age\ni 42\n.title\nS OK\n.self\n^1\n');
  assert.deepEqual(compareKryoFile(input,sch,gold),{equal:true,firstDifference:undefined});
  fs.writeFileSync(gold,result.replace('i 42','i 55'));assert.equal(compareKryoFile(input,sch,gold).equal,false);
  fs.writeFileSync(gold+'.zst',zlib.zstdCompressSync(require('node:buffer').Buffer.from(result)));
  assert.equal(compareKryoFile(input,sch,gold+'.zst').equal,true);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});

test('M31: canonical comparator handles missing final newline without false PASS',()=>{
 assert.equal(firstCanonicalDifference('N','i 3')!.line,1);
 assert.equal(firstCanonicalDifference('N\n','N'),undefined);
});
test('M31: long UTF-16 Kryo strings decode without call stack overflow',()=>{
 const text='á'.repeat(90_000),units=text.length+1;
 const header=[(units&0x3f)|0xc0];let rest=units>>>6;
 while(rest>=128){header.push((rest&0x7f)|128);rest>>>=7;}header.push(rest);
 const data=Uint8Array.from([...header,...Array.from({length:text.length},()=>[0xc3,0xa1]).flat()]);
 const input=new (require('../src/m22/persistence/kryo_input').KryoInput22)(data);
 assert.equal(input.readString(),text);
});
test('M31: hostile oversized Kryo UTF-16 length is rejected',()=>{
 // Kryo length prefix count > 1 million, no UTF-8 data follows.
 const count=1_000_200,header=[(count&63)|0xc0];let rest=count>>>6;
 while(rest>=128){header.push((rest&127)|128);rest>>>=7;}header.push(rest);
 const input=new (require('../src/m22/persistence/kryo_input').KryoInput22)(Uint8Array.from(header));
 assert.throws(()=>input.readString(),/length limit/);
});
test('M31: string array decodes null and non-null with separate reference marker',()=>{
 const a=bytes([...named('[Ljava.lang.String;'),1,3,0,1,...ascii('AA')]);
 assert.equal(canon(a,schema({'[Ljava.lang.String;':{serializer:'string-array'}})),
  '[1 [Ljava.lang.String; 2\nN\nS AA\n');
});
test('M31: object array of boxed Integer honors nullable final component',()=>{
 const a=bytes([...named('[Ljava.lang.Integer;'),1,3,0,1,14]);
 assert.equal(canon(a,schema({'[Ljava.lang.Integer;':{serializer:'object-array',component:'java.lang.Integer'},'java.lang.Integer':{serializer:'int',final:true}})),
 '[1 [Ljava.lang.Integer; 2\nN\ni 7\n');
});
test('M31: object array with dynamic component reads embedded class headers',()=>{
 const s=schema({'[Ljava.lang.Object;':{serializer:'object-array',component:'java.lang.Integer'},'java.lang.Integer':{serializer:'int',final:false}});
 const a=bytes([...named('[Ljava.lang.Object;'),1,2,2,10]);
 assert.equal(canon(a,s),'[1 [Ljava.lang.Object; 1\ni 5\n');
});
test('M31: CalendarSerializer decodes an actual byte stream without JS date conversions',()=>{
 const a=bytes([...named('Cal'),1,...ascii('UTC'),0,1,1,1,1]);
 assert.equal(canon(a,schema({Cal:{serializer:'calendar'}})),
  '@1 Cal\nS UTC\nl 0\nz 1\ni 1\ni 1\nl -1\n');
});
test('M31: long[] preserves signed 64-bit negative values at the wire boundary',()=>{
 const a=bytes([...named('[J'),1,3,1,0]);
 assert.equal(canon(a,schema({'[J':{serializer:'long-array'}})),
  '[1 [J 2\nl -1\nl 0\n');
});
test('M31: boolean[] preserves exact Java boolean byte convention',()=>{
 const a=bytes([...named('[Z'),1,3,1,0]);
 assert.equal(canon(a,schema({'[Z':{serializer:'boolean-array'}})),
  '[1 [Z 2\nz 1\nz 0\n');
});
test('M31: f32 array preserves negative-zero bits (0x80000000)',()=>{
 const a=bytes([...named('[F'),1,2,0x80,0,0,0]);
 assert.equal(canon(a,schema({'[F':{serializer:'float-array'}})),
  '[1 [F 1\nf 80000000\n');
});
test('M31: double array preserves a non-canonical NaN payload',()=>{
 const a=bytes([...named('[D'),1,2,0x7f,0xf8,0,0,0,0,0,0x19]);
 assert.equal(canon(a,schema({'[D':{serializer:'double-array'}})),
  '[1 [D 1\nd 7ff8000000000019\n');
});
test('M31: new class name is registered once within one root',()=>{
 const root=[...named('java.util.ArrayList'),1,2];
 const a=bytes([...root,...named('Foo',1),1,10,1,1,1,10]);
 const s=schema({'java.util.ArrayList':{serializer:'collection'},Foo:{serializer:'field',fields:[f('age','int')]}});
 const g=readKryoGraph(a,s);
 assert.deepEqual(g.roots,[{type:'node',id:0}]);assert.equal(g.nodes.length,3);
 assert.equal(canonicalKryoGraph(g),'[1 java.util.ArrayList 2\n{2 Foo 1\n.age\ni 5\n{3 Foo 1\n.age\ni 5\n');
});
