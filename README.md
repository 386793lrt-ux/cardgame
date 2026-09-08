# 裂隙牌局（Riftbound Duel）0.2

原创的双人在线 1v1 回合制卡牌游戏。0.2 将确定性规则、公共协议、服务端和客户端分层，为 Cocos Creator、微信小游戏及未来 PC 平台做准备。服务端是唯一权威状态源，客户端只提交 `PlayerAction`。

## 目录

- `apps/server`：Express + Socket.IO 权威服务器
- `apps/client-cocos`：Cocos Creator 接入准备层（尚非 Creator 工程）
- `packages/game-core`：纯 TypeScript 游戏规则、完整秘密状态和测试
- `packages/shared`：公共协议、玩家视图、网络 SDK、错误与平台接口
- `client`：保留的 React/Vite 可玩验证客户端
- `docs`：架构与版本路线

## 本地运行

```bash
npm install
npm run dev
```

- 客户端：http://localhost:5173
- 游戏服务器：http://localhost:3001

局域网中的朋友可用 `http://你的电脑局域网IP:5173` 打开客户端。若要跨公网联机，需要把 5173/3001 部署到公网或配置端口转发；生产环境可通过 `VITE_SERVER_URL` 指定服务器地址。

## 验证

```bash
npm test
npm run typecheck
npm run build
```

## Render 公网部署

公网部署目前暂停。项目根目录仍保留 `render.yaml`，后续恢复时可以继续使用。生产环境由同一个 Web Service 同时提供网页和 Socket.IO，因此客户端与服务器共用一个 HTTPS/WSS 域名。
