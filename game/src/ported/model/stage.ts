/** M21 — crates/model/src/stage.rs::kind_code. Fonte completa, sem efeitos. */
export interface SourceStage {class:'League'|'Knockout';kind:number;competitionKind:number;}
/** Liga usa kind; eliminatória preserva kind da competição (`tR`). */
export function stageKindCode(stage:SourceStage):number {
 return stage.class==='League'?stage.kind:stage.competitionKind;
}
