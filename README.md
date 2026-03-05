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
- Python FastAPI + [ReaJason/xhs](https://github.com/reajason/xhs) SDK（后端）

## 快速开始

```bash
# 安装前端依赖
npm install

# 安装后端依赖
pip install -r server/requirements.txt
python3 -m playwright install chromium

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

基于 [ReaJason/xhs](https://github.com/reajason/xhs) 开源 SDK，使用 Cookie 认证方式连接真实小红书账号。

1. 启动后端服务器：`npm run dev:server`
2. 在 Chrome 浏览器中打开 [小红书网页版](https://www.xiaohongshu.com) 并登录
3. 按 F12 打开开发者工具 → Network 标签 → 复制任意请求的 Cookie 字段
4. 在应用内点击侧栏底部的"账号管理"，粘贴 Cookie 并连接
5. 连接成功后即可使用真实发布、获取数据等功能

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
├── server/               # Python FastAPI 后端
│   ├── main.py           # FastAPI 服务入口
│   ├── xhs_service.py    # xhs SDK 封装层
│   └── requirements.txt  # Python 依赖
└── vite.config.ts        # Vite 配置（含 API 代理）
```
