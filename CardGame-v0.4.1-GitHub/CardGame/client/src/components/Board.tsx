import type { MinionView } from "@riftbound/shared";
import type { DyingMinionCue, FloatingNumberCue } from "../uiModel";
import { Minion } from "./Minion";

export function Board({ minions, owner, selectedAttacker, targetableIds, summonedIds, dying, attackingId, impactedIds, floating, onMinion }: {
  minions: MinionView[];
  owner: "YOU" | "OPPONENT";
  selectedAttacker?: string;
  targetableIds: Set<string>;
  summonedIds: Set<string>;
  dying: DyingMinionCue[];
  attackingId?: string;
  impactedIds: Set<string>;
  floating: FloatingNumberCue[];
  onMinion: (minion: MinionView) => void;
}) {
  const ghosts = dying.filter((cue) => cue.owner === owner);
  return (
    <div className={`board ${owner === "YOU" ? "friendly-board" : "enemy-board"}`} data-count={minions.length + ghosts.length}>
      {minions.length + ghosts.length === 0 && <span className="empty-board">{owner === "YOU" ? "你的召唤阵" : "对手的召唤阵"}</span>}
      {minions.map((minion) => <Minion key={minion.instanceId} minion={minion} selected={selectedAttacker === minion.instanceId} targetable={targetableIds.has(minion.instanceId)} summoned={summonedIds.has(minion.instanceId)} attacking={attackingId === minion.instanceId} impacted={impactedIds.has(minion.instanceId)} floating={floating.filter((cue) => cue.targetId === minion.instanceId)} onClick={() => onMinion(minion)} />)}
      {ghosts.map(({ minion }) => <Minion key={`dying-${minion.instanceId}`} minion={minion} dying impacted floating={floating.filter((cue) => cue.targetId === minion.instanceId)} />)}
    </div>
  );
}
