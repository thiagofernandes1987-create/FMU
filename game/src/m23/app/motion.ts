/** Rust crates/app/src/motion.rs: cubic easing/color blending and fade state.
 * Rendering egui dialogue stays unported. Pure calculations follow Rust f32. */
export const ANIMATION_SECONDS={HOVER:.12,SELECT:.18,DIALOG:.16,CONTENT:.22} as const;
export function easeOut(t:number):number {return 1-(1-t)**3;}
export type RGBA=readonly[number,number,number,number];
export function mixColor(a:RGBA,b:RGBA,t:number):RGBA {
 const alpha=Math.max(0,Math.min(1,t));return [0,1,2,3].map(i=>Math.max(0,Math.min(255,Math.round(a[i]!+(b[i]!-a[i]!)*alpha)))) as unknown as RGBA;
}
/** `since_change` independent transition state: unlike egui, no frame request issued. */
export class ContentFade {private lastKey?:string;private since=Number.NEGATIVE_INFINITY;
 update(key:string,now:number,seconds:number=ANIMATION_SECONDS.CONTENT):number{if(key!==this.lastKey){this.lastKey=key;this.since=now;}return easeOut(Math.max(0,Math.min(1,(now-this.since)/seconds)));}
}
