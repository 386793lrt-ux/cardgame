# 裂隙牌局（Riftbound Duel）0.4.1

原创的 1v1 回合制卡牌游戏。0.4.1 在好友对战之外增加了规则型人机对战，并提供 Windows 一键启动器。服务端与 game-core 仍是唯一权威状态源，AI 也只能提交普通玩家操作，不能绕过规则修改结果。

## 目录

- `apps/server`：Express + Socket.IO 权威服务器
- `apps/launcher`：轻量 Windows 一键启动器源码与构建脚本
- `apps/client-cocos`：Cocos Creator 接入准备层（尚非 Creator 工程）
- `packages/game-core`：纯 TypeScript 游戏规则、完整秘密状态和测试
- `packages/game-ai`：只读取玩家视图并提交 PlayerAction 的规则型 AI
- `packages/shared`：公共协议、玩家视图、网络 SDK、错误与平台接口
- `client`：保留的 React/Vite 可玩验证客户端
- `docs`：架构与版本路线

## 本地运行

Windows 用户可直接双击：

`release/CardGame.exe`

启动器会启动后端 `3001` 和前端 `5173`，等待两者就绪后打开默认浏览器。关闭启动器窗口时，它只会关闭本次由自己启动的游戏服务。如果服务已经在运行，则直接打开游戏，不重复启动。

当前启动器体积较小，依赖项目目录、已经安装的 npm 依赖和 Node.js LTS；它不是把整个游戏封装进一个 EXE 的自包含安装包。

开发方式仍可使用：

```bash
npm install
npm run dev
```

- 客户端：http://localhost:5173
- 游戏服务器：http://localhost:3001

主菜单提供“人机对战”和“好友对战”。人机对战无需房间码；AI 动作之间有短暂延迟，并复用与真人完全相同的规则、网络状态与战斗表现。

重新生成启动器：

```bash
npm run build:launcher
```

公网环境通过 `VITE_GAME_SERVER_URL` 或同源部署连接，详见 `docs/deployment.md`。不要通过家庭路由器端口转发暴露开发电脑。

## 验证

```bash
npm test
npm run typecheck
npm run build
```

## 公网部署

项目支持普通 Node.js Hosting、Docker 和 `render.yaml`。生产环境由同一个服务提供网页、HTTPS API 和 Socket.IO/WSS，也可以通过配置把客户端与服务器分开部署。
