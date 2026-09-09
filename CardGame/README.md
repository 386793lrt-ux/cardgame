# 裂隙牌局（Riftbound Duel）0.3

原创的双人在线 1v1 回合制卡牌游戏。0.3 增加公网部署、稳定玩家会话、断线重连、操作防重复、运行时验证、限流和房间清理。服务端仍是唯一权威状态源。

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

公网环境通过 `VITE_GAME_SERVER_URL` 或同源部署连接，详见 `docs/deployment.md`。不要通过家庭路由器端口转发暴露开发电脑。

## 验证

```bash
npm test
npm run typecheck
npm run build
```

## 公网部署

项目支持普通 Node.js Hosting、Docker 和 `render.yaml`。生产环境由同一个服务提供网页、HTTPS API 和 Socket.IO/WSS，也可以通过配置把客户端与服务器分开部署。
