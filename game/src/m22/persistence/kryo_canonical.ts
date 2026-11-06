/** M22 partial port: persistence/src/kryo/canonical.rs canonical graph printer.
 * Responsibilities: deterministic traversal for numeric/text/list values and identity references.
 * Inputs: already decoded objects; does NOT replace Kryo binary graph parser.
 * Output: reproducible UTF-8 text, circular object references numbered once. */
export function canonicalGraph(value:unknown):string {
 const seen=new Map<object,number>();let id=0;const lines:string[]=[];
 function visit(v:unknown):void {
  if(v===null){lines.push('null');return;}
  if(typeof v!=='object'){lines.push(typeof v==='string'?JSON.stringify(v):String(v));return;}
  if(seen.has(v)){lines.push('^'+seen.get(v));return;}
  const n=++id;seen.set(v,n);lines.push('{'+n);
  if(Array.isArray(v))for(const item of v)visit(item);
  else for(const [k,x] of Object.entries(v)){lines.push('.'+k);visit(x);}
 }
 visit(value);return lines.join('\n')+'\n';
}
