/** M22 partial port persistence/src/import/generated.rs auto-generated Java Kryo field mapping.
 * Input converted Java field graph and target schema; output mapped TS field records.
 * Source data was extracted from actual `convert_*` bodies, no dummy converter.
 * Full nested references/arrays are NOT materialized; callback reader must resolve them. */
import {GENERATED_IMPORT_FIELDS} from './import_generated.fields';
export {GENERATED_IMPORT_FIELDS};
export function convertGeneratedSimple22(typeName:string,raw:Readonly<Record<string,unknown>>,read:(kind:string,value:unknown)=>unknown):Record<string,unknown> {
 const map=GENERATED_IMPORT_FIELDS[typeName];if(!map)throw Error('Unknown imported type '+typeName);
 const out:Record<string,unknown>={};for(const f of map)out[f.field]=read(f.reader,raw[f.source]);return out;
}
