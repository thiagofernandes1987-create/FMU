#!/usr/bin/env python3
"""Faithful Rust static table port: Rust's array/tuple literals -> TS readonly literals.
Canonical inputs: simulation/src/{tables,fixture_tables}.rs. Used at build and QA.
No `eval`, no compiling cargo, no inferred constants. Every scalar is checked.
"""
from __future__ import annotations
import argparse, ast, json, re, pathlib, hashlib
ROOT=pathlib.Path(__file__).resolve().parent.parent
INPUT=ROOT/'upstream/brasfoot-next-main/crates'
OUT=ROOT/'src'

def parse_const(text:str):
    # Comments are removed only outside quoted strings to protect URLs or labels.
    def strip_comments(s):
        out=[]
        for line in s.splitlines():
            quote=False; escaped=False; j=len(line)
            for i,c in enumerate(line):
                if c=='"' and not escaped:quote=not quote
                if c=='/' and i+1<len(line) and line[i+1]=='/' and not quote:j=i;break
                escaped=c=='\\' and not escaped
            out.append(line[:j])
        return '\n'.join(out)
    src=strip_comments(text)
    result={}
    for m in re.finditer(r'pub\s+const\s+(\w+)\s*:[^=]+?=\s*',src):
        name=m.group(1); start=m.end(); pos=start; quote=False;esc=False; depth=0
        while pos<len(src):
            c=src[pos]
            if c=='"' and not esc:quote=not quote
            if not quote:
                if c in '[(':depth+=1
                elif c in '])':depth-=1
                elif c==';' and depth==0:break
            esc=c=='\\' and not esc;pos+=1
        if pos==len(src):raise ValueError('Missing end for '+name)
        literal=src[start:pos].strip()
        literal=re.sub(r'&(\s*\[)',r'\1',literal)
        literal=literal.replace('(', '[').replace(')', ']')
        try:parsed=ast.literal_eval(literal)
        except Exception as e:raise ValueError(f'Parse {name}: {literal[:120]}') from e
        result[name]=parsed
    return result

def generate(source_name:str,check:bool):
    path=INPUT/source_name;obj=parse_const(path.read_text())
    if not obj:raise ValueError('No constants parsed from '+source_name)
    parts=["/** AUTO-GENERATED FROM RUST, DO NOT EDIT BY HAND.",
           " * Source: crates/"+source_name,
           " * Tool: tools/port_static_tables.py --check; arrays are verbatim literal values.",
           " * Contracts: read-only data, no effects; re-run when Rust snapshot changes. */"]
    for k,v in obj.items():
        parts.append('export const '+k+' = '+json.dumps(v,ensure_ascii=False,separators=(',',':'))+' as const;')
    parts.append('export const SOURCE_SHA256 = '+json.dumps(hashlib.sha256(path.read_bytes()).hexdigest())+' as const;')
    parts.append('export const RUST_CONSTANT_NAMES = '+json.dumps(list(obj.keys()))+' as const;')
    crate,relative=source_name.split('/src/',1)
    dest=OUT/crate/'generated'/relative.replace('.rs','.ts');content='\n'.join(parts)+'\n'
    if check:
        if not dest.exists() or dest.read_text()!=content:raise AssertionError('Generated table drift: '+str(dest))
    else:
        dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(content)
    return {'source':source_name,'constants':len(obj),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'ts':str(dest.relative_to(ROOT))}

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args()
    print(json.dumps([generate(n,args.check) for n in ['simulation/src/tables.rs','simulation/src/fixture_tables.rs','engine/src/tables.rs','model/src/host_cities.rs']],indent=2))
