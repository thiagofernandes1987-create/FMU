#!/usr/bin/env python3
"""Audit exactly one M22 source correspondence per Rust source, with executable functions.

This measures NOMINAL file coverage only (partial implementations count as touched).
It must never be used to claim full functional parity or differential verification.
"""
from pathlib import Path
from collections import Counter,defaultdict
import csv,json,hashlib,re,sys
root=Path(__file__).resolve().parent.parent
rust=root/'upstream/brasfoot-next-main'
sources=root/'src/m22'
input_csv=root/'docs/M21_PORTING_MATRIX.csv'
output_csv=root/'docs/M22_PORTING_MATRIX.csv'
exceptions={
 'persistence/kryo_input':'persistence/src/kryo/input.rs',
 'persistence/kryo_graph':'persistence/src/kryo/graph.rs',
 'persistence/kryo_schema':'persistence/src/kryo/schema.rs',
 'persistence/kryo_reader':'persistence/src/kryo/reader.rs',
 'persistence/kryo_canonical':'persistence/src/kryo/canonical.rs',
 'persistence/kryo_mod':'persistence/src/kryo/mod.rs',
 'persistence/import_context':'persistence/src/import/context.rs',
 'persistence/import_generated':'persistence/src/import/generated.rs',
 'systems/award_hall_of_fame':'systems/src/awards/hall_of_fame.rs',
 'systems/award_season':'systems/src/awards/season.rs',
 'simulation/human_lineup':'simulation/src/human/lineup.rs',
 'simulation/human_purchase':'simulation/src/human/purchase.rs',
}
mapping={}
for path in sorted(sources.rglob('*.ts')):
 if path.stem in ('index','interop') or path.name.endswith(('.generated.ts','.fields.ts')):continue
 rel=path.relative_to(sources).with_suffix('');key=rel.as_posix()
 source='crates/'+exceptions.get(key,f'{rel.parent.as_posix()}/src/{rel.name}.rs')
 assert source not in mapping,(source,path)
 content=path.read_text()
 assert content.lstrip().startswith('/**'),f'Missing JSDoc: {path}'
 # non-decorative implementations: at least one exported behavior (constant schema alone not counted)
 assert 'export function' in content or 'export class' in content or 'export interface' in content and ('export const' in content and 'function ' in content),str(path)
 mapping[source]='src/m22/'+str(rel.with_suffix('.ts'))
assert len(mapping)==71,len(mapping)
with input_csv.open(newline='',encoding='utf-8') as f:r=csv.DictReader(f);fields=r.fieldnames;rows=list(r)
assert len(rows)==231,len(rows)
found={r['rust_source'] for r in rows};assert set(mapping)<=found,sorted(set(mapping)-found)
source_hashes={};base_mapped=0;overlap=[]
for row in rows:
 full=rust/row['rust_source']
 assert full.is_file(),full
 digest=hashlib.sha256(full.read_bytes()).hexdigest();assert digest==row['sha256'],row['rust_source']
 source_hashes[row['rust_source']]=digest
 if row['port_status']!='UNPORTED':base_mapped+=1
 if row['rust_source'] in mapping:
  if row['port_status']!='UNPORTED':overlap.append(row['rust_source'])
  if row['rust_source'] in overlap:
   row['port_status']='PARTIAL_M22_ENHANCED'
   row['typescript_target']+=';'+mapping[row['rust_source']]
   row['wave']='M22_ENHANCED'
  else:
   row['port_status']='PARTIAL_M22_TESTED'
   row['typescript_target']=mapping[row['rust_source']]
   row['wave']='M22'
  row['differential_rust_verified']='NO'
  row['release_ready']='NO'
assert base_mapped==55,base_mapped
assert overlap==['crates/engine/src/events.rs'],overlap
assert sum(r['port_status']!='UNPORTED' for r in rows)==125
with output_csv.open('w',newline='',encoding='utf-8') as f:
 w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows(rows)
crate_counts={}
for cr in sorted(set(r['crate'] for r in rows)):
 entries=[r for r in rows if r['crate']==cr]
 crate_counts[cr]={'rust_total':len(entries),'mapped_partial_or_better':sum(r['port_status']!='UNPORTED' for r in entries),
                   'new_m22':sum(r['wave']=='M22' for r in entries)}
new_sha={k:{'rust_sha256':source_hashes[k],'target':target,'ts_sha256':hashlib.sha256((root/target).read_bytes()).hexdigest()} for k,target in mapping.items()}
progress={
 'upstream_revision':'bd2ccbdd5f1aaacb6437b58b198d7963c61b3780',
 'source_total':231,'rust_hashes_verified':231,
 'm21_base_mapped':55,'m21_base_pct':round(100*55/231,2),
 'm22_new_partial_or_data_mappings':70,
 'm22_sources_touched':71,
 'previously_mapped_sources_deepened':['crates/engine/src/events.rs'],
 'm22_mapped_cumulative_in_M21_lineage':125,
 'm22_mapped_pct':round(100*125/231,2),
 'gain_percentage_points':round(100*70/231,2),
 'rust_sources_unported':106,
 'met_plus_30_pp_nominal':100*70/231>=30,
 'full_functional_parity_percent':None,
 'rust_differential_tests':'NOT_EXECUTED_NO_CARGO',
 'historical_m18_74_of_231_union':'UNVERIFIED_M18_TREE_MISSING',
 'm22_mapping_classification':'PARTIAL_TESTED; includes static schema fields, subset routines and adapter-specific behavior',
 'm21_test_baseline':163,'new_m22_tests':86,'total_m22_tests':249,
 'by_crate':crate_counts,
 'note':'Nominal coverage of source files touched in the independent M21->M22 lineage, not full crate parity; WASM not counted.'}
(root/'docs/M22_PROGRESS.json').write_text(json.dumps(progress,indent=2,ensure_ascii=False)+'\n')
(root/'docs/M22_SOURCE_MANIFEST.json').write_text(json.dumps(new_sha,indent=2,ensure_ascii=False)+'\n')
with (root/'docs/M22_REMAINING_RUST.csv').open('w',newline='',encoding='utf-8') as f:
 w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows([r for r in rows if r['port_status']=='UNPORTED'])
with (root/'docs/M22_NEW_SOURCES.csv').open('w',newline='',encoding='utf-8') as f:
 w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows([r for r in rows if r['wave']=='M22'])
print(json.dumps({'base':base_mapped,'new':70,'touched':len(mapping),'cumulative':125,'pct':progress['m22_mapped_pct'],'gain_pp':progress['gain_percentage_points'],'remaining':106,'by_crate':crate_counts},ensure_ascii=False,indent=2))
