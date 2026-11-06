/** M22 partial port model/src/canonical.rs::Canonical::line,field,shared.
 * Input arena identity and visitor; output canonical rows with first-seen object labels.
 * Side effects: accumulates local output, does not mutate world, no arena traversal until visitor is supplied. */
export class Canonical22 {
 private out:string[]=[];private seen=new Map<string,number>();private next=0;
 line(value:string):void {this.out.push(value);}
 field(name:string):void {this.out.push('.'+name);}
 shared(arena:number,index:number,visit:(w:Canonical22)=>void):void {
  if(![arena,index].every(v=>Number.isInteger(v)&&v>=0))throw Error('Invalid arena reference');
  const key=arena+':'+index,found=this.seen.get(key);
  if(found!==undefined){this.line('^'+found);return;}
  const number=++this.next;this.seen.set(key,number);this.line('{'+number);visit(this);
 }
 text():string{return this.out.length?this.out.join('\n')+'\n':'';}
}
/** Rust `canonical`: two roots visited with shared reference numbering. */
export function canonicalRoots(game:(c:Canonical22)=>void,market:(c:Canonical22)=>void):string {
 const c=new Canonical22();c.line('game');game(c);c.line('job_market');market(c);return c.text();
}
