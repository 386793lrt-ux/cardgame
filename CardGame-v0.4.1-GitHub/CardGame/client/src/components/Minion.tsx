import { translateZhCn, type MinionView } from "@riftbound/shared";
import { DamageNumber } from "./DamageNumber";

export function Minion({ minion, selected, targetable, summoned, attacking, impacted, dying, floating, onClick }: {
  minion: MinionView;
  selected?: boolean;
  targetable?: boolean;
  summoned?: boolean;
  attacking?: boolean;
  impacted?: boolean;
  dying?: boolean;
  floating?: Array<{ id: string; amount: number; kind: "damage" | "heal" }>;
  onClick?: () => void;
}) {
  const wounded = minion.health < minion.maxHealth;
  return (
    <button
      className={`minion ${minion.canAttack ? "ready" : "resting"} ${selected ? "selected" : ""} ${targetable ? "targetable" : ""} ${summoned ? "summoned" : ""} ${attacking ? "attacking" : ""} ${impacted ? "impact" : ""} ${dying ? "dying" : ""}`}
      onClick={(event) => { event.stopPropagation(); onClick?.(); }}
      disabled={!onClick || dying}
      aria-label={`${translateZhCn(minion.nameKey)}，${minion.attack} 攻击，${minion.health} 生命`}
    >
      <span className="minion-frame"><span className="minion-rune">{minion.rune}</span></span>
      <span className="minion-name">{translateZhCn(minion.nameKey)}</span>
      <span className="stat attack">⚔ {minion.attack}</span>
      <span className={`stat health ${wounded ? "wounded" : ""}`}>♥ {minion.health}</span>
      <span className="minion-state">{dying ? "消散" : minion.canAttack ? "可攻击" : "休整"}</span>
      {floating?.map((cue) => <DamageNumber key={cue.id} amount={cue.amount} kind={cue.kind} />)}
    </button>
  );
}
