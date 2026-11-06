/** Rust crates/app/src/screens/lineup.rs::FORMATION_KEYS and selection state.
 * The actual tactical simulation remains in the original engine. */
export const LINEUP_FORMATION_KEYS=['lineup-formation-select','lineup-formation-reset','lineup-formation-541','lineup-formation-532','lineup-formation-451','lineup-formation-442','lineup-formation-442-def','lineup-formation-433','lineup-formation-433-wings','lineup-formation-343','lineup-formation-352','lineup-formation-4231','lineup-formation-4231-def','lineup-formation-4231-wings'] as const;
export const PITCH_CONDITION_KEYS=['lineup-pitch-excellent','lineup-pitch-very-good','lineup-pitch-bad','lineup-pitch-poor'] as const;
export interface LineupView {grid:(string|undefined)[];selected?:number;dragging?:number;}
export function lineupClick(s:LineupView,slot:number):LineupView{
 if(!Number.isInteger(slot)||slot<0||slot>=s.grid.length)throw new RangeError('Invalid lineup slot');
 if(s.selected!==undefined&&s.selected!==slot){const grid=[...s.grid];[grid[s.selected],grid[slot]]=[grid[slot],grid[s.selected]];return {grid,selected:undefined,dragging:undefined};}
 return {...s,selected:s.selected===slot?undefined:s.grid[slot]!==undefined?slot:undefined};
}
