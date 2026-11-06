/** Rust crates/app/src/screens/standings.rs::band. Pure classification of row:
 * promotion takes precedence over relegation; saturation of count-relegated. */
export type StandingsBand='promotion'|'relegation'|'neutral';
export function standingsBand(index:number,count:number,promoted:number,relegated:number):StandingsBand{
 if(index<0||count<0||promoted<0||relegated<0)throw new RangeError('Invalid standings band');
 if(index<promoted)return 'promotion';if(relegated>0&&index>=Math.max(0,count-relegated))return 'relegation';
 return 'neutral';
}
