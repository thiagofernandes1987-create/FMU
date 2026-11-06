#!/usr/bin/env python3
"""Verificação reproduzível de 231 fontes Rust e tabelas portadas M21 (sem OCR e sem rede)."""
from pathlib import Path
import csv,hashlib,json,re,sys
ROOT=Path(__file__).resolve().parents[1]
UP=ROOT/'upstream/brasfoot-next-main'
PORT=ROOT/'src/ported'
rows=list(csv.DictReader((ROOT/'docs/M21_PORTING_MATRIX.csv').open()))
assert len(rows)==231
for row in rows:
 f=UP/row['rust_source']
 assert f.is_file(),row['rust_source']
 assert hashlib.sha256(f.read_bytes()).hexdigest()==row['sha256'],row['rust_source']
 if row['wave']=='M21':assert (ROOT/row['typescript_target']).is_file(),row['typescript_target']
assert sum(x['wave']=='M21' for x in rows)==28
assert sum(x['port_status']!='UNPORTED' for x in rows)==55

def rust_string_tables(relative:str):
 t=(UP/relative).read_text()
 return {name:re.findall(r'"((?:[^"\\]|\\.)*)"',body)
   for name,_,body in re.findall(r'pub const (\w+): \[&str; (\d+)\] = \[(.*?)\];',t,re.S)}
def ts_string_table(file:Path,name:str):
 txt=file.read_text();m=re.search(r'export const '+name+r' = Object.freeze\((\[.*?\])\) as readonly string\[\];',txt,re.S)
 assert m,name
 return json.loads(m.group(1))
for rel,ts in [('crates/model/src/brands.rs','model/brands.ts'),('crates/datapack/src/codes.rs','datapack/codes.ts')]:
 for name,values in rust_string_tables(rel).items():
  assert ts_string_table(PORT/ts,name)==values,name
# Os 224 países preservam códigos legados e nível/confederação (inclusive -1).
rust=(UP/'crates/model/src/countries.rs').read_text()
a=[dict(id=int(i),code=c,confederation=int(co),level=int(l),colorTable1=x,colorTable2=y)
 for i,c,co,l,x,y in re.findall(r'CountryInfo \{ id: (\d+), code: "([^"]+)", confederation: (-?\d+), level: (\d+), color_table1: "([^"]+)", color_table2: "([^"]+)" \}',rust)]
assert len(a)==224
f=(PORT/'model/countries.ts').read_text()
m=re.search(r'export const COUNTRIES:readonly CountryInfo\[\] = Object.freeze\((\[.*?\])\);',f,re.S)
assert m and json.loads(m.group(1))==a
# Vetores de regressão binários de StrictMath são validados pelo Node test M21.
print(json.dumps({'sha256_rust_verified':231,'new_source_mappings':28,'mapping_in_m20_m21':55,
 'brands_and_codes_tables':len(rust_string_tables('crates/model/src/brands.rs'))+len(rust_string_tables('crates/datapack/src/codes.rs')),
 'countries':224,'status':'PASS'}))
