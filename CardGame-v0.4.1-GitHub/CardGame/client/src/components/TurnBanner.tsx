export function TurnBanner({ kind }: { kind?: "YOUR_TURN" | "OPPONENT_TURN" }) {
  if (!kind) return null;
  return <div className={`turn-announcement ${kind === "YOUR_TURN" ? "friendly" : "enemy"}`} role="status"><i /><strong>{kind === "YOUR_TURN" ? "你的回合" : "对手回合"}</strong><span>{kind === "YOUR_TURN" ? "命运之轮由你推动" : "静候对手落子"}</span><i /></div>;
}
