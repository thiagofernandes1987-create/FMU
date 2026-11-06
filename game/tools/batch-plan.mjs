/** Ordena todos os 88 módulos simulation/systems para priorizar lotes grandes. */
import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const src=path.join(root,'docs','M19_SOURCE_INVENTORY.csv');
const lines=fs.readFileSync(src,'utf8').trim().split('\n').slice(1);
const rows=lines.map(x=>{const [rust,crate,loc,sha,ts,status]=x.split(',');return {rust,crate,loc:+loc,sha,ts,status};})
 .filter(r=>['simulation','systems'].includes(r.crate));
if(rows.length!==88)throw Error(`Expected 88 modules, got ${rows.length}`);
const priority=(r)=>r.status==='PORT_REVIEWED_STANDALONE'?0:r.loc<=150?1:r.loc<=400?2:r.loc<=800?3:4;
rows.sort((a,b)=>priority(a)-priority(b)||a.loc-b.loc||a.rust.localeCompare(b.rust));
const out=['rust_source,crate,rust_lines,m19_ts,priority_wave,status,m18_overlap'];
for(const r of rows)out.push([r.rust,r.crate,r.loc,r.ts||'',`P${priority(r)}`,r.status,'UNVERIFIED_BASELINE'].join(','));
fs.writeFileSync(path.join(root,'docs','M19_BATCH88_PLAN.csv'),out.join('\n')+'\n');
console.log(JSON.stringify({all_231:true,both_crates:rows.length,m19_source_files:rows.filter(r=>r.status==='PORT_REVIEWED_STANDALONE').length,
 goal_new_mapped_needed:58,waves:Object.fromEntries([0,1,2,3,4].map(i=>['P'+i,rows.filter(r=>priority(r)===i).length])),note:'P1..P4 são fila de migração, não correspondências convertidas.'},null,2));
