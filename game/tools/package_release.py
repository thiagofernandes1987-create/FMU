from pathlib import Path
from hashlib import sha256
from zipfile import ZipFile,ZIP_DEFLATED
from shutil import copy2,copytree,rmtree
from subprocess import run,PIPE
import json,os,re
root=Path(__file__).resolve().parents[1]
release=Path('/mnt/data/FMU_M19_RELEASE')
if release.exists():rmtree(release)
project=release/'FMU_M19_ACCEL'
project.mkdir(parents=True)
for name in ['package.json','tsconfig.json','README.md','CONTRACTS.md','DEPENDENCY_MATRIX.md','TRACEABILITY_MATRIX.md',
             'TASKS.md','MISSING_INPUTS.yaml','QA_REPORT.md','BACKLOG_FUTURO.md']:
 copy2(root/name,project/name)
for name in ['src','dist','tests','tools','docs','public']:
 copytree(root/name,project/name,ignore=lambda p,items:{x for x in items if x in ('__pycache__','.DS_Store') or x.endswith('.pyc')})
# Original Rust project: source + legal metadata only. Preserve no binary assets or fonts.
rust=root/'upstream/brasfoot-next-main'
for name in ['LICENSE','README.md','Cargo.toml','Cargo.lock']:
 if (rust/name).is_file(): (project/'upstream').mkdir(exist_ok=True); copy2(rust/name,project/'upstream'/name)
for f in (rust/'crates').rglob('*.rs'):
 dest=project/'upstream'/f.relative_to(rust)
 dest.parent.mkdir(parents=True,exist_ok=True);copy2(f,dest)
for f in (rust/'crates').rglob('Cargo.toml'):
 dest=project/'upstream'/f.relative_to(rust);dest.parent.mkdir(parents=True,exist_ok=True);copy2(f,dest)
assert len(list((project/'upstream/crates').rglob('*.rs')))==231
assert not list(project.rglob('*.ttf')) and not list(project.rglob('*.otf'))
sha=lambda p:sha256(p.read_bytes()).hexdigest()
list_files=sorted(p for p in project.rglob('*') if p.is_file())
index=''.join(f'{sha(p)}  {p.relative_to(project).as_posix()}\n' for p in list_files)
(project/'SHA256SUMS.txt').write_text(index)
audit=json.loads((project/'docs/M19_PROGRESS.json').read_text())
wasm=json.loads((project/'docs/WASM_RUNTIME_AUDIT.json').read_text())
manifest={'release':'M19_ACCEL_STANDALONE','source_rust_files':231,'source_rust_sha256_from_snapshot':True,
 'm19_ported_source_files':11,'old_m18_reported_mapped':74,'combined_mapped_verified':None,
 'new_coverage_target':132,'target_new_mappings':58,'target_achieved':False,
 'typescript_tests_passed':57,'typescript_tests_failed':0,'wasm_main_exported':wasm['wasm_main_exported'],
 'wasm_runtime_included':True,'wasm_is_ts_port':False,'browser_qa':'UNVERIFIED',
 'full_integration':'RELEASE_BLOCKED_MISSING_M18','license':'GPL-3.0-only'}
(project/'RELEASE_MANIFEST_M19.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
# Manifest not in SHA index yet: include by re-generating once.
files=sorted(p for p in project.rglob('*') if p.is_file() and p.name!='SHA256SUMS.txt')
(project/'SHA256SUMS.txt').write_text(''.join(f'{sha(p)}  {p.relative_to(project).as_posix()}\n' for p in files))
archive=Path('/mnt/data/FMU_M19_ACCEL_Simulation_Systems_WASM.zip')
with ZipFile(archive,'w',compression=ZIP_DEFLATED,compresslevel=6,allowZip64=True) as z:
 for p in sorted(project.rglob('*')):
  if p.is_file():z.write(p,p.relative_to(release).as_posix())
with ZipFile(archive) as z:
 assert z.testzip() is None
 names=z.namelist()
 assert not any(n.lower().endswith(('.otf','.ttf','.woff','.woff2')) for n in names)
 assert not any('2026_privado' in n.lower() for n in names)
summary={'zip':archive.name,'sha256':sha(archive),'bytes':archive.stat().st_size,
 'entries':len(names),'source_files':231,'compiled_typescript':11,'tests':57,'goal_plus_25pp':'NOT_MET'}
Path('/mnt/data/FMU_M19_ACCEL_SHA256SUMS.txt').write_text(summary['sha256']+'  '+archive.name+'\n')
print(json.dumps(summary,indent=2))
