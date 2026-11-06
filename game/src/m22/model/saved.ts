/** M22 partial port model/src/saved.rs saved type inventory.
 * Generated from Rust struct fields; allows validation of field presence and traceability.
 * Not a native .bfn reader; fields are metadata for future deserializer parity. */
import {SAVED_FIELDS22} from './saved_fields.generated';
export function savedFieldNames(typeName:string):readonly string[]{
 const fields=SAVED_FIELDS22[typeName];if(!fields)throw Error('Unknown saved Rust type '+typeName);return [...fields];
}
export function savedMissingFields(typeName:string,value:Readonly<Record<string,unknown>>):string[]{return savedFieldNames(typeName).filter(k=>!Object.hasOwn(value,k));}

export {SAVED_FIELDS22};
