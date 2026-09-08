export type CardType = "MINION" | "SPELL";

export type TargetKind = "ANY_ENEMY" | "FRIENDLY_MINION" | "FRIENDLY_HERO";

export type CardEffect =
  | { type: "DAMAGE"; amount: number; target: "ANY_ENEMY" }
  | { type: "HEAL"; amount: number; target: "FRIENDLY_HERO" }
  | { type: "DRAW"; amount: number }
  | { type: "BUFF"; attack: number; health: number; target: "FRIENDLY_MINION" };

export interface BaseCard {
  id: string;
  name: string;
  cost: number;
  description: string;
  type: CardType;
  rune: string;
}

export interface MinionCard extends BaseCard {
  type: "MINION";
  attack: number;
  health: number;
}

export interface SpellCard extends BaseCard {
  type: "SPELL";
  effect: CardEffect;
}

export type CardDefinition = MinionCard | SpellCard;

export const CARDS: readonly CardDefinition[] = [
  { id: "moss-scout", name: "苔径斥候", type: "MINION", cost: 1, attack: 1, health: 2, rune: "☘", description: "来自雾林边缘的敏捷探路者。" },
  { id: "ember-moth", name: "余烬蛾", type: "MINION", cost: 1, attack: 2, health: 1, rune: "✦", description: "翅粉在黑夜中燃成细小星火。" },
  { id: "oreback-guard", name: "矿脊守卫", type: "MINION", cost: 2, attack: 2, health: 3, rune: "⬟", description: "披着磁铁矿甲片的沉默卫士。" },
  { id: "gloam-fox", name: "暮影狐", type: "MINION", cost: 2, attack: 3, health: 2, rune: "◈", description: "它总能先一步穿过正在闭合的裂隙。" },
  { id: "lantern-sage", name: "提灯贤者", type: "MINION", cost: 3, attack: 2, health: 5, rune: "☼", description: "灯芯里保存着一段失落的黎明。" },
  { id: "thorn-duelist", name: "棘刃斗士", type: "MINION", cost: 3, attack: 4, health: 3, rune: "⚔", description: "每一道伤痕都长成了新的护刺。" },
  { id: "rune-smith", name: "符文铸师", type: "MINION", cost: 4, attack: 4, health: 5, rune: "⚒", description: "在金属冷却前把誓言敲进甲胄。" },
  { id: "mist-stag", name: "雾角鹿", type: "MINION", cost: 4, attack: 5, health: 4, rune: "♢", description: "角尖牵引着林海的薄雾。" },
  { id: "waste-behemoth", name: "荒原巨兽", type: "MINION", cost: 5, attack: 5, health: 6, rune: "♜", description: "它的脚步让沉睡的石碑重新发声。" },
  { id: "clockwork-drake", name: "钟械幼龙", type: "MINION", cost: 5, attack: 6, health: 5, rune: "⚙", description: "以发条记住每一次振翼。" },
  { id: "hollow-knight", name: "空铠骑士", type: "MINION", cost: 6, attack: 6, health: 7, rune: "♞", description: "盔甲中回响着无人认领的誓约。" },
  { id: "storm-colossus", name: "雷穹巨像", type: "MINION", cost: 7, attack: 8, health: 8, rune: "ϟ", description: "雷暴在它的肩甲之间筑巢。" },
  { id: "moonwell-serpent", name: "月井长蛇", type: "MINION", cost: 8, attack: 9, health: 9, rune: "☾", description: "鳞片映照着从未发生的月蚀。" },
  { id: "rift-titan", name: "裂隙泰坦", type: "MINION", cost: 10, attack: 12, health: 12, rune: "✺", description: "它从世界的接缝处缓慢站起。" },
  { id: "cinder-bolt", name: "烬火冲击", type: "SPELL", cost: 2, rune: "☄", description: "对一个敌方目标造成 3 点伤害。", effect: { type: "DAMAGE", amount: 3, target: "ANY_ENEMY" } },
  { id: "dawn-mending", name: "晨曦愈合", type: "SPELL", cost: 2, rune: "✚", description: "为己方英雄恢复 4 点生命。", effect: { type: "HEAL", amount: 4, target: "FRIENDLY_HERO" } },
  { id: "echo-map", name: "回声星图", type: "SPELL", cost: 3, rune: "⌁", description: "抽 2 张牌。", effect: { type: "DRAW", amount: 2 } },
  { id: "iron-vow", name: "钢铁誓言", type: "SPELL", cost: 3, rune: "⬢", description: "使一个己方随从获得 +2/+2。", effect: { type: "BUFF", attack: 2, health: 2, target: "FRIENDLY_MINION" } },
  { id: "void-spark", name: "虚空火花", type: "SPELL", cost: 1, rune: "✧", description: "对一个敌方目标造成 2 点伤害。", effect: { type: "DAMAGE", amount: 2, target: "ANY_ENEMY" } },
  { id: "starfall-grace", name: "星落恩典", type: "SPELL", cost: 4, rune: "✥", description: "为己方英雄恢复 6 点生命。", effect: { type: "HEAL", amount: 6, target: "FRIENDLY_HERO" } }
] as const;

export const CARD_BY_ID = new Map(CARDS.map((card) => [card.id, card]));
export const DEFAULT_DECK = CARDS.map((card) => card.id);
