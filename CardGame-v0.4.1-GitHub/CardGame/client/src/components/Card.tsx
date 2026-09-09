import { translateZhCn, type CardView } from "@riftbound/shared";

export function Card({ card, selected, playable, drawn, index, fanOffset, fanAngle, onClick }: {
  card: CardView;
  selected: boolean;
  playable: boolean;
  drawn?: boolean;
  index: number;
  fanOffset: number;
  fanAngle: number;
  onClick: () => void;
}) {
  const style = { "--fan-x": `${fanOffset}px`, "--fan-r": `${fanAngle}deg` } as React.CSSProperties;
  return (
    <button
      className={`card ${card.type.toLowerCase()} ${selected ? "selected" : ""} ${playable ? "playable" : "unplayable"} ${drawn ? "drawn" : ""}`}
      style={style}
      disabled={!playable}
      onClick={(event) => { event.stopPropagation(); onClick(); }}
      aria-label={`第 ${index + 1} 张手牌，${translateZhCn(card.nameKey)}，费用 ${card.cost}`}
    >
      <span className="card-cost">{card.cost}</span>
      <span className="card-art"><span>{card.rune}</span><i /></span>
      <span className="card-name">{translateZhCn(card.nameKey)}</span>
      <span className="card-type">{card.type === "MINION" ? "随从 · 生灵" : "法术 · 奥术"}</span>
      <span className="card-description">{translateZhCn(card.descriptionKey)}</span>
      {card.type === "MINION" && <><span className="card-stat attack">{card.attack}</span><span className="card-stat health">{card.health}</span></>}
    </button>
  );
}
