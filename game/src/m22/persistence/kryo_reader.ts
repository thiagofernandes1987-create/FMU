/** M22 partial port: persistence/src/kryo/reader.rs primitive class handling.
 * Input schema class names, output registration indexes; full object graph reader pending.
 * Pure utility: retains original nine Java builtins and resets dynamic name table per root. */
export const KRYO_BUILTIN_CLASSES=['java.lang.Integer','java.lang.String','java.lang.Float',
 'java.lang.Boolean','java.lang.Byte','java.lang.Character','java.lang.Short','java.lang.Long','java.lang.Double'] as const;
export class KryoClassRegistry {
 private extra=new Map<string,number>();
 constructor(private readonly registered:readonly string[]=[...KRYO_BUILTIN_CLASSES]){}
 registeredIndex(name:string):number|undefined {const i=this.registered.indexOf(name);return i<0?undefined:i;}
 nameId(name:string):number {const current=this.extra.get(name);if(current!==undefined)return current;const id=this.extra.size;this.extra.set(name,id);return id;}
 resolveName(id:number):string|undefined {return [...this.extra.keys()][id];}
 /** Rust Reader::read_all starts each root with fresh class-name dictionary. */
 reset():void {this.extra.clear();}
}
