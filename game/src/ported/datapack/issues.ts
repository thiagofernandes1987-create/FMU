/** M21 — crates/datapack/src/issues.rs: gravidade, códigos e relatório legível.
 * Este contrato mapeia enum structured e diferencia aviso de erro. */
export const ISSUE_CODES=[
 'unreadable','syntax','missing-manifest','unsupported-format','patch-without-base','removals-in-base',
 'unknown-file','bad-folder-name','missing-club-file','missing-squad','unknown-club',
 'country-folder-mismatch','file-name-mismatch','unknown-country','unknown-state',
 'state-outside-brazil','missing-state','empty-name','bad-color','out-of-range',
 'potential-off-scale','unknown-position','unknown-side','unknown-trait',
 'unknown-rival','missing-crest','bad-division','duplicate-division',
 'unknown-state-format','unknown-removal'] as const;
export type IssueCode=typeof ISSUE_CODES[number];
export interface PackIssue {path:string;line?:number;code:IssueCode;details?:Record<string,string|number>;}
const WARNINGS=new Set<IssueCode>(['unknown-file','missing-state','out-of-range','potential-off-scale',
 'unknown-rival','missing-crest','unknown-removal']);
export function issueSeverity(code:IssueCode):'warning'|'error'{return WARNINGS.has(code)?'warning':'error';}
export function hasPackErrors(issues:readonly PackIssue[]):boolean{return issues.some(i=>issueSeverity(i.code)==='error');}
/** `Issue::Display` compõe `error: file:line: cause`; detalhes são exibidos sem HTML. */
export function formatPackIssue(issue:PackIssue):string{
 if(!ISSUE_CODES.includes(issue.code))throw new Error('Unknown issue code');
 const d=issue.details??{},v=(key:string)=>String(d[key]??'');
 let msg:string;
 switch(issue.code){
 case 'unreadable':msg=`cannot read the file: ${v('reason')}`;break;
 case 'syntax':msg=v('reason');break;
 case 'missing-manifest':msg='no manifest.toml at the root';break;
 case 'unsupported-format':msg=`format ${v('found')}, this version reads 1`;break;
 case 'patch-without-base':msg='a patch needs a base below it';break;
 case 'removals-in-base':msg='only a patch removes things';break;
 case 'unknown-file':msg='not part of the format, ignored';break;
 case 'bad-folder-name':msg=`folder name ${JSON.stringify(v('name'))} must be lowercase letters, digits and hyphens`;break;
 case 'missing-club-file':msg='club folder without club.toml';break;
 case 'missing-squad':msg='club without squad.csv';break;
 case 'unknown-club':msg='changes a club no layer below has';break;
 case 'country-folder-mismatch':msg=`club of ${v('country')} in the folder of ${v('folder')}`;break;
 case 'file-name-mismatch':msg=`the file should be named ${v('expected')}`;break;
 case 'unknown-country':msg=`unknown country ${JSON.stringify(v('code'))} (FIFA trigram expected)`;break;
 case 'unknown-state':msg=`unknown state ${JSON.stringify(v('code'))}`;break;
 case 'state-outside-brazil':msg='only Brazilian clubs have a state';break;
 case 'missing-state':msg='Brazilian club without a state, it plays no state league';break;
 case 'empty-name':msg='empty name';break;
 case 'bad-color':msg=`color ${JSON.stringify(v('value'))} is not #rrggbb`;break;
 case 'out-of-range':msg=`${v('field')} ${v('value')} outside ${v('min')}..${v('max')}, the game replaces it`;break;
 case 'potential-off-scale':msg=`potential ${v('value')} off the 0..10 scale, the game uses it as it is`;break;
 case 'unknown-position':msg=`unknown position ${JSON.stringify(v('code'))}`;break;
 case 'unknown-side':msg=`unknown side ${JSON.stringify(v('code'))}`;break;
 case 'unknown-trait':msg=`unknown trait ${JSON.stringify(v('code'))}`;break;
 case 'unknown-rival':msg=`rival ${v('id')} is not in the database`;break;
 case 'missing-crest':msg='club without crest.png';break;
 case 'bad-division':msg=`division ${v('division')} outside 1..4`;break;
 case 'duplicate-division':msg=`division ${v('division')} configured twice`;break;
 case 'unknown-state-format':msg=`unknown state league format ${JSON.stringify(v('code'))}`;break;
 case 'unknown-removal':msg=`removes ${v('id')}, which no layer below has`;break;
 }
 return `${issueSeverity(issue.code)}: ${issue.path}${issue.line===undefined?'':`:${issue.line}`}: ${msg}`;
}
