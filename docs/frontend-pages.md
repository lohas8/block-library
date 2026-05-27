# Frontend Pages（前端页面子系统）

> React 组件层，包含 14 个页面组件、AppLayout 公共布局、路由守卫和权限控制。

---

## Overview

### Purpose
面向用户的 UI 层。所有页面均为 React 函数组件，通过 Redux `useSelector` 获取状态，`useDispatch` 触发 actions。

### Responsibilities
- 页面路由（Login / Dashboard / BookList / BorrowManage / TopicsList / 等）
- AppLayout 公共布局（侧边栏/Header/权限菜单）
- 权限菜单渲染（FEATURE_CONFIG + ROLE_CONFIG）
- Mobile 端适配（部分页面）

---

## File Map

| File | Role |
|---|---|
| `frontend/src/App.js` | 路由入口 |
| `frontend/src/AppLayout.js` | 公共布局组件（含侧边栏/Header/菜单） |
| `frontend/src/pages/Login.js` | 登录/注册页 |
| `frontend/src/pages/Dashboard.js` | 仪表盘（数据概览） |
| `frontend/src/pages/BookList.js` | 图书列表 |
| `frontend/src/pages/BorrowManage.js` | 借阅管理 |
| `frontend/src/pages/ApplyRule.js` | 借阅规则申请 |
| `frontend/src/pages/CommunityManage.js` | 社区管理（小区创建/编辑/删除） |
| `frontend/src/pages/UserManage.js` | 用户管理 |
| `frontend/src/pages/RuleManage.js` | 规则管理 |
| `frontend/src/pages/Settings.js` | 系统设置（主题、功能开关） |
| `frontend/src/pages/Profile.js` | 个人中心 |
| `frontend/src/pages/PointsMall.js` | 积分商城 |
| `frontend/src/pages/Notifications.js` | 通知中心 |
| `frontend/src/pages/Tools.js` | 工具共享 |
| `frontend/src/pages/TopicsList.js` | 议事广场列表 |
| `frontend/src/pages/TopicDetail.js` | 议事详情+评论 |
| `frontend/src/pages/TopicCreate.js` | 发布议题 |
| `frontend/src/store/index.js` | Redux store + settings 配置 |

---

## Routing Structure

```
/login                 → Login
/                      → Dashboard（需认证）
/books                 → BookList
/borrow/manage         → BorrowManage
/borrow/apply          → ApplyRule
/community/manage      → CommunityManage（需 admin+）
/user/manage           → UserManage（需 admin+）
/rules                 → RuleManage
/settings              → Settings
/profile               → Profile
/points/mall           → PointsMall
/notifications         → Notifications
/tools                 → Tools
/topics                → TopicsList
/topics/create         → TopicCreate
/topics/:id            → TopicDetail
```

---

## Features Config

```javascript
{
  borrow: true,       // 借阅功能
  bookManage: true,   // 图书管理
  userManage: true,  // 用户管理
  pointsMall: true,  // 积分商城
  toolShare: true,   // 工具共享
}
```

Features 可通过 Settings 页面动态开关，状态存于 localStorage + Redux。

---

## Findings

- **[ISSUE]** 路由守卫基于 `localStorage.token` 而非 Redux store，不一致。
- **[ISSUE]** 部分页面（TopicDetail/TopicCreate/TopicsList）未做移动端适配。
- **[REVIEW]** 14 个页面组件均未应用 file header 标准（code-documentation skill 未执行）。