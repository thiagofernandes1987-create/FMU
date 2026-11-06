/**
 * M28 — canonical lifecycle of a real Rust .bfn World without converting it
 * to fictitious M24 DemoCareer. Origin contracts: model/save_numbers.rs,
 * model/world.rs, persistence/native.rs and migration.rs.
 * `openCareerWorld`: deserialize, validate complete graph, relink transient
 * transfer & competition references, audit cross-arena ownership.
 * `persistCareerWorld`: assign save numbers, validate, write with M27 backups,
 * and read it back to verify the whole round-trip.
 * No match generator or new season state is manufactured by this adapter.
 */
declare function require(name:string):any;
const fs=require('node:fs');
import {WorldDocument,loadBfnWorld,writeBfnWorldAtomic} from '../m27/persistence/bfn_world';
import {worldTransaction} from '../m27/persistence/world_access';
import {relinkTransfersFromSaveNumbers,linkCompetitionStats,prepareWorldForSave} from './save_numbers';
import {auditWorldSemantics,WorldAuditReport} from './world_audit';
export interface OpenCareerResult {
 document:WorldDocument;audit:WorldAuditReport;relinked:{transfers:number;unresolvedTransfers:number;competitionStats:number};
}
/** Opens and restores Rust's transient IDs; invalid semantic graph fails closed by default. */
export function openCareerWorld(bytes:Uint8Array,options:{enforceSemantics?:boolean;requireRuntimePreflight?:boolean}={}):OpenCareerResult {
 const doc=loadBfnWorld(bytes,{requireRuntimePreflight:options.requireRuntimePreflight});
 let transfers=0,unresolvedTransfers=0,competitionStats=0;
 const normalized=worldTransaction(doc,w=>{
  const r=relinkTransfersFromSaveNumbers(w);transfers=r.relinked;unresolvedTransfers=r.unresolved;
  competitionStats=linkCompetitionStats(w);
 });
 const audit=auditWorldSemantics(normalized.world);
 if((options.enforceSemantics??true)&&!audit.valid)throw Error('World cross-arena semantic errors: '+audit.findings.filter(x=>x.severity==='ERROR').map(x=>x.code+'@'+x.path).slice(0,5).join(', '));
 return {document:normalized,audit,relinked:{transfers,unresolvedTransfers,competitionStats}};
}
/** Save at path, read back as a validated World, and verify reference stability. */
export function persistCareerWorld(filename:string,doc:WorldDocument):{document:WorldDocument;reopened:OpenCareerResult;size:number} {
 const normalized=prepareWorldForSave(doc);
 const audit=auditWorldSemantics(normalized.world);
 if(!audit.valid)throw Error('World semantic audit refused persist');
 writeBfnWorldAtomic(filename,normalized);
 const bytes=fs.readFileSync(filename) as Uint8Array;
 const reopened=openCareerWorld(bytes);
 if(reopened.document.world.players.length!==normalized.world.players.length||
  reopened.document.world.clubs.length!==normalized.world.clubs.length)throw Error('World save round-trip changed arena lengths');
 return {document:normalized,reopened,size:bytes.length};
}
