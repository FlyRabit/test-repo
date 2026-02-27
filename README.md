# 小红书账号运营系统

一个功能完整的小红书账号运营管理系统，支持文案编辑、图片排版、一键发布及数据图表展示，并支持对接真实小红书账号。

## 功能特性

- **文案编辑修改** - 编辑笔记标题和正文，实时字数统计
- **图片排版** - 上传图片、拖拽排序、添加图片说明，符合小红书 3:4 竖版规范
- **一键发布** - 发布预览，支持本地模拟发布和真实发布到小红书平台
- **数据图表** - 浏览量、点赞、评论、收藏、分享等数据可视化展示
- **账号管理** - OAuth 2.0 授权连接小红书账号，支持双模式运行（本地/联网）

## 技术栈

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- Recharts
- React Router
- Express.js（后端 API 代理）

## 快速开始

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server && npm install && cd ..

# 启动前端开发服务器
npm run dev

# 启动后端 API 服务器（新终端）
npm run dev:server

# 构建生产版本
npm run build
```

## 小红书账号对接

系统支持两种运行模式：

### 本地模式（默认）
无需任何配置即可使用，发布和数据统计使用本地模拟。

### 联网模式（真实对接）
1. 前往 [小红书开放平台](https://open.xiaohongshu.com) 注册开发者账号
2. 创建应用并获取 App Key 和 App Secret
3. 在应用中配置回调地址为：`http://localhost:3001/api/auth/callback`
4. 复制 `.env.example` 为 `.env`，填入凭证：
   ```
   XHS_APP_KEY=你的AppKey
   XHS_APP_SECRET=你的AppSecret
   ```
5. 启动后端服务器：`npm run dev:server`
6. 在应用内点击侧栏底部的"账号管理"，完成 OAuth 授权

## 使用说明

1. **文案编辑**：在首页编辑笔记标题和正文
2. **图片排版**：切换到图片排版页，上传图片并调整顺序
3. **一键发布**：在发布页预览并点击发布按钮（联网模式下可直接发布到小红书）
4. **数据图表**：发布后可查看各笔记的数据统计和图表
5. **账号管理**：在侧栏底部进入账号管理页，连接或管理你的小红书账号

本地数据保存在浏览器 localStorage 中，刷新页面后仍可访问。

## 项目结构

```
├── src/                  # 前端源代码
│   ├── pages/            # 页面组件
│   ├── components/       # 通用组件
│   ├── store/            # 状态管理
│   ├── services/         # API 服务
│   └── types/            # TypeScript 类型定义
├── server/               # 后端 API 服务器
│   ├── routes/           # API 路由
│   └── lib/              # 工具库
├── .env.example          # 环境变量模板
└── vite.config.ts        # Vite 配置（含 API 代理）
```
