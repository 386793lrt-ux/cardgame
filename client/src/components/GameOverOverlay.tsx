export function GameOverOverlay({ won, turn, health, onReturn }: { won: boolean; turn: number; health: number; onReturn: () => void }) {
  return (
    <div className={`game-over ${won ? "victory" : "defeat"}`} role="dialog" aria-modal="true">
      <div className="result-rays" /><div className="result-sigil">{won ? "✦" : "◇"}</div>
      <p className="result-kicker">牌局终结</p><h2>{won ? "胜利" : "失败"}</h2>
      <div className="result-summary"><span>历经 <b>{turn}</b> 回合</span><span>剩余生命 <b>{Math.max(0, health)}</b></span></div>
      <p>{won ? "裂隙回应了你的意志。" : "石桌归于寂静，下一局再会。"}</p>
      <button onClick={onReturn}>返回大厅</button>
    </div>
  );
}
