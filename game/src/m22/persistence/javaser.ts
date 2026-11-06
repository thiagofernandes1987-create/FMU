/** M22 port partial: persistence/src/javaser.rs::Value/Object helpers.
 * Dependencies: in-memory Java serialization object graph. Pure accessors preserve last-field priority.
 * Input structured decoded data; binary Java ObjectInputStream remains unported. */
export type JavaValue = null|boolean|number|string|JavaObject|JavaValue[]|{block:Uint8Array};
export interface JavaObject{className:string;fields:readonly (readonly [string,JavaValue])[];annotations:readonly JavaValue[]}
export function javaField(o:JavaObject,key:string):JavaValue|undefined {
  for(let i=o.fields.length-1;i>=0;i--)if(o.fields[i]![0]===key)return o.fields[i]![1];return undefined;
}
export function javaInt(o:JavaObject,key:string):number {const x=javaField(o,key);return typeof x==='number'&&Number.isInteger(x)?x:0;}
export function javaBool(o:JavaObject,key:string):boolean {return javaField(o,key)===true;}
export function javaString(o:JavaObject,key:string):string|undefined {const x=javaField(o,key);return typeof x==='string'?x:undefined;}
/** `Value::list`: java.util.ArrayList annotations omit TC_BLOCKDATA; raw arrays copied. */
export function javaList(v:JavaValue):JavaValue[]{
 if(Array.isArray(v))return [...v];
 if(v&&typeof v==='object'&&'className' in v&&v.className==='java.util.ArrayList')return v.annotations.filter(x=>!(x&&typeof x==='object'&&'block' in x));
 return [];
}
