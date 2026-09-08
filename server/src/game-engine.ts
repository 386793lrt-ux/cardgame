import {
  CARD_BY_ID,
  DEFAULT_DECK,
  type ActionTarget,
  type CardDefinition,
  type ClientGameState,
  type GameState,
  type MinionCard,
  type PlayerState,
  type SpellCard
} from "@riftbound/shared";

export class GameRuleError extends Error {}

let instanceCounter = 0;

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex]!, result[index]!];
  }
  return result;
}

function createPlayer(id: string, name: string, random: () => number): PlayerState {
  return {
    id,
    name,
    health: 30,
    mana: 0,
    maxMana: 0,
    deck: shuffle(DEFAULT_DECK, random),
    hand: [],
    board: []
  };
}

function draw(player: PlayerState, amount = 1): void {
  for (let count = 0; count < amount; count += 1) {
    const card = player.deck.shift();
    if (card) player.hand.push(card);
  }
}

function startTurn(state: GameState, player: PlayerState): void {
  player.maxMana = Math.min(10, player.maxMana + 1);
  player.mana = player.maxMana;
  player.board.forEach((minion) => {
    minion.canAttack = true;
  });
  draw(player);
  state.currentPlayerId = player.id;
}

export function createGame(
  roomId: string,
  players: [{ id: string; name: string }, { id: string; name: string }],
  random: () => number = Math.random
): GameState {
  const states: [PlayerState, PlayerState] = [
    createPlayer(players[0].id, players[0].name, random),
    createPlayer(players[1].id, players[1].name, random)
  ];
  const firstIndex = random() < 0.5 ? 0 : 1;
  const secondIndex = firstIndex === 0 ? 1 : 0;
  draw(states[firstIndex]!, 3);
  draw(states[secondIndex]!, 4);
  const state: GameState = {
    roomId,
    players: states,
    currentPlayerId: states[firstIndex]!.id,
    turn: 1,
    status: "PLAYING"
  };
  startTurn(state, states[firstIndex]!);
  return state;
}

function currentPlayer(state: GameState, playerId: string): PlayerState {
  if (state.status !== "PLAYING") throw new GameRuleError("这局游戏已经结束。");
  if (state.currentPlayerId !== playerId) throw new GameRuleError("还没有轮到你行动。");
  const player = state.players.find((candidate) => candidate.id === playerId);
  if (!player) throw new GameRuleError("玩家不在这局游戏中。");
  return player;
}

function opponentOf(state: GameState, playerId: string): PlayerState {
  const opponent = state.players.find((candidate) => candidate.id !== playerId);
  if (!opponent) throw new GameRuleError("找不到对手。");
  return opponent;
}

function requireCard(cardId: string): CardDefinition {
  const card = CARD_BY_ID.get(cardId);
  if (!card) throw new GameRuleError("卡牌数据不存在。");
  return card;
}

function validateSpellTarget(
  state: GameState,
  player: PlayerState,
  spell: SpellCard,
  target?: ActionTarget
): void {
  if (spell.effect.type === "DAMAGE") {
    if (!target) throw new GameRuleError("请选择一个敌方目标。");
    const opponent = opponentOf(state, player.id);
    if (target.playerId !== opponent.id) throw new GameRuleError("该法术只能指定敌方目标。");
    if (target.type === "MINION" && !opponent.board.some((minion) => minion.instanceId === target.instanceId)) {
      throw new GameRuleError("目标随从不存在。");
    }
  }
  if (spell.effect.type === "BUFF") {
    if (!target || target.type !== "MINION" || target.playerId !== player.id) {
      throw new GameRuleError("请选择一个己方随从。");
    }
    if (!player.board.some((minion) => minion.instanceId === target.instanceId)) {
      throw new GameRuleError("目标随从不存在。");
    }
  }
}

function applySpell(state: GameState, player: PlayerState, spell: SpellCard, target?: ActionTarget): void {
  const effect = spell.effect;
  if (effect.type === "HEAL") {
    player.health = Math.min(30, player.health + effect.amount);
  } else if (effect.type === "DRAW") {
    draw(player, effect.amount);
  } else if (effect.type === "BUFF" && target?.type === "MINION") {
    const minion = player.board.find((candidate) => candidate.instanceId === target.instanceId)!;
    minion.attack += effect.attack;
    minion.health += effect.health;
    minion.maxHealth += effect.health;
  } else if (effect.type === "DAMAGE" && target) {
    const opponent = opponentOf(state, player.id);
    if (target.type === "HERO") {
      opponent.health -= effect.amount;
    } else {
      const minion = opponent.board.find((candidate) => candidate.instanceId === target.instanceId)!;
      minion.health -= effect.amount;
      removeDeadMinions(state);
    }
  }
}

function summon(player: PlayerState, card: MinionCard): void {
  instanceCounter += 1;
  player.board.push({
    instanceId: `${player.id}-${instanceCounter}`,
    cardId: card.id,
    attack: card.attack,
    health: card.health,
    maxHealth: card.health,
    canAttack: false
  });
}

function removeDeadMinions(state: GameState): void {
  state.players.forEach((player) => {
    player.board = player.board.filter((minion) => minion.health > 0);
  });
}

function checkGameOver(state: GameState): void {
  const defeated = state.players.find((player) => player.health <= 0);
  if (!defeated) return;
  const winner = state.players.find((player) => player.id !== defeated.id)!;
  state.status = "FINISHED";
  state.winnerId = winner.id;
}

export function playCard(
  state: GameState,
  playerId: string,
  handIndex: number,
  target?: ActionTarget
): void {
  const player = currentPlayer(state, playerId);
  if (!Number.isInteger(handIndex) || handIndex < 0 || handIndex >= player.hand.length) {
    throw new GameRuleError("手牌位置无效。");
  }
  const card = requireCard(player.hand[handIndex]!);
  if (player.mana < card.cost) throw new GameRuleError("法力不足。");
  if (card.type === "MINION" && player.board.length >= 7) throw new GameRuleError("战场已经满了。");
  if (card.type === "SPELL") validateSpellTarget(state, player, card, target);

  player.mana -= card.cost;
  player.hand.splice(handIndex, 1);
  if (card.type === "MINION") summon(player, card);
  else applySpell(state, player, card, target);
  checkGameOver(state);
}

export function attack(
  state: GameState,
  playerId: string,
  attackerInstanceId: string,
  target: ActionTarget
): void {
  const player = currentPlayer(state, playerId);
  const opponent = opponentOf(state, playerId);
  const attacker = player.board.find((minion) => minion.instanceId === attackerInstanceId);
  if (!attacker) throw new GameRuleError("攻击者不存在。");
  if (!attacker.canAttack) throw new GameRuleError("这个随从本回合不能攻击。");
  if (target.playerId !== opponent.id) throw new GameRuleError("只能攻击敌方目标。");

  attacker.canAttack = false;
  if (target.type === "HERO") {
    opponent.health -= attacker.attack;
  } else {
    const defender = opponent.board.find((minion) => minion.instanceId === target.instanceId);
    if (!defender) throw new GameRuleError("目标随从不存在。");
    const attackerDamage = defender.attack;
    defender.health -= attacker.attack;
    attacker.health -= attackerDamage;
    removeDeadMinions(state);
  }
  checkGameOver(state);
}

export function endTurn(state: GameState, playerId: string): void {
  currentPlayer(state, playerId);
  const opponent = opponentOf(state, playerId);
  state.turn += 1;
  startTurn(state, opponent);
}

export function toClientState(state: GameState, viewerId: string): ClientGameState {
  const you = state.players.find((player) => player.id === viewerId);
  const opponent = state.players.find((player) => player.id !== viewerId);
  if (!you || !opponent) throw new GameRuleError("无法生成玩家视角。");

  const publicPlayer = (player: PlayerState) => ({
    id: player.id,
    name: player.name,
    health: player.health,
    mana: player.mana,
    maxMana: player.maxMana,
    deckCount: player.deck.length,
    handCount: player.hand.length,
    board: player.board.map((minion) => ({ ...minion }))
  });

  return {
    roomId: state.roomId,
    you: {
      ...publicPlayer(you),
      hand: you.hand.map(requireCard)
    },
    opponent: publicPlayer(opponent),
    currentPlayerId: state.currentPlayerId,
    turn: state.turn,
    status: state.status,
    winnerId: state.winnerId
  };
}
