# 裂隙牌局（Riftbound Duel）

原创的双人在线 1v1 回合制卡牌游戏 MVP。服务端是唯一权威状态源，客户端只提交操作意图。

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

项目根目录已经包含 `render.yaml`。将仓库推送到 GitHub 后，在 Render Dashboard 选择 **New → Blueprint**，连接仓库并确认创建即可。生产环境由同一个 Web Service 同时提供网页和 Socket.IO，因此客户端与服务器共用一个 HTTPS/WSS 域名。
