/** Rust crates/app/src/screens/pitch.rs: exact 26 pitch slot coordinates; only
 * geometry converted, not egui painter. Center offset (+30,+25) is original. */
export const PITCH_SLOTS:ReadonlyArray<readonly[number,number]>=[
 [0,0],[190,565],[35,425],[100,485],[190,485],[285,485],[100,405],[190,405],[285,405],[345,425],
 [35,265],[100,315],[190,315],[285,315],[100,205],[190,205],[285,205],[345,265],
 [35,55],[100,115],[190,115],[285,115],[100,35],[190,30],[285,35],[345,55]
 ];
export function pitchSlotCenter(rect:{left:number;top:number;width:number;height:number},slot:number):{x:number;y:number}{
 if(!Number.isInteger(slot)||slot<1||slot>=PITCH_SLOTS.length)throw new RangeError('Invalid pitch slot');
 const [x,y]=PITCH_SLOTS[slot]!;return {x:rect.left+(x+30)/434*rect.width,y:rect.top+(y+25)/650*rect.height};
}
