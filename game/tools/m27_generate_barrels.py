#!/usr/bin/env python3
"""Translate lib.rs `pub mod` namespaces to TS namespace exports (not a port of internals).
Tests verify a barrel is importable; Rust function implementations remain partial.
"""
import csv,pathlib,re
root=pathlib.Path(__file__).resolve().parents[1];src=root/'upstream/brasfoot-next-main'
rows=list(csv.DictReader((root/'docs/M26_PORTING_MATRIX.csv').open()))
by_source={r['rust_source']:r for r in rows}
for crate in ['datapack','engine','model','persistence']:
 origin=src/f'crates/{crate}/src/lib.rs';lines=[]
 for name in re.findall(r'^pub mod (\w+);',origin.read_text(),re.M):
  key=f'crates/{crate}/src/{name}.rs';info=by_source.get(key)
  if not info:
   if name=='import':key=f'crates/{crate}/src/import/mod.rs';info=by_source.get(key)
   elif name=='kryo':key=f'crates/{crate}/src/kryo/mod.rs';info=by_source.get(key)
  if not info or info['port_status']=='UNPORTED':raise ValueError(f'No port for {key}')
  target=info['typescript_target'].split(';')[0]
  absolute=root/target
  if not absolute.is_file():raise ValueError(f'Missing {absolute}')
  dirname=root/f'src/m27/{crate}';relative=pathlib.Path(__import__('os').path.relpath(absolute,dirname)).with_suffix('')
  relative_path=str(relative).replace('\\','/')
  if not relative_path.startswith('.'):relative_path='./'+relative_path
  alias='import_' if name=='import' else name
  lines.append(f"/** Rust pub mod {name}; underlying TS port status: {info['port_status']} */\nexport * as {alias} from '{relative_path}';")
 dest=root/f'src/m27/{crate}/index.ts';dest.parent.mkdir(exist_ok=True,parents=True)
 text=f"/** M27: generated namespace barrel for crates/{crate}/src/lib.rs.\n * Source module declarations are translated 1:1, implementation parity NOT implied.\n * Generator: tools/m27_generate_barrels.py; preserve Rust namespace boundaries. */\n"+'\n'.join(lines)+'\n'
 if '--check' in __import__('sys').argv:
  assert dest.read_text()==text, dest
 else:dest.write_text(text)
 print(crate,len(lines))
