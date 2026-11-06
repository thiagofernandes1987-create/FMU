#!/usr/bin/env python3
"""M25: verifica SHA dos Rust e registra SOMENTE duas fontes novas, parciais.

Modo padrão: escreve matriz/progresso com origem M24. --check: compara bytes gerados.
Não conta screenshots, novos arquivos TS ou exemplos como Rust convertido.
"""
from pathlib import Path
from hashlib import sha256
import csv,json,io,sys
ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'docs/M24_PORTING_MATRIX.csv'
RUST=ROOT/'upstream/brasfoot-next-main'
PORTS={
 'crates/simulation/src/human/round.rs':('SIMULATION_LIVE_ROUND_PARTIAL_TESTED','src/m25/simulation/live_round.ts;src/m25/web/demo_replay.ts','M25',),
 'crates/persistence/src/import/mod.rs':('PERSISTENCE_S22_GRAPH_PREVALIDATION_PARTIAL_TESTED','src/m25/persistence/import_s22_graph.ts','M25',),
}
with BASE.open(newline='',encoding='utf8') as f:
 reader=csv.DictReader(f);fields=list(reader.fieldnames or []);rows=list(reader)
assert len(rows)==231
for r in rows:
 src=RUST/r['rust_source'];assert src.is_file(),src
 digest=sha256(src.read_bytes()).hexdigest()
 assert digest==r['sha256'],(src,digest,r['sha256'])
 if r['rust_source'] in PORTS:
  assert r['port_status']=='UNPORTED',r
  r['port_status'],r['typescript_target'],r['wave']=PORTS[r['rust_source']]
  r['differential_rust_verified']='NO';r['release_ready']='NO'
out=io.StringIO(newline='');writer=csv.DictWriter(out,fieldnames=fields,lineterminator='\n');writer.writeheader();writer.writerows(rows)
counts={}
for c in sorted(set(r['crate'] for r in rows)):
 a=[r for r in rows if r['crate']==c];counts[c]={'mapped':sum(r['port_status']!='UNPORTED' for r in a),'total':len(a)}
mapped=sum(r['port_status']!='UNPORTED' for r in rows);assert mapped==196,mapped
summary={'release':'M25','source_commit':'bd2ccbdd5f1aaacb6437b58b198d7963c61b3780',
 'rust_source_files':231,'rust_hashes_verified':231,'previous_mapped':194,'current_mapped':mapped,
 'new_mappings':2,'unported':231-mapped,'nominal_previous_pct':round(194/231*100,2),
 'nominal_current_pct':round(mapped/231*100,2),'gain_percentage_points':round((mapped-194)/231*100,2),
 'functional_parity_pct':None,'world_import_complete':False,'egui_parity':False,
 'new_tests':56,'total_tests':411,'ui_screens':9,'visual_viewports':['1440x900','768x1024','390x844'],
 'new_sources':[{'rust_source':s,'status':p[0],'target':p[1]} for s,p in PORTS.items()],
 'by_crate':counts,'notes':['Fontes mapeadas incluem implementações parciais e view-models.',
 'Replay de partida usa tempos ilustrativos, sem gerar gols reais do Rust.',
 'Importação S22 valida grafos pré-decodificados; NÃO importa World .s22.']}
products=[(ROOT/'docs/M25_PORTING_MATRIX.csv',out.getvalue()),
 (ROOT/'docs/M25_PROGRESS.json',json.dumps(summary,ensure_ascii=False,indent=2)+'\n')]
if '--check' in sys.argv:
 for path,content in products:
  assert path.is_file() and path.read_text()==content,f'Divergent generated file: {path}'
 print('M25_AUDIT_PASS: 231 SHA; 196 mapped; 35 unmapped; generated manifests stable')
else:
 for path,content in products:path.write_text(content)
 print('M25_AUDIT_WRITE: 231 SHA; 196 mapped; 35 unmapped')
