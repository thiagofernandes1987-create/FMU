#!/usr/bin/env python3
"""Regenerate two Java/Kryo field dictionaries from the pinned Rust snapshot.

Input: model/src/canonical_generated.rs, model/src/saved.rs,
       persistence/src/import/generated.rs.
Output: three JSON references and three strongly-typed TypeScript map files.
--check verifies that the checked-in artifacts exactly match generated outputs.
"""
from pathlib import Path
import json,re,sys
ROOT=Path(__file__).resolve().parent.parent
RUST=ROOT/'upstream/brasfoot-next-main/crates'
OUT=ROOT/'src/m22'
DATA={}
s=(RUST/'model/src/canonical_generated.rs').read_text()
blocks=re.findall(r'impl Visit for (\w+)\s*\{\s*fn visit\(&self, c: &mut Canonical\)\s*\{(.*?)\n\s*\}\s*\}',s,re.S)
DATA['model/canonical_fields']={k:re.findall(r'c\.field\("([^"]+)"\)',v) for k,v in blocks}
s=(RUST/'model/src/saved.rs').read_text()
blocks=re.findall(r'pub struct (\w+)\s*\{(.*?)\n\}',s,re.S)
DATA['model/saved_fields']={k:re.findall(r'^\s*pub\s+(\w+)\s*:',v,re.M) for k,v in blocks}
s=(RUST/'persistence/src/import/generated.rs').read_text()
blocks=re.findall(r'pub fn convert_(\w+)\(ctx: &Context, node: NodeId\) -> \w+\s*\{(.*?)(?=\n\}\n)',s,re.S)
entries={}
for cls,body in blocks:
 fields=re.findall(r'^\s*([a-z_][a-z_\d]*)\s*:\s*ctx\.([a-z_]+)\(node,\s*"([^"]+)"',body,re.M)
 if fields:entries[cls]=[{'field':f,'reader':r,'source':source} for f,r,source in fields]
DATA['persistence/import_generated.fields']=entries
for sub,js in DATA.items():
 location=OUT/sub
 name=location.name
 jsonfile=location.with_suffix('.generated.json') if name!='import_generated.fields' else Path(str(location)+'.json')
 tsfile=location.with_suffix('.generated.ts') if name!='import_generated.fields' else Path(str(location)+'.ts')
 cname={'canonical_fields':'CANONICAL_FIELDS22','saved_fields':'SAVED_FIELDS22','import_generated.fields':'GENERATED_IMPORT_FIELDS'}[name]
 typ='Readonly<Record<string,readonly {field:string;reader:string;source:string}[]>>' if 'import_generated' in name else 'Readonly<Record<string,readonly string[]>>'
 jsontext=json.dumps(js,indent=2,ensure_ascii=True)+'\n'
 tstext=f'/** Generated from upstream Rust {name}; no manual edits. */\nexport const {cname}:{typ}='+json.dumps(js,indent=2,ensure_ascii=True)+';\n'
 if '--check' in sys.argv:
  assert jsonfile.read_text()==jsontext,(jsonfile,'JSON differs')
  assert tsfile.read_text()==tstext,(tsfile,'TypeScript differs')
 else:
  jsonfile.write_text(jsontext);tsfile.write_text(tstext)
 print(f'{name}: {len(js)} types; {sum(len(v) for v in js.values())} fields; check={"--check" in sys.argv}')
