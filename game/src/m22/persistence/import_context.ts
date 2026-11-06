/** M22 port partial: persistence/src/import/context.rs::Arena::of_class and node helpers.
 * Converts Java class names to shared arena; unknown classes are not silently assigned. */
export type ArenaName='Player'|'Club'|'Coach'|'Stadium'|'Match'|'Country'|'StateLeague'|'Stage'|'Competition';
const FIXED:Readonly<Record<string,ArenaName>>={'best.F':'Player','best.ah':'Club','best.al':'Coach','best.v':'Stadium','best.I':'Match','best.Z':'Country','best.w':'StateLeague','f.s':'Stage','f.z':'Stage'};
export function arenaOfClass(name:string):ArenaName|undefined {if(name==='f.G')return undefined;return FIXED[name]??(name.startsWith('f.')?'Competition':undefined);}
/** Mapping Java graph node id to index among its arena peers; preserves discovery order. */
export function buildArenaIndex(nodes:readonly {id:number;className:string}[]):Record<ArenaName,number[]> {
 const out=Object.create(null) as Record<ArenaName,number[]>;
 for(const n of nodes){const a=arenaOfClass(n.className);if(a)(out[a]??=[]).push(n.id);}
 return out;
}
