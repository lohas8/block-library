# 个人中心页面设计文档 (MobileProfile)

## 1. 概述

- **页面名称**: 个人中心 (MobileProfile)
- **路由路径**: `/mobile/profile`
- **技术栈**: React 18 + React Router 6 + antd-mobile 5.x
- **项目路径**: `/frontend/src/mobile/pages/MobileProfile.js`

## 2. 布局结构

```
┌─────────────────────────────────┐
│         顶部用户信息卡片          │ ← 白色卡片，圆角12px，内边距16px
├─────────────────────────────────┤
│         功能菜单 Grid            │ ← 白色卡片，圆角12px，4列布局
├─────────────────────────────────┤
│         社区动态时间线           │ ← 标题 + 垂直时间线列表
├─────────────────────────────────┤
│         底部导航栏 (Tab Bar)     │ ← 固定底部，适配安全区
└─────────────────────────────────┘
```

## 3. 样式规范

- **背景色**: `#F5F5F5`
- **卡片背景**: 白色 `#FFFFFF`
- **圆角**: `12px`
- **内边距**: `16px`
- **间距**: 卡片间距 `12px`

## 4. 组件规格

### 4.1 顶部用户信息卡片

**布局**:
```
┌────────────────────────────────────────────────┐
│  🧑                                    已认证业主│  ← 头像 + 认证徽章
│  张明远                                          │  ← 昵称18px粗体
│  0x1a2b...3c 📋                                 │  ← 地址等宽字体 + 复制
├─────────────────────┬──────────────────────────┤
│   积分余额          │       贡献值              │
│   612 (主题色)      │    20 (绿色)             │
└─────────────────────┴──────────────────────────┘
```

**样式**:
- 头像: 圆形 48px
- 认证图标: 右侧，灰色背景圆角
- 昵称: 18px, font-weight 600
- 认证标签: 灰色背景 #F0F0F0, 圆角12px, 字号12px
- 钱包地址: 等宽字体 monospace, 灰色
- 复制图标: 点击提示 Toast "地址已复制"
- 积分/贡献值区域: 两列等宽，font-weight 600

### 4.2 功能菜单 Grid

**布局** (4列自适应):
```
┌─────┬─────┬─────┬─────┐
│ 🗳️  │ 📋  │ 💬  │ ❓  │
│我的投票│我的提案│我的评论│帮助中心│
├─────┴─────┼─────┴─────┤
│      ⚙️ 设置          │
└───────────────────────┘
```

**样式**:
- 每项: 图标(emoji) + 文字
- 文字: 12px, 居中
- 间距: 16px
- 未读角标: 红色圆点 badge

### 4.3 社区动态模块

**布局**:
```
┌─────────────────────────────────┐
│ 社区动态                  更多 > │
├─────────────────────────────────┤
│ ●─── 第1期社区治理会议          │
│     2023-11-11      已结束      │
│ │                               │
│ ●─── 第2期社区治理会议          │
│     2023-11-18      已结束      │
└─────────────────────────────────┘
```

**样式**:
- 标题: 左侧 16px 粗体，右侧更多箭头
- 时间线: 垂直线条，左侧圆点
- 状态标签: "已结束" 灰色背景

### 4.4 底部导航栏

**布局**:
```
┌───────────────────────────────┐
│  🏠     📋     🏡     👤      │
│ 首页   待办   家园   我的       │
└───────────────────────────────┘
```

**样式**:
- 固定底部, padding-bottom 适配安全区 (env safe-area-inset-bottom)
- 白色背景，顶部 box-shadow
- 当前页高亮 (主题色)

## 5. 交互行为

| 元素 | 行为 |
|------|------|
| 点击头像 | 跳转 `/mobile/profile/edit` (预留) |
| 点击复制图标 | Toast "地址已复制" |
| 点击菜单项 | 跳转对应页面 (votes/proposals/comments/help/settings) |
| 点击社区动态 | 跳转 `/mobile/event/:id` |
| 点击"更多" | 加载更多或跳转 `/mobile/events` |
| 下拉刷新 | 重新请求数据 |

## 6. 数据模型 (Mock)

```js
const mockData = {
  user: {
    id: "u123",
    nickname: "张明远",
    avatar: "🧑",
    is_verified: true,
    role: "owner",
    wallet_address: "0x1a2b3c4d5e6f7890123456789abcdef1234567890abcdef1234567890abcdef1234"
  },
  stats: {
    points: 612,
    contribution: 20
  },
  menus: [
    { id: "votes", title: "我的投票", icon: "🗳️", badge: 0 },
    { id: "proposals", title: "我的提案", icon: "📋", badge: 2 },
    { id: "comments", title: "我的评论", icon: "💬", badge: null },
    { id: "help", title: "帮助中心", icon: "❓" },
    { id: "settings", title: "设置", icon: "⚙️" }
  ],
  community_events: [
    { id: "evt001", title: "第1期社区治理会议", date: "2023-11-11", status: "ended" },
    { id: "evt002", title: "第2期社区治理会议", date: "2023-11-18", status: "ended" }
  ]
}
```

## 7. 文件清单

| 文件 | 描述 |
|------|------|
| `src/mobile/pages/MobileProfile.js` | 主页面组件 (完全重写) |
| `src/mobile/pages/MobileProfile.css` | 样式文件 |
| `docs/profile-design.md` | 本设计文档 |

## 8. 路由映射

| 菜单项 | 目标路径 |
|--------|---------|
| 我的投票 | `/mobile/votes` |
| 我的提案 | `/mobile/proposals` |
| 我的评论 | `/mobile/comments` |
| 帮助中心 | `/mobile/help` |
| 设置 | `/mobile/settings` |
| 会议详情 | `/mobile/event/:id` |
| 首页 | `/mobile/home` |
| 待办 | `/mobile/todos` |
| 家园 | `/mobile/community` |

## 9. 依赖组件

- `antd-mobile`: Card, Toast, List, TabBar, PullToRefresh
- `react-router-dom`: useNavigate, Link
- `react-redux`: useSelector (预留)