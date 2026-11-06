/** M22 partial port model/src/canonical_generated.rs visitation order.
 * The build-tool extracts the exact `c.field("...")` ordering from Rust source
 * and ships a verified generated JSON mapping. No ability to serialize full World is implied.
 * Dependencies: this checked-in generated mapping; consumers use field order for diagnostics. */
import {CANONICAL_FIELDS22} from './canonical_fields.generated';
export function canonicalFieldOrder(typeName:string):readonly string[] {
 const found=CANONICAL_FIELDS22[typeName];if(!found)throw Error('Unknown canonical Rust type '+typeName);return [...found];
}
export function canonicalOrderedObject(typeName:string,record:Readonly<Record<string,unknown>>):unknown[] {
 return canonicalFieldOrder(typeName).map(k=>record[k]??null);
}

export {CANONICAL_FIELDS22};
