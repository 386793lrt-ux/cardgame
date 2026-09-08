export const ZH_CN: Readonly<Record<string, string>> = {
  card_000001_name: "苔径斥候", card_000001_description: "来自雾林边缘的敏捷探路者。",
  card_000002_name: "余烬蛾", card_000002_description: "翅粉在黑夜中燃成细小星火。",
  card_000003_name: "矿脊守卫", card_000003_description: "披着磁铁矿甲片的沉默卫士。",
  card_000004_name: "暮影狐", card_000004_description: "它总能先一步穿过正在闭合的裂隙。",
  card_000005_name: "提灯贤者", card_000005_description: "灯芯里保存着一段失落的黎明。",
  card_000006_name: "棘刃斗士", card_000006_description: "每一道伤痕都长成了新的护刺。",
  card_000007_name: "符文铸师", card_000007_description: "在金属冷却前把誓言敲进甲胄。",
  card_000008_name: "雾角鹿", card_000008_description: "角尖牵引着林海的薄雾。",
  card_000009_name: "荒原巨兽", card_000009_description: "它的脚步让沉睡的石碑重新发声。",
  card_000010_name: "钟械幼龙", card_000010_description: "以发条记住每一次振翼。",
  card_000011_name: "空铠骑士", card_000011_description: "盔甲中回响着无人认领的誓约。",
  card_000012_name: "雷穹巨像", card_000012_description: "雷暴在它的肩甲之间筑巢。",
  card_000013_name: "月井长蛇", card_000013_description: "鳞片映照着从未发生的月蚀。",
  card_000014_name: "裂隙泰坦", card_000014_description: "它从世界的接缝处缓慢站起。",
  card_000015_name: "烬火冲击", card_000015_description: "对一个敌方目标造成 3 点伤害。",
  card_000016_name: "晨曦愈合", card_000016_description: "为己方英雄恢复 4 点生命。",
  card_000017_name: "回声星图", card_000017_description: "抽 2 张牌。",
  card_000018_name: "钢铁誓言", card_000018_description: "使一个己方随从获得 +2/+2。",
  card_000019_name: "虚空火花", card_000019_description: "对一个敌方目标造成 2 点伤害。",
  card_000020_name: "星落恩典", card_000020_description: "为己方英雄恢复 6 点生命。"
};

export function translateZhCn(key: string): string {
  return ZH_CN[key] ?? key;
}
