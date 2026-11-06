#!/usr/bin/env python3
"""M27: inventory 26 previously UNPORTED sources, without laundering tests as parity.
Status only advances where a compiled module & tests were produced in M27.
"""
import csv,pathlib,hashlib,json,collections
root=pathlib.Path(__file__).resolve().parents[1]
source=root/'upstream/brasfoot-next-main'
base=root/'docs/M26_PORTING_MATRIX.csv'
new={
 'crates/datapack/src/bin/brasfoot-data.rs':('PARTIAL_CLI_M27_TESTED','src/m27/datapack/cli.ts','Argument parser, read-only pack inspection; convert/pack blocked by full TOML/CSV importer'),
 'crates/datapack/src/lib.rs':('BARREL_NAMESPACE_M27_TESTED','src/m27/datapack/index.ts','9 Rust public namespaces exported, underlying modules remain partial'),
 'crates/engine/src/lib.rs':('BARREL_NAMESPACE_M27_TESTED','src/m27/engine/index.ts','12 Rust public namespaces exported, engine parity not proven'),
 'crates/model/src/lib.rs':('BARREL_NAMESPACE_M27_TESTED','src/m27/model/index.ts','21 Rust public namespaces exported, model parity not proven'),
 'crates/persistence/src/lib.rs':('BARREL_NAMESPACE_M27_TESTED','src/m27/persistence/index.ts','6 Rust public namespaces exported; complete .s22 import still missing'),
 'crates/simulation/src/lib.rs':('PARTIAL_ENTRYPOINT_M27_TESTED','src/m27/simulation/entrypoints.ts','Rivalry and no-system hooks ported; Sim::advance real engine missing'),
}
base_rows=list(csv.DictReader(base.open(newline='',encoding='utf8')))
assert len(base_rows)==231
original=[r for r in base_rows if r['port_status']=='UNPORTED'];assert len(original)==26
rows=[r.copy() for r in base_rows]
for r in rows:
 p=source/r['rust_source'];assert p.is_file() and hashlib.sha256(p.read_bytes()).hexdigest()==r['sha256'],r['rust_source']
 if r['rust_source'] in new:
  status,target,_=new[r['rust_source']]
  assert r['port_status']=='UNPORTED',r['rust_source']
  assert (root/target).is_file()
  r.update(port_status=status,typescript_target=target,wave='M27',differential_rust_verified='NO',release_ready='NO')
checks={
 'tests/differential.rs':'Original Rust vs Java golden game fixture not in snapshot; no verified parity',
 'tests/new_game.rs':'Original new-game fixture `.s22` missing; TS demo is not differential',
 'tests/purchase.rs':'Rust purchase golden fixture not supplied; transaction FMU differs',
 'tests/world.rs':'Original World fixture and differential engine not supplied',
 'tests/import_fictional.rs':'Importer .s22→World remains partial (Kryo graph / Java serialization)',
 'tests/kryo_differential.rs':'Original game differential output fixture unavailable',
 'tests/migrations.rs':'v1/v2 migration cases ported to TS but original .s22 fixture unavailable',
 'tests/awards.rs':'Awards differential fixtures unavailable; modules only partially ported',
 'tests/clock.rs':'Real multi-season ModSystems + Rust fixtures not executable in TS yet',
 'tests/common/mod.rs':'Common golden reporter depends on World and Translator Rust',
 'tests/human.rs':'Human careers depend on interactive Rust engine and fixture',
 'tests/simulation.rs':'End-to-end simulation original fixtures and engine missing',
 'tests/windows.rs':'Calendar window unit logic ported; fixture differential unavailable',
 'examples/save_smoke.rs':'Requires import_s22 and complete Sim/ModSystems',
 'examples/awards_career.rs':'Requires import_s22, full simulation and awards mod',
 'examples/import_s22.rs':'Complete .s22 importer not available, no original fixture',
 'examples/canonical_dump.rs':'Full Kryo canonical stream needed, partial parser only'
}
sub=[]
for r in original:
 src=r['rust_source'];is_mapped=src in new
 cause=new[src][2] if is_mapped else next((v for k,v in checks.items() if src.endswith(k)),'External Rust fixture or full engine not present')
 sub.append({'rust_source':src,'rust_lines':r['rust_lines'],'new_status':(new[src][0] if is_mapped else 'UNPORTED'),
 'typescript_target':(new[src][1] if is_mapped else ''),'m27_evidence':('M27 npm test (cross-crate suites)' if is_mapped else 'BLOCKED'),
 'requirement_to_finish':cause,'rust_parity_verified':'NO'})
fields=['rust_source','rust_lines','new_status','typescript_target','m27_evidence','requirement_to_finish','rust_parity_verified']
with (root/'docs/M27_LAST_26_GAP_MATRIX.csv').open('w',newline='',encoding='utf8') as f:
 w=csv.DictWriter(f,fieldnames=fields,lineterminator='\n');w.writeheader();w.writerows(sub)
with (root/'docs/M27_PORTING_MATRIX.csv').open('w',newline='',encoding='utf8') as f:
 w=csv.DictWriter(f,fieldnames=base_rows[0].keys(),lineterminator='\n');w.writeheader();w.writerows(rows)
mapped=sum(r['port_status']!='UNPORTED' for r in rows)
assert mapped==211
progress={'baseline_m26':205,'mapped_nominal':mapped,'previous_percent':round(100*205/231,2),
 'mapped_nominal_percent':round(100*mapped/231,2),'newly_mapped_M27':6,
 'newly_indexed_M27':26,'unported':231-mapped,'sha256_verified':231,
 'world_structs':89,'world_fields':956,'new_tests':49,'total_tests':502,
 'rust_native_bfn_header_decode':'SUPPORTED_INDIRECTLY_BUT_APP_CRASHED_ON_SYNTHETIC_EMPTY_WORLD',
 'rust_full_world_parity':'UNVERIFIED','world_runtime_readiness':'PREFLIGHT_ONLY',
 'full_26_port_complete':False,'full_conversion_complete':False,
 'limitations':'Four lib.rs namespace barrels, one datapack partial CLI, one simulation partial entrypoint; the 20 tests/examples remaining require original fixtures and complete Rust engine.',
 'remaining_sources':[r['rust_source'] for r in rows if r['port_status']=='UNPORTED'],
 'new_sources':list(new)}
(root/'docs/M27_PROGRESS.json').write_text(json.dumps(progress,indent=2,ensure_ascii=False)+'\n')
print('M27 AUDIT',json.dumps({k:progress[k] for k in ['mapped_nominal','mapped_nominal_percent','newly_mapped_M27','newly_indexed_M27','unported','sha256_verified']},ensure_ascii=False))
