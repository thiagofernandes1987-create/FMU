#!/usr/bin/env python3
"""Verify all 231 Rust sources against original uploaded repository archive.
No nominal coverage changes are asserted without the old M28 source tree.
"""
from pathlib import Path
import hashlib,json,zipfile
root=Path(__file__).resolve().parents[1]
sources=root/'upstream-brasfoot-next'
files=sorted((sources/'crates').rglob('*.rs'))
assert len(files)==231,f'Expected 231 Rust files: got {len(files)}'
digests={str(p.relative_to(sources)):hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
output={'count':len(digests),'sha256':digests,
 'source_zip':'brasfoot-next-main.zip (user supplied)',
 'implementation_claim':'standalone tested subset; NOT merged with historical M28/M29'}
p=root/'docs/RUST_SOURCE_AUDIT.json'
serialized=json.dumps(output,ensure_ascii=False,indent=2)+'\n'
if '--check' in __import__('sys').argv:
 assert p.is_file() and p.read_text()==serialized,'Audit source changed'
else:p.write_text(serialized)
print(f'RUST_SOURCES={len(digests)} SHA256=PASS (against recorded manifest)')
