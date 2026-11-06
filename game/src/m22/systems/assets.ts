/** Fonte: systems/src/assets.rs. Limites de setores, custos e manutenção por pilar.
 * Valores extraídos da fonte Rust; cálculo puro. Não movimenta o caixa. */
export type AssetPillar22='Arena'|'TrainingCentre'|'Academy'|'Marketing';
const UPKEEP:Record<AssetPillar22,readonly number[]>={Arena:[0,120000,280000,650000,1400000,2800000],TrainingCentre:[0,100000,240000,550000,1200000,2400000],Academy:[0,80000,200000,480000,1000000,2000000],Marketing:[0,90000,220000,500000,1100000,2200000]};
const PRICES=[[80,160,240,500,700,1100],[120,380,640,700,1400,2200],[300,600,750,800,1200,2000],[1500,3500,4000,6000,6400,10000]];
const BANDS=[[1000,2500,3500,10000,20000,30000],[5000,15000,30000,60000,100000,140000],[1000,2000,3000,5000,10000,25000],[100,200,500,600,800,1500]];
export function pillarUpkeep22(p:AssetPillar22,level:number):number{return UPKEEP[p][Math.max(0,Math.min(5,level))]!;}
export function sectorLimits22(season:number):readonly number[]{return season>=10?[25000,130000,20000,1200]:season>=6?[25000,120000,15000,1000]:season>=2?[20000,100000,10000,800]:[18000,80000,9000,700];}
export function assetSectorCost22(sector:number,current:number,add:number):number{
 if(add<=0)return 0;if(!BANDS[sector])throw RangeError('Invalid sector');
 const band=BANDS[sector]!.findIndex(value=>current+add<=value);
 return PRICES[sector]![band<0?5:band]!*add;
}
export function assetWorkDays22(seats:number):number{return seats<1000?15:seats<10000?20:seats<30000?30:40;}
export function academyTarget22(level:number):number{return 10+level*2;}
