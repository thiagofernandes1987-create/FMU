#!/usr/bin/env python3
"""M31 SHA source audit and nominal status matrix.
--check compares generated matrix and JSON, without mutating them.
This is not evidence of functional Rust equivalence.
"""
import sys,csv,json,hashlib,pathlib,io
ROOT=pathlib.Path(__file__).resolve().parents[1]
BASE=ROOT/'docs/M29_PORTING_MATRIX.csv'
SOURCE=ROOT/'upstream/brasfoot-next-main'
TARGET=ROOT/'docs/M31_PORTING_MATRIX.csv'
PROGRESS=ROOT/'docs/M31_PROGRESS.json'
ADDITIONS={
 'crates/persistence/examples/canonical_dump.rs':('M31_PARTIAL_BINARY_KRYO_CANONICAL_EXTERNAL_SCHEMA', 'src/m31/persistence/kryo_cli.ts;src/m31/persistence/kryo_reader.ts;src/m31/persistence/kryo_canonical.ts'),
 'crates/persistence/tests/kryo_differential.rs':('M31_PARTIAL_KRYO_DIFFERENTIAL_NO_OFFICIAL_GOLDEN','src/m31/persistence/kryo_compare.ts;src/m31/persistence/kryo_cli.ts;tests/m31_kryo_reader.test.ts'),
}
with BASE.open(newline='',encoding='utf8') as f:
 rd=csv.DictReader(f);fields=rd.fieldnames;rows=list(rd)
assert fields is not None and len(rows)==231
for row in rows:
 path=SOURCE/row['rust_source']
 assert path.is_file(),path
 assert hashlib.sha256(path.read_bytes()).hexdigest()==row['sha256'],row['rust_source']
 if row['rust_source'] in ADDITIONS:
  assert row['port_status']=='UNPORTED',row
  status,target=ADDITIONS[row['rust_source']]
  for part in target.split(';'):assert (ROOT/part).is_file(),part
  row.update(port_status=status,typescript_target=target,wave='M31',differential_rust_verified='NO',release_ready='NO')
mapped=sum(r['port_status']!='UNPORTED' for r in rows)
assert mapped==213,mapped
report={
 'release':'M31','baseline_commit':'7a8f8d5','rust_commit':'bd2ccbdd5f1aaacb6437b58b198d7963c61b3780',
 'rust_total':231,'rust_sha256_verified':231,'mapped_nominal_before':211,'mapped_nominal_after':mapped,
 'nominal_pct_before':round(211/231*100,2),'nominal_pct_after':round(mapped/231*100,2),
 'nominal_delta_pp':round((mapped-211)/231*100,2),'still_unported':231-mapped,
 'baseline_tests':663,'new_tests':44,'total_tests':707,
 'deepened_rust_sources':['crates/persistence/src/kryo/graph.rs','crates/persistence/src/kryo/canonical.rs',
   'crates/persistence/src/kryo/reader.rs','crates/persistence/src/kryo/input.rs','crates/persistence/src/import/mod.rs'],
 'new_nominal_mappings':list(ADDITIONS.keys()),
 'kryo_binary_schema_required':True,'original_game_schema_present':False,
 'real_s22_fixture_present':False,'rust_differential_parity':'UNVERIFIED',
 'world_import_completed':False,'runnable_game_integrated':False,
 'new_tests_are_synthetic':True,
 'note':'Nominal matches include PARTIAL ports; 92.21% is not functional Rust parity',
 'remaining_sources':[r['rust_source'] for r in rows if r['port_status']=='UNPORTED']}
out=io.StringIO();writer=csv.DictWriter(out,fieldnames=fields,lineterminator='\n');writer.writeheader();writer.writerows(rows)
products=[(TARGET,out.getvalue()),(PROGRESS,json.dumps(report,ensure_ascii=False,indent=2)+'\n')]
if '--check' in sys.argv:
 for p,s in products:assert p.read_text(encoding='utf8')==s,'Generated file differs: '+str(p)
 print('M31 AUDIT PASS: 231/231 Rust SHA-256; 213/231 nominal; 18 UNPORTED; schema/fixture absent')
else:
 for p,s in products:p.write_text(s,encoding='utf8')
 print('M31 WRITE: 231/231 Rust SHA-256; 213/231 nominal; 18 UNPORTED')
