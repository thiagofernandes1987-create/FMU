#!/usr/bin/env python3
"""Build M23 read-only per-source function inventory for maintenance."""
from pathlib import Path
import csv,re,json
root=Path(__file__).resolve().parents[1]
rows=list(csv.DictReader((root/'docs/M23_PORTING_MATRIX.csv').open(newline='')))
new=[x for x in rows if x['wave']=='M23']
assert len(new)==60
by={}
for x in new:
    target=x['typescript_target']
    contents=(root/target).read_text()
    funcs=re.findall(r'\bexport\s+(?:async\s+)?(?:function|class|const|enum)\s+([A-Za-z_][A-Za-z_0-9]*)',contents)
    assert funcs,(target,contents[:80])
    orig=x['rust_source']
    raw=re.sub(r'\s+',' ', contents.lstrip('\ufeff').split('*/',1)[0].replace('/**','').replace('*','')).strip()
    by[orig]={'target':target,'rust_lines':int(x['rust_lines']),'typescript_symbols':funcs,
      'source_comment':raw[:480],
      'contract':'Partial domain/view-state adapter; explicit DTO; does not render native egui',
      'test_file':'tests/m23_app_core.test.ts, tests/m23_app_selectors.test.ts or tests/m23_app_integration.test.ts'}
with (root/'docs/M23_APP_FUNCTIONS.csv').open('w',newline='') as f:
    w=csv.writer(f,lineterminator='\n');w.writerow(['rust_source','ts_target','functions','rust_lines','module_comment','status'])
    for source,details in by.items():w.writerow([source,details['target'],';'.join(details['typescript_symbols']),details['rust_lines'],details['source_comment'],'PARTIAL_LOGIC_ONLY'])
with (root/'docs/M23_APP_FUNCTIONS.json').open('w') as f:json.dump(by,f,indent=2,ensure_ascii=False)
print('M23_FUNCTION_INDEX_PASS',len(by),'Rust files',sum(len(x['typescript_symbols']) for x in by.values()),'exported functions/classes/consts')
