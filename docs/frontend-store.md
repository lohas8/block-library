# Frontend Store（前端状态管理子系统）

> Redux Toolkit 6 slices 架构：user / books / borrow / notification / tools / settings。API interceptor 统一注入 token 和处理 401。

---

## Overview

### Purpose
统一管理前端全局状态。6 个 slice 各自独立，使用 `configureStore` 组合。所有 slice 的初始状态优先从 localStorage 读取（token / theme / features / permissions）。

### Responsibilities
- user slice：登录状态、用户信息、登出
- books slice：图书列表、当前图书、分类
- borrow slice：借阅记录、预约、统计
- notification slice：通知列表、未读数
- tools slice：工具共享列表、分类、统计
- settings slice：主题、功能开关、权限配置

### Boundaries
不负责 HTTP 请求（API 层独立），不负责路由跳转（由各组件自行处理）。

---

## File Map

| File | Role |
|---|---|
| `frontend/src/store/index.js` | Redux store 配置 + 6 slices + 导出 actions |
| `frontend/src/store/settings.js` | 主题/功能开关/权限配置的默认值和 `ROLE_CONFIG`/`FEATURE_CONFIG`/`checkPermission` |
| `frontend/src/api/index.js` | axios 实例（请求/响应拦截器） |

---

## Store Shape

```javascript
{
  user: { token, info },
  books: { list, total, currentBook, categories },
  borrow: { list, total, reservations, statistics },
  notification: { list, unreadCount },
  tools: { list, total, currentTool, categories, statistics },
  settings: { theme, features, permissions }
}
```

---

## API Interceptor Flow

### Request Interceptor
从 Redux store 读取 `user.token` → 注入 `Authorization: Bearer <token>`

### Response Interceptor
- `code === 401` → `dispatch(setUser({ token: null, user: null }))` → `window.location.href = '/login'`
- 其他正常响应 → 直接返回 `response.data`

---

## Gotchas

- `settings.js` 中 `ROLE_CONFIG`/`FEATURE_CONFIG` 为 JS 模块级常量，通过 `import` 引用；而 settings slice 从 localStorage 初始化。存在双数据源。
- `store/index.js` 重新导出 `ROLE_CONFIG`/`FEATURE_CONFIG`/`checkPermission`/`applyTheme`，但组件更常用 `import { ... } from '../store/settings'` 而非从 `index.js` 导入。

---

## Findings

- **[ISSUE]** `settings.js` 与 Redux `settingsSlice` 双数据源，localStorage 优先级不清。
- **[ISSUE]** API interceptor 使用 `window.location.href` 直接跳转，丢失前端路由历史。
- **[CLEAN]** 6 slices 结构清晰，Redux Toolkit 标准化实现。