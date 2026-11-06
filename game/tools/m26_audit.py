#!/usr/bin/env python3
"""M26: reconcilia matriz canônica do Rust e prova hashes da fonte.

Uso: python3 tools/m26_audit.py [--check]. Sem --check gera docs/M26_PORTING_MATRIX.csv e docs/M26_PROGRESS.json.
Nunca marca testes/adaptadores como paridade integral.
"""
import csv,sys,hashlib,json,pathlib,collections
root=pathlib.Path(__file__).resolve().parents[1]
source=root/'upstream/brasfoot-next-main'
origin=root/'docs/M25_PORTING_MATRIX.csv'
target=root/'docs/M26_PORTING_MATRIX.csv'
progress=root/'docs/M26_PROGRESS.json'
new={
'crates/simulation/examples/compare_ratings.rs':'src/m26/diagnostics/simulation_examples.ts',
'crates/simulation/examples/days_to_season_end.rs':'src/m26/diagnostics/simulation_examples.ts',
'crates/simulation/examples/inspect_competitions.rs':'src/m26/diagnostics/simulation_examples.ts',
'crates/systems/examples/day_matches.rs':'src/m26/diagnostics/systems_examples.ts',
'crates/systems/examples/compare_season.rs':'src/m26/diagnostics/systems_examples.ts',
'crates/systems/examples/new_game_smoke.rs':'src/m26/diagnostics/systems_examples.ts',
'crates/persistence/examples/comp_ids.rs':'src/m26/diagnostics/persistence_examples.ts',
'crates/persistence/examples/save_features.rs':'src/m26/diagnostics/persistence_examples.ts',
'crates/persistence/examples/game_data.rs':'src/m26/diagnostics/persistence_examples.ts',
# Already partially mapped in M24; M26 enhances it without nominal count.
}
with origin.open(encoding='utf8',newline='') as f:
 rd=csv.DictReader(f);headers=rd.fieldnames;rows=list(rd)
assert headers is not None and len(rows)==231
for row in rows:
 rel=row['rust_source'];p=source/rel
 assert p.is_file(),rel
 assert hashlib.sha256(p.read_bytes()).hexdigest()==row['sha256'],rel
 if rel in new:
  assert row['port_status']=='UNPORTED',(rel,row['port_status'])
  assert (root/new[rel]).is_file(),new[rel]
  row.update(port_status='DIAGNOSTIC_ADAPTER_M26_TESTED',typescript_target=new[rel],wave='M26',
   differential_rust_verified='NO',release_ready='NO')
 if rel=='crates/persistence/examples/open_bfn.rs':
  assert row['port_status']!='UNPORTED'
  row.update(port_status='BFN_EXAMPLE_PARTIAL_REAL_PAYLOAD_TESTED',typescript_target='src/m24/persistence/bfn_inspect.ts;src/m26/diagnostics/persistence_examples.ts',wave='M24+M26',differential_rust_verified='NO',release_ready='NO')
 if rel=='crates/persistence/src/native.rs':
  assert row['port_status']!='UNPORTED'
  row.update(port_status='BFN_NATIVE_PARTIAL_ZSTD_CBOR_TESTED',typescript_target='src/m22/persistence/native.ts;src/m26/persistence/bfn_codec.ts;src/m26/persistence/cbor.ts',wave='M22+M26',differential_rust_verified='NO',release_ready='NO')
known=sum(r['port_status']!='UNPORTED' for r in rows)
assert known==205,known
assert sum(r['port_status']=='DIAGNOSTIC_ADAPTER_M26_TESTED' for r in rows)==9
crates={k:{'total':len(v),'mapped_nominal':sum(x['port_status']!='UNPORTED' for x in v)} for k,v in sorted(((k,[r for r in rows if r['crate']==k]) for k in {r['crate'] for r in rows}))}
report={'baseline':'M25 196/231 = 84.85%','rust_total':231,'sha256_verified':231,'newly_mapped_M26':9,'enhanced_existing_M26':2,
 'mapped_nominal':known,'unported':231-known,'mapped_nominal_percent':round(100*known/231,2),'previous_nominal_percent':round(100*196/231,2),
 'delta_percentage_points':round(100*9/231,2),'functional_parity_percent':None,
 'new_test_cases':42,'all_test_cases':453,'rust_differential':'UNVERIFIED',
 'semantics':'M26 new mappings are DEMO/CBOR diagnostic adapters; not World-compatible Rust example binaries',
 'crates':crates,'new_sources':list(new),'enhanced_sources':['crates/persistence/src/native.rs','crates/persistence/examples/open_bfn.rs']}
if '--check' in sys.argv:
 assert target.is_file() and progress.is_file()
 with target.open(encoding='utf8',newline='') as f:other=list(csv.DictReader(f))
 assert other==rows,'Porting matrix out of date'
 assert json.loads(progress.read_text(encoding='utf8'))==report,'Progress report out of date'
else:
 with target.open('w',encoding='utf8',newline='') as f:
  wr=csv.DictWriter(f,fieldnames=headers,lineterminator='\n');wr.writeheader();wr.writerows(rows)
 progress.write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
print(f'M26 OK: Rust sha 231/231, mapped {known}/231 ({report["mapped_nominal_percent"]}%), unported {231-known}')
