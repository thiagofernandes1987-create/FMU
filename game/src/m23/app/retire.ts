/** Rust crates/app/src/screens/retire.rs::RetireState::new.
 * Initializes retire dialog with blank name and player position clamped to 0..4. */
export type RetireViewState={playerId:string;name:string;position:number};
export function retireViewState(playerId:string,position:number):RetireViewState{
 if(!Number.isInteger(position))throw new RangeError('Invalid player position');
 return {playerId,name:'',position:Math.min(4,Math.max(0,position))};
}
