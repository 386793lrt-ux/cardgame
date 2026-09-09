import type { PublicPlayerState } from "@riftbound/shared";
import { DamageNumber } from "./DamageNumber";

export function Hero({ player, enemy, targetable, impacted, floating, onClick }: {
  player: PublicPlayerState;
  enemy?: boolean;
  targetable?: boolean;
  impacted?: boolean;
  floating?: Array<{ id: string; amount: number; kind: "damage" | "heal" }>;
  onClick?: () => void;
}) {
  return (
    <button
      className={`hero ${enemy ? "enemy" : "friendly"} ${targetable ? "targetable" : ""} ${impacted ? "impact" : ""}`}
      onClick={(event) => { event.stopPropagation(); onClick?.(); }}
      disabled={!onClick}
      aria-label={`${enemy ? "敌方" : "己方"}英雄 ${player.name}，${player.health} 点生命`}
    >
      <span className="hero-portrait"><span>{enemy ? "☾" : "✦"}</span></span>
      <span className="hero-copy"><small>{enemy ? "暗影旅者" : "裂隙行者"}</small><b>{player.name}</b></span>
      <span className={`health-gem ${impacted ? "changed" : ""}`}>♥ {Math.max(0, player.health)}</span>
      {floating?.map((cue) => <DamageNumber key={cue.id} amount={cue.amount} kind={cue.kind} />)}
    </button>
  );
}
