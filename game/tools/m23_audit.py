#!/usr/bin/env python3
"""M23 Rust SHA audit and conservative partial app-port coverage report.

Only Rust sources with an actual corresponding TypeScript module (function or
constant extracted from Rust) are mapped. egui rendering remains UNPORTED.
"""
from pathlib import Path, PurePosixPath
import argparse,csv,hashlib,json,re
ROOT=Path(__file__).resolve().parents[1]
RUST=ROOT/'upstream/brasfoot-next-main'
SOURCE=ROOT/'docs/M22_PORTING_MATRIX.csv'
MATRIX=ROOT/'docs/M23_PORTING_MATRIX.csv'
OUTPUT=ROOT/'docs/M23_PROGRESS.json'
SOURCE_AUDIT=ROOT/'evidence/m23/source_verification.json'
EXTRA={'lib':'app','screens/career':'career_screen',
       'patches/mod':'patch_library','patches/store':'patch_store',
       'patches/download':'patch_download'}
TESTS='\n'.join(p.read_text() for p in (ROOT/'tests').glob('m23_app_*.test.ts'))

def target_for(rust_source):
    p=PurePosixPath(rust_source)
    if not rust_source.startswith('crates/app/src/'):
        return None
    stem='/'.join(p.parts[3:])[:-3]
    stem=EXTRA.get(stem, p.stem)
    if stem in ('main','mod') or not stem:
        return None
    return f'src/m23/app/{stem}.ts'

def summarize():
    with SOURCE.open(newline='') as f:
        rd=csv.DictReader(f); columns=rd.fieldnames or [];rows=list(rd)
    assert len(rows)==231, f'Source catalog changed: {len(rows)}'
    diff=[];mapped=[];uncovered=[];app=[]
    for row in rows:
        source=RUST/row['rust_source']
        assert source.is_file(),f'Missing original Rust source {row["rust_source"]}'
        digest=hashlib.sha256(source.read_bytes()).hexdigest()
        if digest!=row['sha256']:diff.append(row['rust_source'])
        if row['crate']!='app':continue
        app.append(row)
        target=target_for(row['rust_source'])
        if not target or not (ROOT/target).is_file():
            uncovered.append(row['rust_source']);continue
        text=(ROOT/target).read_text()
        # Count only modules with executable exported logic or literal source tables.
        if not re.search(r'\bexport\s+(?:(?:async|const|type|interface|function|class|enum)\b|\{)',text):
            uncovered.append(row['rust_source']);continue
        if not re.search(r'\bexport\s+(?:async\s+)?(?:function|const|class)\b',text):
            uncovered.append(row['rust_source']);continue
        import_path=target.removesuffix('.ts')
        reviewed=('../../'+import_path in TESTS) or ('../'+import_path in TESTS)
        status='APP_VIEWMODEL_PARTIAL_TESTED' if reviewed else 'APP_VIEWMODEL_PARTIAL_BUILD_ONLY'
        row.update({'port_status':status,'typescript_target':target,'wave':'M23',
           'differential_rust_verified':'NO','release_ready':'NO'})
        mapped.append({'rust_source':row['rust_source'],'typescript_target':target,
                       'rust_lines':int(row['rust_lines']),'status':status,'sha256':row['sha256']})
    if diff:raise ValueError('SHA-256 mismatch: '+', '.join(diff))
    total=sum(x['port_status']!='UNPORTED' for x in rows)
    old=sum(x['port_status']!='UNPORTED' for x in csv.DictReader(SOURCE.open(newline='')))
    assert old==125 and len(mapped)==60 and total==185,(old,len(mapped),total,uncovered)
    assert len(app)==66 and len(uncovered)==6
    by={}
    for c in sorted(set(r['crate'] for r in rows)):
        q=[r for r in rows if r['crate']==c]
        by[c]={'total':len(q),'mapped_some':sum(x['port_status']!='UNPORTED' for x in q),
               'unported':sum(x['port_status']=='UNPORTED' for x in q)}
    report={'upstream_revision':'bd2ccbdd5f1aaacb6437b58b198d7963c61b3780',
       'sources_sha256_checked':len(rows),'sha256_mismatches':diff,
       'baseline_m22':{'mapped':old,'total':len(rows),'percentage':round(100*old/len(rows),2)},
       'm23':{'new_app_sources':len(mapped),'mapped_cumulative':total,'unported_cumulative':len(rows)-total,
              'coverage_percentage':round(total/len(rows)*100,2),'delta_percentage_points':round((total-old)/len(rows)*100,2),
              'rust_app_sources_mapped':len(mapped),'rust_app_total':len(app),
              'source_not_mapped':uncovered,
              'functions_logic_or_data_only':True,'full_egui_rendering_ported':False,
              'functional_parity_percentage':None,'differential_rust_tests':'UNVERIFIED'},
       'by_crate':by,
       'interpretation':'A source-file correspondence is counted for partial executable logic/data; egui UI and Rust parity not claimed.',
       'sources':[{'rust_source':x['rust_source'],'typescript_target':x['typescript_target'],'status':x['status']} for x in mapped]}
    return rows,columns,report,mapped

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args()
    rows,cols,report,mapped=summarize()
    if args.check:
        assert MATRIX.is_file() and OUTPUT.is_file()
        with MATRIX.open(newline='') as f:
            actual=list(csv.DictReader(f))
        assert actual==rows, 'M23 matrix drifted from actual modules'
        current=json.loads(OUTPUT.read_text())
        assert current==report, 'M23 report drifted from actual modules'
    else:
        MATRIX.parent.mkdir(parents=True,exist_ok=True)
        with MATRIX.open('w',newline='') as f:
            w=csv.DictWriter(f,fieldnames=cols,lineterminator='\n');w.writeheader();w.writerows(rows)
        OUTPUT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
        SOURCE_AUDIT.parent.mkdir(parents=True,exist_ok=True)
        SOURCE_AUDIT.write_text(json.dumps({'verified':231,'sha256_mismatches':[],
            'source_commit':report['upstream_revision'],'new_source_mapping':len(mapped),
            'unmapped_app':report['m23']['source_not_mapped']},ensure_ascii=False,indent=2)+'\n')
    print('M23_AUDIT_PASS',report['m23']['mapped_cumulative'],'/',231,
           f"{report['m23']['coverage_percentage']:.2f}%", 'delta', report['m23']['delta_percentage_points'],'pp')

if __name__=='__main__':main()
