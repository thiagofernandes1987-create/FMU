#!/usr/bin/env python3
"""Reproducibly package Git-tracked FMU M22 with full Git bundle, M21 patch, SHA256 manifest.
Usage: python tools/m22_package.py --bundle <file> --patch <file> --out <zip>.
The bundle and patch are created AFTER all file changes are committed.
"""
import sys,argparse,hashlib,zipfile,subprocess,re,os
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--bundle',type=Path,required=True);p.add_argument('--patch',type=Path,required=True);p.add_argument('--out',type=Path,required=True)
a=p.parse_args()
root=Path(__file__).resolve().parent.parent
files=[os.fsdecode(f) for f in subprocess.check_output(['git','ls-files','-z'],cwd=root).split(b'\0') if f]
exclude=re.compile(r'\.(?:ttf|otf|woff2?|eot)$|(^|/)(?:private_db|dataset_2026_privado|\.env)(/|$)|squad\.csv$',re.I)
assert not any(exclude.search(f) for f in files),[f for f in files if exclude.search(f)]
assert (root/'src/m22/index.ts').is_file() and len(files)>300
zname='FMU_Next_M22';entries=[]
with zipfile.ZipFile(a.out,'w',zipfile.ZIP_DEFLATED,compresslevel=7) as z:
 for f in sorted(files):
  path=root/f
  assert path.is_file() and not path.is_symlink()
  data=path.read_bytes();name=zname+'/'+f;z.writestr(name,data);entries.append((f,hashlib.sha256(data).hexdigest()))
 for rel,source in [('git/M22_full_history.bundle',a.bundle),('patches/M21_to_M22.patch',a.patch)]:
  data=source.read_bytes();z.writestr(zname+'/'+rel,data);entries.append((rel,hashlib.sha256(data).hexdigest()))
 manifest=''.join(f'{sha}  {name}\n' for name,sha in entries)
 z.writestr(zname+'/SHA256SUMS.txt',manifest)
with zipfile.ZipFile(a.out) as z:
 assert z.testzip() is None
 assert len(z.namelist())==len(entries)+1
 assert not any(exclude.search(name) for name in z.namelist())
 for f,sha in entries:assert hashlib.sha256(z.read(zname+'/'+f)).hexdigest()==sha,f
print('zip',a.out,'members',len(entries)+1,'SHA256',hashlib.sha256(a.out.read_bytes()).hexdigest(),'bytes',a.out.stat().st_size)
