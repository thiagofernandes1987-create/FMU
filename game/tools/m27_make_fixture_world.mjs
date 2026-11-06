/** Generates a synthetic *structurally valid* but non-playable World fixture from Rust schema.
 * For interoperability QA only. NOT an official Brasfoot career; never publish as playable. */
import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),schema=require('../dist/src/m27/persistence/world_schema.generated.json');
const {writeBfnPayload}=require('../dist/src/m26/persistence/bfn_codec.js');
function splitTop(s,sep){let depth=0,v='',out=[];for(const c of s){if('<(['.includes(c))depth++;if('>)]'.includes(c))depth--;if(c===sep&&depth===0){out.push(v.trim());v='';}else v+=c;}out.push(v.trim());return out;}
function init(type,depth=0){if(depth>40)throw Error('recursive Rust type '+type);type=type.replace(/^std::collections::/,'');
 if(type.startsWith('Option<'))return null;
 if(type.startsWith('Vec<')||type.startsWith('BTreeSet<'))return [];
 if(type.startsWith('BTreeMap<'))return new Map();
 if(type.startsWith('[')){const [item,n]=splitTop(type.slice(1,-1),';');return Array.from({length:Number(n)},()=>init(item,depth+1));}
 if(type.startsWith('('))return splitTop(type.slice(1,-1),',').map(item=>init(item,depth+1));
 if(type==='String')return '';if(type==='bool')return false;
 if(/^[iu]\d+$/.test(type)||['EpochMillis','f32','f64'].includes(type))return 0;
 if(schema.arena_types[type])return 0;
 if(schema.enums[type])return schema.enums[type][0];
 if(schema.structs[type]){const o={};for(const [name,field] of Object.entries(schema.structs[type].fields))o[name]=init(field.type,depth+1);return o;}
 return null;
}
const world={};for(const [name,type] of Object.entries(schema.root))world[name]=init(type);
world.game.season=1;world.game.day=0;
const meta={app_version:'M27 synthetic only',club:'',coach:'',date:'2031-03-15',season:2031,saved_at:0,imported_from:null,format_version:3};
const file=process.argv[2]??'/tmp/fmu_m27_world_fixture.bfn';fs.writeFileSync(file,writeBfnPayload(meta,world));
console.log(JSON.stringify({file,bytes:fs.statSync(file).size,world_fields:Object.keys(world),players:world.players.length,nonPlayable:true}));
