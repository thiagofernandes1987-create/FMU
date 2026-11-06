/** Rust crates/app/src/screens/proposals.rs: offer panel eligibility and
 * manual approval choice. Actual signature/ledger runs in systems/sponsors. */
export interface MasterOfferView {brand:string;yearly:number;years:number;bonusTop4:number;bonusLeague:number;bonusContinental:number;}
export function pendingMasterOffers(offers:readonly MasterOfferView[],hasHumanClub:boolean):MasterOfferView[]{return hasHumanClub?[...offers].slice(0,3):[];}
export function hasProposalBonus(p:MasterOfferView):boolean{return p.bonusTop4>0||p.bonusLeague>0||p.bonusContinental>0;}
