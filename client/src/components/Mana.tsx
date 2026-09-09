export function Mana({ current, max, compact = false }: { current: number; max: number; compact?: boolean }) {
  return (
    <div className={`mana ${compact ? "compact" : ""}`} aria-label={`${current}/${max} 法力`}>
      <span className="mana-count"><b>{current}</b> / {max}</span>
      <span className="crystals">
        {Array.from({ length: max }, (_, index) => <i key={index} className={index < current ? "full" : "spent"} />)}
      </span>
    </div>
  );
}
