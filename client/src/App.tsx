import { useEffect, useMemo, useState } from "react";
import {
  type ActionTarget,
  type CardView,
  type ConnectionStatus,
  type MinionView,
  type PlayerViewState,
  type PublicPlayerState,
  type RoomState,
  translateZhCn
} from "@riftbound/shared";
import { errorMessage } from "./errorMessages";
import { gameClient } from "./gameClient";

type LobbyMode = "HOME" | "JOIN";

function HealthGem({ value }: { value: number }) {
  return <span className="health-gem" aria-label={`${value} 点生命`}>♥ {Math.max(0, value)}</span>;
}

function Hero({ player, enemy, targetable, onClick }: {
  player: PublicPlayerState;
  enemy?: boolean;
  targetable?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={`hero ${enemy ? "enemy" : "friendly"} ${targetable ? "targetable" : ""}`}
      onClick={onClick}
      disabled={!onClick}
      aria-label={`${enemy ? "敌方" : "己方"}英雄 ${player.name}，${player.health} 点生命`}
    >
      <span className="hero-sigil">{enemy ? "☽" : "☀"}</span>
      <span className="hero-name">{player.name}</span>
      <HealthGem value={player.health} />
    </button>
  );
}

function Minion({ minion, selected, targetable, onClick }: {
  minion: MinionView;
  selected?: boolean;
  targetable?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={`minion ${minion.canAttack ? "ready" : ""} ${selected ? "selected" : ""} ${targetable ? "targetable" : ""}`}
      onClick={onClick}
      disabled={!onClick}
      aria-label={`${translateZhCn(minion.nameKey)}，${minion.attack} 攻击，${minion.health} 生命`}
    >
      <span className="minion-rune">{minion.rune}</span>
      <span className="minion-name">{translateZhCn(minion.nameKey)}</span>
      <span className="stat attack">⚔ {minion.attack}</span>
      <span className="stat health">♥ {minion.health}</span>
      {!minion.canAttack && <span className="sleep-mark">休整</span>}
    </button>
  );
}

function Card({ card, selected, playable, index, onClick }: {
  card: CardView;
  selected: boolean;
  playable: boolean;
  index: number;
  onClick: () => void;
}) {
  return (
    <button
      className={`card ${card.type.toLowerCase()} ${selected ? "selected" : ""} ${playable ? "playable" : ""}`}
      onClick={onClick}
      aria-label={`第 ${index + 1} 张手牌，${translateZhCn(card.nameKey)}，费用 ${card.cost}`}
    >
      <span className="card-cost">{card.cost}</span>
      <span className="card-art"><span>{card.rune}</span></span>
      <span className="card-name">{translateZhCn(card.nameKey)}</span>
      <span className="card-type">{card.type === "MINION" ? "随从" : "法术"}</span>
      <span className="card-description">{translateZhCn(card.descriptionKey)}</span>
      {card.type === "MINION" && (
        <>
          <span className="card-stat attack">{card.attack}</span>
          <span className="card-stat health">{card.health}</span>
        </>
      )}
    </button>
  );
}

function Mana({ current, max }: { current: number; max: number }) {
  return (
    <div className="mana" aria-label={`${current}/${max} 法力`}>
      <span className="mana-count">◈ {current}/{max}</span>
      <span className="crystals">
        {Array.from({ length: max }, (_, index) => (
          <i key={index} className={index < current ? "full" : "spent"} />
        ))}
      </span>
    </div>
  );
}

function connectionText(status: ConnectionStatus): string {
  if (status === "CONNECTED") return "● 服务器已连接";
  if (status === "CONNECTING") return "○ 服务器连接中……";
  if (status === "RECONNECTING") return "○ 网络断开，正在重新连接……";
  if (status === "FAILED") return "○ 无法连接服务器";
  return "○ 已断开连接";
}

function Lobby({ connectionStatus, mode, setMode, error, room }: {
  connectionStatus: ConnectionStatus;
  mode: LobbyMode;
  setMode: (mode: LobbyMode) => void;
  error: string;
  room: RoomState | null;
}) {
  const connected = connectionStatus === "CONNECTED";
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const create = () => {
    setBusy(true);
    void gameClient.createRoom(name).finally(() => setBusy(false));
  };
  const join = () => {
    setBusy(true);
    void gameClient.joinRoom(code, name).finally(() => setBusy(false));
  };

  if (room) {
    return (
      <main className="lobby-shell">
        <section className="lobby-panel waiting-panel">
          <div className="brand-mark">✦</div>
          <p className="eyebrow">裂隙牌局</p>
          <h1>等待另一位旅者</h1>
          <p className="room-code-label">房间码</p>
          <strong className="room-code">{room.roomId}</strong>
          <p className="waiting-note">把六位房间码告诉朋友，加入后牌局会自动开始。</p>
          <div className="seat-list">
            <span>玩家 1</span><b>{room.players[0]?.name}</b>
            <span>玩家 2</span><b className="empty-seat">等待加入…</b>
          </div>
          <div className="pulse-orbit" aria-hidden="true"><i /><i /><i /></div>
        </section>
      </main>
    );
  }

  return (
    <main className="lobby-shell">
      <section className="lobby-panel">
        <div className="brand-mark">✦</div>
        <p className="eyebrow">双人回合制卡牌对决</p>
        <h1>裂隙牌局</h1>
        <p className="lobby-intro">在石桌两端召唤异界生灵，以法术改写胜负。</p>
        <label className="field-label" htmlFor="player-name">你的称号</label>
        <input id="player-name" maxLength={16} value={name} onChange={(event) => setName(event.target.value)} placeholder="无名旅者" />

        {mode === "HOME" ? (
          <div className="lobby-actions">
            <button className="primary-action" onClick={create} disabled={!connected || busy}>创建房间</button>
            <button className="secondary-action" onClick={() => setMode("JOIN")} disabled={!connected}>加入房间</button>
          </div>
        ) : (
          <div className="join-form">
            <label className="field-label" htmlFor="room-code">六位房间码</label>
            <input id="room-code" inputMode="numeric" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} placeholder="482913" />
            <div className="lobby-actions">
              <button className="primary-action" onClick={join} disabled={!connected || busy || code.length !== 6}>进入牌局</button>
              <button className="secondary-action" onClick={() => setMode("HOME")}>返回</button>
            </div>
          </div>
        )}
        <p className={`connection ${connected ? "online" : "offline"}`}>{connectionText(connectionStatus)}</p>
        {error && <p className="lobby-error" role="alert">{error}</p>}
      </section>
    </main>
  );
}

export function App() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(gameClient.getConnectionStatus());
  const [mode, setMode] = useState<LobbyMode>("HOME");
  const [room, setRoom] = useState<RoomState | null>(null);
  const [game, setGame] = useState<PlayerViewState | null>(null);
  const [error, setError] = useState("");
  const [selectedHand, setSelectedHand] = useState<number | null>(null);
  const [selectedAttacker, setSelectedAttacker] = useState<string | null>(null);

  useEffect(() => {
    const clearMessage = window.setTimeout(() => error && setError(""), 4000);
    return () => window.clearTimeout(clearMessage);
  }, [error]);

  useEffect(() => {
    const onRoom = (nextRoom: RoomState) => setRoom(nextRoom);
    const onGame = (nextGame: PlayerViewState) => {
      setGame(nextGame);
      setSelectedHand(null);
      setSelectedAttacker(null);
    };
    const unsubscribers = [
      gameClient.onConnectionChange(setConnectionStatus),
      gameClient.onRoomState(onRoom),
      gameClient.onGameUpdate(onGame),
      gameClient.onError((code) => setError(errorMessage(code))),
      gameClient.onOpponentConnection((connected) => {
        setGame((current) => current ? { ...current, opponentConnected: connected } : current);
        setError(connected ? "对手已重新连接。" : "对手已断开连接，等待对手重连……");
      })
    ];
    gameClient.connect();
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      gameClient.disconnect();
    };
  }, []);

  const isYourTurn = game?.currentPlayerId === game?.you.playerId && game?.status === "PLAYING";
  const selectedCard = selectedHand === null ? null : game?.you.hand[selectedHand] ?? null;
  const targetMode = useMemo(() => {
    if (!selectedCard || selectedCard.type !== "SPELL") return null;
    if (selectedCard.effect.type === "DEAL_DAMAGE") return "ENEMY";
    if (selectedCard.effect.type === "BUFF") return "FRIENDLY_MINION";
    return null;
  }, [selectedCard]);

  if (!game) return <Lobby connectionStatus={connectionStatus} mode={mode} setMode={setMode} error={error} room={room} />;

  const connected = connectionStatus === "CONNECTED";

  const playFromHand = (index: number) => {
    if (!isYourTurn) return setError("现在是对手的回合。");
    const card = game.you.hand[index];
    if (!card || card.cost > game.you.mana) return setError("法力不足。");
    if (card.type === "SPELL" && (card.effect.type === "DEAL_DAMAGE" || card.effect.type === "BUFF")) {
      setSelectedAttacker(null);
      setSelectedHand(selectedHand === index ? null : index);
      return;
    }
    gameClient.playCard(card.instanceId);
  };

  const chooseFriendlyMinion = (minion: MinionView) => {
    if (selectedHand !== null && targetMode === "FRIENDLY_MINION") {
      const card = game.you.hand[selectedHand];
      if (card) gameClient.playCard(card.instanceId, { type: "MINION", playerId: game.you.playerId, instanceId: minion.instanceId });
      return;
    }
    if (!isYourTurn || !minion.canAttack) return;
    setSelectedHand(null);
    setSelectedAttacker(selectedAttacker === minion.instanceId ? null : minion.instanceId);
  };

  const chooseEnemyTarget = (target: ActionTarget) => {
    if (selectedHand !== null && targetMode === "ENEMY") {
      const card = game.you.hand[selectedHand];
      if (card) gameClient.playCard(card.instanceId, target);
    } else if (selectedAttacker) {
      gameClient.attack(selectedAttacker, target);
    }
  };

  const resultText = game.status === "FINISHED" ? (game.winnerId === game.you.playerId ? "胜利" : "败北") : "";
  const interactionHint = selectedCard
    ? targetMode === "ENEMY" ? "选择一个敌方目标" : "选择一个己方随从"
    : selectedAttacker ? "选择攻击目标" : isYourTurn ? "你的回合" : "对手正在行动";

  return (
    <main className={`game-shell ${isYourTurn ? "your-turn" : "enemy-turn"}`}>
      <header className="game-header">
        <div><span className="tiny-label">房间</span><strong>{game.roomId}</strong></div>
        <div className="turn-banner"><span>回合 {game.turn}</span><b>{interactionHint}</b></div>
        <div className="header-actions">
          <div className={`server-dot ${connected ? "online" : ""}`}>{connectionText(connectionStatus)}</div>
          <button className="surrender" onClick={() => gameClient.surrender()} disabled={game.status !== "PLAYING"}>认输</button>
        </div>
      </header>

      {!game.opponentConnected && game.status === "PLAYING" && (
        <div className="toast" role="status">对手已断开连接，等待对手重连……</div>
      )}

      <section className="battle-table">
        <div className="enemy-zone">
          <div className="hero-row enemy-row">
            <Hero
              player={game.opponent}
              enemy
              targetable={Boolean(selectedAttacker || targetMode === "ENEMY")}
              onClick={selectedAttacker || targetMode === "ENEMY" ? () => chooseEnemyTarget({ type: "HERO", playerId: game.opponent.playerId }) : undefined}
            />
            <div className="opponent-resources">
              <span>牌库 {game.opponent.deckCount}</span>
              <Mana current={game.opponent.mana} max={game.opponent.maxMana} />
            </div>
          </div>
          <div className="opponent-hand" aria-label={`对手有 ${game.opponent.handCount} 张手牌`}>
            {Array.from({ length: game.opponent.handCount }, (_, index) => <i key={index} />)}
          </div>
          <div className="board enemy-board">
            {game.opponent.board.length === 0 && <span className="empty-board">敌方战场</span>}
            {game.opponent.board.map((minion) => (
              <Minion key={minion.instanceId} minion={minion} targetable={Boolean(selectedAttacker || targetMode === "ENEMY")} onClick={selectedAttacker || targetMode === "ENEMY" ? () => chooseEnemyTarget({ type: "MINION", playerId: game.opponent.playerId, instanceId: minion.instanceId }) : undefined} />
            ))}
          </div>
        </div>

        <div className="rift-line"><span>✦</span></div>

        <div className="friendly-zone">
          <div className="board friendly-board">
            {game.you.board.length === 0 && <span className="empty-board">己方战场</span>}
            {game.you.board.map((minion) => (
              <Minion key={minion.instanceId} minion={minion} selected={selectedAttacker === minion.instanceId} targetable={targetMode === "FRIENDLY_MINION"} onClick={(isYourTurn && minion.canAttack) || targetMode === "FRIENDLY_MINION" ? () => chooseFriendlyMinion(minion) : undefined} />
            ))}
          </div>
          <div className="hero-row friendly-row">
            <Hero player={game.you} />
            <Mana current={game.you.mana} max={game.you.maxMana} />
            <button className="end-turn" onClick={() => gameClient.endTurn()} disabled={!isYourTurn}>结束回合</button>
            <span className="deck-count">牌库 {game.you.deckCount}</span>
          </div>
        </div>
      </section>

      <section className="hand-zone" aria-label="你的手牌">
        {game.you.hand.map((card, index) => (
          <Card key={card.instanceId} card={card} index={index} selected={selectedHand === index} playable={Boolean(isYourTurn && card.cost <= game.you.mana)} onClick={() => playFromHand(index)} />
        ))}
      </section>

      {error && <div className="toast" role="alert">{error}</div>}
      {game.status === "FINISHED" && (
        <div className="game-over" role="dialog" aria-modal="true">
          <div className="result-sigil">{game.winnerId === game.you.playerId ? "✦" : "◇"}</div>
          <h2>{resultText}</h2>
          <p>{game.winnerId === game.you.playerId ? "裂隙回应了你的意志。" : "石桌归于寂静，下一局再会。"}</p>
          <button onClick={() => { gameClient.clearSession(); window.location.reload(); }}>返回大厅</button>
        </div>
      )}
    </main>
  );
}
