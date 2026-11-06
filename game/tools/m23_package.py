#!/usr/bin/env python3
"""Build or verify reproducible M23 ZIP from a clean Git working tree.

Example:
  python3 tools/m23_package.py --bundle /tmp/M23.bundle --patch /tmp/M22_to_M23.patch \
     --output /tmp/FMU_Next_M23_Aceleracao_TypeScript.zip

No font binaries, private database, secrets, or untracked scratch files are
added. Git objects are preserved separately in a full-history bundle.
"""
from pathlib import Path
import argparse,hashlib,os,subprocess,zipfile
ROOT=Path(__file__).resolve().parents[1]
PREFIX='FMU_Next_M23/'
DENY_EXTENSIONS={'.ttf','.otf','.woff','.woff2','.eot','.pem','.key'}

def tracked_paths():
    raw=subprocess.check_output(['git','ls-files','-z'],cwd=ROOT)
    files=[Path(os.fsdecode(f)) for f in raw.split(b'\0') if f]
    for rel in files:
        assert not rel.is_absolute() and '..' not in rel.parts
        if rel.suffix.lower() in DENY_EXTENSIONS:raise ValueError('Disallowed file type: '+str(rel))
        if any(x in str(rel).lower() for x in ('fmudatabase2026','fmu_database_2026_privado','private_db','/clubs/bra/')):
            raise ValueError('Detected private FMU database in package: '+str(rel))
        if (ROOT/rel).is_symlink() or not (ROOT/rel).is_file():raise ValueError('Unexpected tracked file: '+str(rel))
    return sorted(files)

def archive(out:Path,bundle:Path,patch:Path):
    contents={PREFIX+str(p).replace(os.sep,'/'): (ROOT/p).read_bytes() for p in tracked_paths()}
    for name,path in [('git/M23_full_history.bundle',bundle),('patches/M22_to_M23.patch',patch)]:
        if not path.is_file():raise FileNotFoundError(path)
        contents[PREFIX+name]=path.read_bytes()
    digest=''.join(f'{hashlib.sha256(payload).hexdigest()}  {name[len(PREFIX):]}\n'
                   for name,payload in sorted(contents.items()))
    contents[PREFIX+'SHA256SUMS.txt']=digest.encode()
    out.parent.mkdir(parents=True,exist_ok=True)
    with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=8,allowZip64=True) as z:
        for name,payload in sorted(contents.items()):z.writestr(name,payload)
    return verify(out)

def verify(out:Path):
    with zipfile.ZipFile(out) as z:
        assert z.testzip() is None,'ZIP CRC failure'
        members=z.namelist();assert len(members)==len(set(members))
        sums=z.read(PREFIX+'SHA256SUMS.txt').decode().splitlines()
        assert len(sums)==len(members)-1
        for line in sums:
            expected,relative=line.split('  ',1)
            actual=hashlib.sha256(z.read(PREFIX+relative)).hexdigest()
            assert actual==expected,relative
        return {'entries':len(members),'sha256_checked':len(sums),
                'bytes':out.stat().st_size,'zip_sha256':hashlib.sha256(out.read_bytes()).hexdigest()}

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--bundle',type=Path);parser.add_argument('--patch',type=Path)
    parser.add_argument('--output',type=Path);parser.add_argument('--verify',type=Path)
    args=parser.parse_args()
    if args.verify:report=verify(args.verify)
    else:
        if args.output is None or args.bundle is None or args.patch is None:parser.error('--output --bundle --patch required')
        report=archive(args.output,args.bundle,args.patch)
    print('M23_ZIP_INTEGRITY_PASS',report)

if __name__=='__main__':main()
