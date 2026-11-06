/** M22 partial port simulation/src/new_season.rs::assign_day_kind and nth_day_of_kind.
 * Input year calendar with weekday and kind, output modified copy (no World mutation).
 * Full tournament/demotion and two-round generation are separate pending routines. */
export interface SeasonDay22{weekday:number;kind:number;tasksBefore:string[];tasksAfter:string[]}
export function assignDayKind22(days:readonly SeasonDay22[],today:number,weekday:number,kind:number):SeasonDay22[] {
 if(!Number.isInteger(today)||today<0||today>=days.length)throw Error('Invalid calendar today');
 const out=days.map(d=>({...d,tasksBefore:[...d.tasksBefore],tasksAfter:[...d.tasksAfter]}));
 let from=0;for(let i=out.length-1;i>=1;i--)if(out[i]!.kind>0){from=i;break;}
 from=Math.max(from,today);
 let found=0;for(let i=from;i<out.length;i++)if(out[i]!.kind===0&&out[i]!.weekday===weekday){found=i;break;}
 if(found>0)out[found]!.kind=kind;return out;
}
export function nthDayOfKind22(days:readonly SeasonDay22[],kind:number,n:number):number|undefined {
 if(!Number.isInteger(n)||n<0)throw Error('Invalid n-th day');let seen=0;
 for(let i=0;i<days.length;i++)if(days[i]!.kind===kind){if(seen===n)return i;seen++;}
 return undefined;
}
export function addCalendarTask22(days:SeasonDay22[],day:number,task:string,after:boolean):void {
 const d=days[day];if(!d)throw Error('Missing season day');(after?d.tasksAfter:d.tasksBefore).push(task);
}
