/** Synthetic schema-accurate test fixtures, NOT real saves from Brasfoot Next. */
import schema from '../src/m27/persistence/world_schema.generated.json';
import {RustWorld,WorldDocument,loadBfnWorld} from '../src/m27/persistence/bfn_world';
import {CborValue,CborRecord} from '../src/m26/persistence/cbor';
import {writeBfnPayload} from '../src/m26/persistence/bfn_codec';
const structs=schema.structs as Record<string,{fields:Record<string,{type:string;default:boolean}>}>;
const arenatypes=schema.arena_types as Record<string,string>;
const meta={format_version:3,app_version:'M28 fixtures',club:'Example FC',coach:'Example',date:'2031-03-10',season:2031,saved_at:12345,imported_from:null};
function split(s:string):string[]{let depth=0,buf='',out:string[]=[];
 for(const c of s){if('<(['.includes(c))depth++;else if('>)]'.includes(c))depth--;
  if(c===','&&depth===0){out.push(buf.trim());buf='';}else buf+=c;
 }out.push(buf.trim());return out;
}
export function defaults(t:string,depth=0):CborValue{
 if(depth>40)throw Error('Recursive field: '+t);
 t=t.replace(/^std::collections::/,'');
 if(t.startsWith('Option<'))return null;
 if(t.startsWith('Vec<')||t.startsWith('BTreeSet<'))return [];
 if(t.startsWith('BTreeMap<')||t.startsWith('HashMap<'))return new Map();
 if(t.startsWith('[')){const [q,n]=t.slice(1,-1).split(';');return Array.from({length:Number(n)},()=>defaults(q!.trim(),depth+1));}
 if(t.startsWith('('))return split(t.slice(1,-1)).map(q=>defaults(q,depth+1));
 if(t==='String')return '';if(t==='bool')return false;
 if(t==='f32'||t==='f64'||t==='EpochMillis'||/^[iu]\d+$/.test(t))return 0;
 if(arenatypes[t])return 0;
 if(t in schema.enums)return (schema.enums as Record<string,string[]>)[t]?.[0]??'';
 if(t in structs){const o:Record<string,CborValue>=Object.create(null);
  for(const [k,v] of Object.entries(structs[t]!.fields))o[k]=defaults(v.type,depth+1);
  return o;
 }
 return null;
}
export function world28():RustWorld{
 const o:Record<string,CborValue>=Object.create(null);
 for(const [k,type] of Object.entries(schema.root))o[k]=defaults(type);
 const w=o as RustWorld;w.game.season=2031;w.game.day=0;
 return w;
}
export function doc28(w:RustWorld):WorldDocument{return loadBfnWorld(writeBfnPayload(meta,w));}
export function appendPlayer(w:RustWorld,clubId:number,age=23,salary=600):number{
 const p=defaults('Player') as CborRecord,id=w.players.length;p.name='Atleta '+id;p.age=age;p.position=1;p.salary=salary;
 p.strength=65;p.club=clubId;p.save_number=-1;p.save_list=-1;p.contract_until=1700000000000n;p.market_value=800;
 w.players.push(p);(w.game.players as number[]).push(id);
 if(clubId>=0)(w.clubs[clubId]!.squad as number[]).push(id);
 return id;
}
export function appendClub(w:RustWorld,name='FC',human=false):number{
 const c=defaults('Club') as CborRecord,id=w.clubs.length;c.id=id+100;c.name=name;c.human=human;c.cash=100_000n;
 w.clubs.push(c);(w.game.clubs as number[]).push(id);return id;
}
export function appendCompetition(w:RustWorld):number{
 const c=defaults('Competition') as CborRecord,id=w.competitions.length;c.name='Copa '+id;c.kind=1;
 c.legacy_id=-1;w.competitions.push(c);return id;
}
export function appendDay(w:RustWorld,epoch=Date.UTC(2031,2,10),kind=1):number{
 const d=defaults('Day') as CborRecord;d.date=epoch;d.kind=kind;(w.game.days as CborRecord[]).push(d);return (w.game.days as CborRecord[]).length-1;
}
export function appendMatch(w:RustWorld,day:number,home:number,away:number,played=false):number{
 const m=defaults('Match') as CborRecord,id=w.matches.length;m.home=home;m.away=away;m.played=played;m.day=day;
 w.matches.push(m);((w.game.days as CborRecord[])[day]!.matches as number[]).push(id);return id;
}
