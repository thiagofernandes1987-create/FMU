/** M21 — crates/systems/src/clock.rs::main_screen_tick. Ordem original completa.
 * Treze serviços + checkpoint antes de cada serviço. Erro interrompe fluxo. */
export const SCREEN_SERVICE_ORDER=[
 ['mod Estadios','stadiums'],['mod Base','academy'],['mod Jornal','news'],
 ['mod Economia','economy'],['mod Olheiros','scouts'],['mod Torcida','fans'],
 ['mod Mensal','monthly'],['mod Patrocinio','masterSponsor'],
 ['mod Investidor','investor'],['mod Cotas','sponsorSlots'],['mod Caixa','cash'],
 ['mod Emprestimos','loans'],['mod SuperMundial','superMundial']
] as const;
export type MainScreenService=typeof SCREEN_SERVICE_ORDER[number][1];
export interface ScreenTickHooks{humanCount:number;prepareNextTactic():void;checkpoint(label:string):void;services:Record<MainScreenService,()=>void>;}
export function mainScreenTick(h:ScreenTickHooks):void{
 if(h.humanCount>0)h.prepareNextTactic();
 for(const [checkpoint,service] of SCREEN_SERVICE_ORDER){h.checkpoint(checkpoint);h.services[service]();}
 h.checkpoint('mod end');
}
