/** M22 partial port engine/src/engine.rs weight tables and deterministic `pick`.
 * Dependencies: callback nextDouble (JavaRandom). Output index or base.len() on zero total.
 * No match events are synthesized here; match scoring is handled by game engine. */
export const GOAL_KIND22={NORMAL:1,OWN_GOAL:2,PENALTY:3,FREE_KICK:4,OLYMPIC:5} as const;
export const ENGINE_SHOT_WEIGHTS22={initial:[5.5,35.55,15],after3:[4.5,40.55,15],after5:[3,40.55,15],after6:[.5,40.55,15]} as const;
export const SCORER_WEIGHTS22=[-1,-1,...Array(8).fill(1),8,...Array(3).fill(4),...Array(4).fill(8),...Array(8).fill(22)] as const;
export function pickWeighted22(base:readonly number[],weights:readonly number[],draw:()=>number):number {
 if(base.length!==weights.length||base.some((x,i)=>!Number.isFinite(x*weights[i]!)||x*weights[i]!<0))throw Error('Invalid weights');
 const v=base.map((x,i)=>x*weights[i]!),total=v.reduce((a,b)=>a+b,0);
 const n=draw();if(!Number.isFinite(n)||n<0||n>=1)throw Error('Expected RNG double [0,1)');
 let acc=0;for(let i=0;i<v.length;i++){acc+=v[i]!;if(n*total<acc)return i;}return v.length;
}
