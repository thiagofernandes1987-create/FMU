/**
 * Exact textual grammar from crates/persistence/src/kryo/canonical.rs (114 lines).
 * Typed values preserve f32/f64 NaN payload bits, 64-bit long and identity links.
 * One reference-numbering namespace per root, exactly as Kryo autoReset does.
 * DOES NOT decode raw .s22 bytes; requires graph produced by `readKryoGraph`.
 */
import {KryoGraph,KryoValue,KryoNodeData,validateKryoGraph} from './kryo_graph';
export function canonicalKryoGraph(graph:KryoGraph):string {
 validateKryoGraph(graph);
 const out:string[]=[];
 const line=(s:string):void=>{out.push(s);};
 const string=(s:string):void=>{
  let escaped='';
  for(const char of s){const c=char.codePointAt(0)!;
   if(char==='\\')escaped+='\\\\';else if(char==='\n')escaped+='\\n';else if(char==='\r')escaped+='\\r';
   else if(c<0x20)escaped+='\\x'+c.toString(16).padStart(2,'0');else escaped+=char;
  }
  line('S '+escaped);
 };
 function primitiveLines(d:KryoNodeData):void {
  if('values' in d){const prefix=({ints:'i',longs:'l',booleans:'z',shorts:'s',bytes:'b',chars:'c'} as Record<string,string>)[d.kind];
   if(!prefix)throw Error('Not a primitive numeric array');
   for(const n of d.values)line(prefix+' '+(typeof n==='boolean'?(n?1:0):String(n)));
  }else if('bits' in d){const prefix=d.kind==='floats'?'f':'d';for(const bits of d.bits)line(prefix+' '+bits.toString(16));}
  else throw Error('Not a primitive array');
 }
 for(const root of graph.roots){
  const seen=new Uint32Array(graph.nodes.length);let nextId=1;
  const write=(v:KryoValue,depth:number):void=>{
   if(depth>4000)throw Error('Kryo graph nesting exceeds JS safety limit');
   switch(v.type){
    case 'null':line('N');return;
    case 'bool':line('z '+(v.value?1:0));return;
    case 'byte':line('b '+v.value);return;
    case 'short':line('s '+v.value);return;
    case 'char':line('c '+v.value);return;
    case 'int':line('i '+v.value);return;
    case 'long':line('l '+v.value);return;
    case 'float':line('f '+v.bits.toString(16));return;
    case 'double':line('d '+v.bits.toString(16));return;
    case 'string':string(graph.strings[v.id]!);return;
    case 'enum':line('E '+graph.classes[v.classId]!.name+' '+v.ordinal);return;
    case 'node':{
     const already=seen[v.id]!;
     if(already!==0){line('^'+already);return;}
     const id=nextId++;seen[v.id]=id;
     const node=graph.nodes[v.id]!,cls=graph.classes[node.classId]!,data=node.data;
     switch(data.kind){
      case 'object':line(`{${id} ${cls.name} ${data.values.length}`);
       data.values.forEach((x,i)=>{line('.'+cls.fields[i]);write(x,depth+1);});return;
      case 'items':line(`[${id} ${cls.name} ${data.values.length}`);for(const x of data.values)write(x,depth+1);return;
      case 'map':line(`<${id} ${cls.name} ${data.entries.length}`);
       for(const [k,x] of data.entries){write(k,depth+1);write(x,depth+1);}return;
      case 'calendar':{
       const c=data.value;line(`@${id} ${cls.name}`);string(c.timeZone);line('l '+c.millis);
       line('z '+(c.lenient?1:0));line('i '+c.firstDayOfWeek);line('i '+c.minimalDaysInFirstWeek);
       line('l '+c.gregorianChange);return;
      }
      default:{const size='values' in data?data.values.length:'bits' in data?data.bits.length:0;
       line(`[${id} ${cls.name} ${size}`);primitiveLines(data);return;}
     }
    }
   }
  };
  write(root,0);
 }
 return out.map(s=>s+'\n').join('');
}
