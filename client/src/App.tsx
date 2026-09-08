import { useEffect, useMemo, useState } from "react";
import {
  CARD_BY_ID,
  type ActionTarget,
  type CardDefinition,
  type ClientGameState,
  type MinionState,
  type PublicPlayerState,
  type RoomState
} from "@riftbound/shared";
import { socket } from "./socket";

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
  minion: MinionState;
  selected?: boolean;
  targetable?: boolean;
  onClick?: () => void;
}) {
  const card = CARD_BY_ID.get(minion.cardId);
  return (
    <button
      className={`minion ${minion.canAttack ? "ready" : ""} ${selected ? "selected" : ""} ${targetable ? "targetable" : ""}`}
      onClick={onClick}
      disabled={!onClick}
      aria-label={`${card?.name ?? "随从"}，${minion.attack} 攻击，${minion.health} 生命`}
    >
      <span className="minion-rune">{card?.rune ?? "?"}</span>
      <span className="minion-name">{card?.name}</span>
      <span className="stat attack">⚔ {minion.attack}</span>
      <span className="stat health">♥ {minion.health}</span>
      {!minion.canAttack && <span className="sleep-mark">休整</span>}
    </button>
  );
}

function Card({ card, selected, playable, index, onClick }: {
  card: CardDefinition;
  selected: boolean;
  playable: boolean;
  index: number;
  onClick: () => void;
}) {
  return (
    <button
      className={`card ${card.type.toLowerCase()} ${selected ? "selected" : ""} ${playable ? "playable" : ""}`}
      onClick={onClick}
      aria-label={`第 ${index + 1} 张手牌，${card.name}，费用 ${card.cost}`}
    >
      <span className="card-cost">{card.cost}</span>
      <span className="card-art"><span>{card.rune}</span></span>
      <span className="card-name">{card.name}</span>
      <span className="card-type">{card.type === "MINION" ? "随从" : "法术"}</span>
      <span className="card-description">{card.description}</span>
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

function Lobby({ connected, mode, setMode, error, room }: {
  connected: boolean;
  mode: LobbyMode;
  setMode: (mode: LobbyMode) => void;
  error: string;
  room: RoomState | null;
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const create = () => {
    setBusy(true);
    socket.emit("createRoom", { playerName: name }, () => setBusy(false));
  };
  const join = () => {
    setBusy(true);
    socket.emit("joinRoom", { roomId: code, playerName: name }, () => setBusy(false));
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
        <p className={`connection ${connected ? "online" : "offline"}`}>{connected ? "● 已连接至裂隙" : "○ 正在连接服务器…"}</p>
        {error && <p className="lobby-error" role="alert">{error}</p>}
      </section>
    </main>
  );
}

export function App() {
  const [connected, setConnected] = useState(socket.connected);
  const [mode, setMode] = useState<LobbyMode>("HOME");
  const [room, setRoom] = useState<RoomState | null>(null);
  const [game, setGame] = useState<ClientGameState | null>(null);
  const [error, setError] = useState("");
  const [selectedHand, setSelectedHand] = useState<number | null>(null);
  const [selectedAttacker, setSelectedAttacker] = useState<string | null>(null);

  useEffect(() => {
    const clearMessage = window.setTimeout(() => error && setError(""), 4000);
    return () => window.clearTimeout(clearMessage);
  }, [error]);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onRoom = (nextRoom: RoomState) => setRoom(nextRoom);
    const onGame = (nextGame: ClientGameState) => {
      setGame(nextGame);
      setSelectedHand(null);
      setSelectedAttacker(null);
    };
    const onError = ({ message }: { message: string }) => setError(message);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("roomState", onRoom);
    socket.on("gameState", onGame);
    socket.on("error", onError);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("roomState", onRoom);
      socket.off("gameState", onGame);
      socket.off("error", onError);
    };
  }, []);

  const isYourTurn = game?.currentPlayerId === game?.you.id && game?.status === "PLAYING";
  const selectedCard = selectedHand === null ? null : game?.you.hand[selectedHand] ?? null;
  const targetMode = useMemo(() => {
    if (!selectedCard || selectedCard.type !== "SPELL") return null;
    if (selectedCard.effect.type === "DAMAGE") return "ENEMY";
    if (selectedCard.effect.type === "BUFF") return "FRIENDLY_MINION";
    return null;
  }, [selectedCard]);

  if (!game) return <Lobby connected={connected} mode={mode} setMode={setMode} error={error} room={room} />;

  const playFromHand = (index: number) => {
    if (!isYourTurn) return setError("现在是对手的回合。");
    const card = game.you.hand[index];
    if (!card || card.cost > game.you.mana) return setError("法力不足。");
    if (card.type === "SPELL" && (card.effect.type === "DAMAGE" || card.effect.type === "BUFF")) {
      setSelectedAttacker(null);
      setSelectedHand(selectedHand === index ? null : index);
      return;
    }
    socket.emit("playCard", { handIndex: index });
  };

  const chooseFriendlyMinion = (minion: MinionState) => {
    if (selectedHand !== null && targetMode === "FRIENDLY_MINION") {
      socket.emit("playCard", { handIndex: selectedHand, target: { type: "MINION", playerId: game.you.id, instanceId: minion.instanceId } });
      return;
    }
    if (!isYourTurn || !minion.canAttack) return;
    setSelectedHand(null);
    setSelectedAttacker(selectedAttacker === minion.instanceId ? null : minion.instanceId);
  };

  const chooseEnemyTarget = (target: ActionTarget) => {
    if (selectedHand !== null && targetMode === "ENEMY") {
      socket.emit("playCard", { handIndex: selectedHand, target });
    } else if (selectedAttacker) {
      socket.emit("attack", { attackerInstanceId: selectedAttacker, target });
    }
  };

  const resultText = game.status === "FINISHED" ? (game.winnerId === game.you.id ? "胜利" : "败北") : "";
  const interactionHint = selectedCard
    ? targetMode === "ENEMY" ? "选择一个敌方目标" : "选择一个己方随从"
    : selectedAttacker ? "选择攻击目标" : isYourTurn ? "你的回合" : "对手正在行动";

  return (
    <main className={`game-shell ${isYourTurn ? "your-turn" : "enemy-turn"}`}>
      <header className="game-header">
        <div><span className="tiny-label">房间</span><strong>{game.roomId}</strong></div>
        <div className="turn-banner"><span>回合 {game.turn}</span><b>{interactionHint}</b></div>
        <div className={`server-dot ${connected ? "online" : ""}`}>{connected ? "联机中" : "连接中断"}</div>
      </header>

      <section className="battle-table">
        <div className="enemy-zone">
          <div className="hero-row enemy-row">
            <Hero
              player={game.opponent}
              enemy
              targetable={Boolean(selectedAttacker || targetMode === "ENEMY")}
              onClick={selectedAttacker || targetMode === "ENEMY" ? () => chooseEnemyTarget({ type: "HERO", playerId: game.opponent.id }) : undefined}
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
              <Minion key={minion.instanceId} minion={minion} targetable={Boolean(selectedAttacker || targetMode === "ENEMY")} onClick={selectedAttacker || targetMode === "ENEMY" ? () => chooseEnemyTarget({ type: "MINION", playerId: game.opponent.id, instanceId: minion.instanceId }) : undefined} />
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
            <button className="end-turn" onClick={() => socket.emit("endTurn")} disabled={!isYourTurn}>结束回合</button>
            <span className="deck-count">牌库 {game.you.deckCount}</span>
          </div>
        </div>
      </section>

      <section className="hand-zone" aria-label="你的手牌">
        {game.you.hand.map((card, index) => (
          <Card key={`${card.id}-${index}`} card={card} index={index} selected={selectedHand === index} playable={Boolean(isYourTurn && card.cost <= game.you.mana)} onClick={() => playFromHand(index)} />
        ))}
      </section>

      {error && <div className="toast" role="alert">{error}</div>}
      {game.status === "FINISHED" && (
        <div className="game-over" role="dialog" aria-modal="true">
          <div className="result-sigil">{game.winnerId === game.you.id ? "✦" : "◇"}</div>
          <h2>{resultText}</h2>
          <p>{game.winnerId === game.you.id ? "裂隙回应了你的意志。" : "石桌归于寂静，下一局再会。"}</p>
          <button onClick={() => window.location.reload()}>返回大厅</button>
        </div>
      )}
    </main>
  );
}
