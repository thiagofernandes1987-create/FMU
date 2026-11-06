/**
 * Auditoria de fontes Rust e rastreabilidade de M19.
 * O histórico M18 (74/231) foi informado anteriormente, mas a matriz
 * M18 não está disponível neste contêiner; NÃO se fabrica um diff.
 */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const original=path.join(root,'upstream','brasfoot-next-main','crates');
const source=fs.existsSync(original)?original:path.join(root,'upstream','crates');
const rustFiles=[];
function walk(directory){for(const file of fs.readdirSync(directory,{withFileTypes:true})){
 const abs=path.join(directory,file.name);if(file.isDirectory())walk(abs);else if(file.name.endsWith('.rs'))rustFiles.push(abs);
}}
walk(source);rustFiles.sort();
const ported={
 'simulation/src/cup.rs':'src/simulation/cup.ts',
 'simulation/src/nations.rs':'src/simulation/nations.ts',
 'simulation/src/human/mod.rs':'src/simulation/human_default.ts',
 'simulation/src/human/substitutions.rs':'src/simulation/human_substitutions.ts',
 'simulation/src/trophy.rs':'src/simulation/trophy.ts',
 'simulation/src/season.rs':'src/simulation/season.ts',
 'simulation/src/sorting.rs':'src/simulation/sorting.ts',
 'systems/src/awards/coaches.rs':'src/systems/award_coaches.ts',
 'systems/src/awards/history.rs':'src/systems/award_history.ts',
 'systems/src/awards/clubs.rs':'src/systems/award_clubs.ts',
 'systems/src/awards/mod.rs':'src/systems/award_lifecycle.ts'
};
const results=rustFiles.map(abs=>{
 const original=path.relative(source,abs).replaceAll(path.sep,'/');
 const data=fs.readFileSync(abs);
 const parts=original.split('/');
 return {rust:`crates/${original}`,crate:parts[0],lines:data.toString('utf8').split('\n').length-1,
 sha256:crypto.createHash('sha256').update(data).digest('hex'),
 m19_ts:ported[original]??'',m19_status:ported[original]?'PORT_REVIEWED_STANDALONE':'NOT_EVALUATED_IN_M19'};
});
if(results.length!==231)throw Error(`Expected 231 Rust files, found ${results.length}`);
for(const [rs,ts] of Object.entries(ported)){
 if(!results.some(x=>x.rust===`crates/${rs}`)||!fs.existsSync(path.join(root,ts)))throw Error(`Invalid port mapping: ${rs} -> ${ts}`);
}
const csv=['rust_source,crate,loc,source_sha256,m19_ts,m19_status',...results.map(x=>[
 x.rust,x.crate,x.lines,x.sha256,x.m19_ts,x.m19_status].join(','))].join('\n')+'\n';
fs.writeFileSync(path.join(root,'docs','M19_SOURCE_INVENTORY.csv'),csv);
const baseline=74,total=231,target=Math.ceil((baseline/total+.25)*total); // 25 pontos percentuais
const both=results.filter(x=>['simulation','systems'].includes(x.crate));
const summary={total_rust_files:total,hashes_from_supplied_snapshot:231,baseline_m18_mapped_reported:baseline,
 baseline_percent:+(baseline/total*100).toFixed(2),target_plus_25_pp_percent:+((baseline/total*100)+25).toFixed(2),
 minimum_mapped_files_for_target:target,new_files_needed_for_target:target-baseline,
 m19_standalone_source_files:Object.keys(ported).length,
 combined_confirmed_mapping_from_m18:null,combined_coverage_percent:null,
 new_file_overlap_with_m18:'UNKNOWN: M18 porting matrix not mounted',
 per_crate_snapshot:{simulation:both.filter(x=>x.crate==='simulation').length,systems:both.filter(x=>x.crate==='systems').length},
 status:'GOAL_NOT_MET; NOT_CLAIMED',note:'Uma fonte Rust adaptada isoladamente não é prova de equivalência integral.'};
fs.writeFileSync(path.join(root,'docs','M19_PROGRESS.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
