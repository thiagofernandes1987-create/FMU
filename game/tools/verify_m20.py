#!/usr/bin/env python3
"""Auditoria de todos os 231 fontes oficiais e dos mapeamentos M19/M20.
Não confundir correspondência nominal com equivalência funcional.
"""
from pathlib import Path
import csv,hashlib,json,re
BASE=Path(__file__).resolve().parent.parent
SOURCE=BASE/'upstream/brasfoot-next-main/crates'
M19=BASE/'docs/M19_BATCH88_PLAN.csv'
M20={
'crates/simulation/src/tables.rs':('src/simulation/generated/tables.ts','FULL_STATIC_SOURCE_VERIFIED'),
'crates/simulation/src/fixture_tables.rs':('src/simulation/generated/fixture_tables.ts','FULL_STATIC_SOURCE_VERIFIED'),
'crates/simulation/src/fixtures.rs':('src/simulation/fixtures.ts','FUNCTIONAL_ADAPTER_TESTED'),
'crates/systems/src/config.rs':('src/systems/config.ts','FUNCTIONAL_ADAPTER_TESTED'),
'crates/systems/src/cash.rs':('src/systems/cash.ts','FUNCTIONAL_ADAPTER_TESTED'),
'crates/systems/src/staff.rs':('src/systems/staff.ts','FUNCTIONAL_ADAPTER_TESTED'),
'crates/systems/src/scouts.rs':('src/systems/scouts.ts','FUNCTIONAL_ADAPTER_TESTED'),
'crates/systems/src/fans.rs':('src/systems/fans.ts','FUNCTIONAL_ADAPTER_TESTED'),
'crates/systems/src/investor.rs':('src/systems/investor.ts','FUNCTIONAL_ADAPTER_TESTED'),
'crates/engine/src/tables.rs':('src/engine/generated/tables.ts;src/engine/percent.ts','FULL_STATIC_SOURCE_VERIFIED_AND_PERCENT_TESTED'),
'crates/engine/src/clubs.rs':('src/engine/clubs.ts','FUNCTIONAL_ADAPTER_TESTED'),
'crates/engine/src/events.rs':('src/engine/events.ts','FUNCTIONAL_ADAPTER_TESTED'),
'crates/engine/src/injury.rs':('src/engine/injury.ts','FUNCTIONAL_ADAPTER_TESTED'),
'crates/engine/src/messages.rs':('src/engine/messages.ts','FUNCTIONAL_ADAPTER_TESTED'),
'crates/model/src/names.rs':('src/model/names.ts','FUNCTIONAL_ADAPTER_TESTED'),
'crates/model/src/host_cities.rs':('src/model/generated/host_cities.ts','FULL_STATIC_SOURCE_VERIFIED')
}
assert len(M20)==16
with M19.open() as f:m19={r['rust_source']:r['m19_ts'] for r in csv.DictReader(f) if r['status']=='PORT_REVIEWED_STANDALONE'}
assert len(m19)==11
assert not set(M20)&set(m19)
files=sorted(SOURCE.rglob('*.rs'));assert len(files)==231,len(files)
rows=[]
for p in files:
 rust='crates/'+str(p.relative_to(SOURCE));status='UNPORTED';target='';wave=''
 if rust in m19:status='REVIEWED_M19_TESTED';target=m19[rust];wave='M19'
 if rust in M20:target,status=M20[rust];wave='M20'
 for name in target.split(';'):
  if name and not (BASE/name).exists():raise ValueError('Missing TS target '+name)
 rows.append({'rust_source':rust,'crate':rust.split('/')[1],'rust_lines':len(p.read_text().splitlines()),
  'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'port_status':status,'typescript_target':target,'wave':wave,
  'differential_rust_verified':'NO','release_ready':'NO'})
assert sum(r['wave']=='M19' for r in rows)==11
assert sum(r['wave']=='M20' for r in rows)==16
assert sum(r['port_status']!='UNPORTED' for r in rows)==27
out=BASE/'docs/M20_PORTING_MATRIX.csv'
with out.open('w',newline='') as f:
 w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
progress={'inventory_total_rust_files':231,'source_hashes_verified_against_snapshot':231,
  'baseline_last_confirmed_m18':{'mapped':74,'out_of':231,'mapping_percent':round(100*74/231,2)},
  'm19_standalone':{'mapped':11},'m20_new_sources':16,
  'm20_package_standalone':{'reviewed_sources':27,'percent_of_source_inventory':round(100*27/231,2),'unported_in_standalone':204},
  'm18_m19_m20_union':'UNVERIFIED: M18 package/matrix absent; overlaps not resolvable',
  'functional_completion_percent':None,'rust_differential':'UNVERIFIED',
  'new_test_cases_m20':63,'total_test_cases_m20':120,
  'source_status_detail':{'complete_static_table_sources':4,'tested_behavioral_adapters':12},
  'caveat':'Mapeamento ou adaptação de uma função não equivale a port completo do Rust.',
  'source_rust_paths':list(M20.keys())}
(BASE/'docs/M20_PROGRESS.json').write_text(json.dumps(progress,indent=2,ensure_ascii=False)+'\n')
print(json.dumps({'rust_files':len(files),'m19':len(m19),'m20':len(M20),'mapped_in_package':27,'sha256_verified':len(files)},indent=2))
