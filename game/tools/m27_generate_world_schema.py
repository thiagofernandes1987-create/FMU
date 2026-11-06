#!/usr/bin/env python3
"""Generate World field/type metadata from original Rust serde structs.

The generated JSON is a machine-verifiable contract; never claims code behavior
of structs/enums is converted. It preserves exact Rust type strings and source SHA.
"""
import hashlib,json,pathlib,re
root=pathlib.Path(__file__).resolve().parents[1]
src=root/'upstream/brasfoot-next-main/crates/model/src'
files=[src/'saved.rs',src/'mods.rs']
structs={};enums={};origins={}
for p in files:
 s=p.read_text(encoding='utf8');origins[str(p.relative_to(root))]=hashlib.sha256(p.read_bytes()).hexdigest()
 pattern=re.compile(r'^pub (struct|enum) ([A-Za-z_][A-Za-z0-9_]*)\s*\{',re.M)
 for m in pattern.finditer(s):
  kind,name=m.groups();depth=1;start=m.end();i=start
  while i<len(s) and depth:
   depth+=(s[i]=='{')-(s[i]=='}');i+=1
  if depth:raise ValueError(f'unclosed Rust declaration {name}')
  chunk=s[start:i-1]
  if kind=='struct':
   fields={};default=False
   for line in chunk.splitlines():
    t=line.strip()
    if t.startswith('#[serde(default') :default=True;continue
    if t.startswith('#[serde(skip') :continue
    fm=re.match(r'pub\s+([a-zA-Z_][a-zA-Z_0-9]*)\s*:\s*(.*),\s*$',t)
    if fm:
     f,typ=fm.groups();fields[f]={'type':typ,'default':default};default=False
   if fields:structs[name]={'fields':fields,'origin':p.name}
  else:
   # simple unit enums in source: tag names are strings in CBOR; others are opaque
   members=[]
   for line in chunk.splitlines():
    t=line.strip();mm=re.match(r'^([A-Z][A-Za-z_0-9]*),\s*$',t)
    if mm:members.append(mm.group(1))
   if members:enums[name]=members
report={'generator':'m27_generate_world_schema.py','origin_sha256':origins,'root':{
 'game':'Game','job_market':'CoachJobMarket','players':'Vec<Player>',
 'clubs':'Vec<Club>','coaches':'Vec<Coach>','stadiums':'Vec<Stadium>',
 'matches':'Vec<Match>','competitions':'Vec<Competition>','stages':'Vec<Stage>',
 'countries':'Vec<Country>','state_leagues':'Vec<StateLeague>','mods':'ModState'},
 'structs':structs,'enums':enums,
 'arena_types':{'PlayerId':'players','ClubId':'clubs','CoachId':'coaches','StadiumId':'stadiums',
  'MatchId':'matches','CompetitionId':'competitions','StageId':'stages','CountryId':'countries','StateLeagueId':'state_leagues'}}
p=root/'src/m27/persistence/world_schema.generated.json'
text=json.dumps(report,ensure_ascii=False,sort_keys=True,indent=2)+'\n'
if '--check' in __import__('sys').argv:
 assert p.read_text()==text,'generated schema drift'
else:p.write_text(text)
print(f'{len(structs)} structs, {sum(len(s["fields"]) for s in structs.values())} fields, {len(enums)} enums, sha PASS -> {p}')
