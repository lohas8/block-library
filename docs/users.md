# Users（用户管理子系统）

> 用户信息管理、积分管理、角色权限矩阵（super_admin/admin/owner/property/user）。

---

## Overview

### Purpose
管理社区用户的账户信息、积分余额、角色体系。前台业主和后台管理员共用一套用户体系，通过 role 字段区分权限级别。

### Responsibilities
- 用户注册/登录（见 Auth subsystem）
- 用户信息查询/更新
- 用户列表（管理员）
- 积分查询/增减（管理员）
- 借阅历史查询

### Boundaries
积分的获取规则（共享图书/按时还书）和兑换逻辑由 Points subsystem 处理，Users subsystem 仅维护当前积分余额。

---

## File Map

| File | Role |
|---|---|
| `backend/app/controller/user.js` | 用户 CRUD（含 register/login/detail/update/list/updatePoints/borrowHistory） |
| `backend/app/service/user.js` | 用户列表/详情/更新/积分/借阅历史 |
| `backend/app/model/user.js` | Mongoose User 模型，含 `comparePassword`、`points`、`role` |
| `frontend/src/api/index.js` | userApi |
| `frontend/src/pages/Profile.js` | 个人中心 |
| `frontend/src/pages/UserManage.js` | 用户管理页（管理员） |
| `frontend/src/store/index.js` | Redux userSlice |

---

## Role Hierarchy

```
super_admin  → 全局系统管理员（创建小区、分配 admin）
admin       → 小区管理员
owner       → 业主代表
property    → 物业
user        → 普通用户
```

---

## Gotchas

- `user.js` Service 中 `update` 方法校验：只能修改自己，或 admin/super_admin 可修改任何人。
- 前端 `settings.js` 中的 `ROLE_CONFIG` 从 localStorage 初始化，与 Redux store 存在双数据源风险。

---

## Findings

- **[ISSUE]** 角色权限校验散落在各 Controller，未抽成中间件复用。
- **[ISSUE]** `operatorId` 传入 service 前未做存在性校验。
- **[CLEAN]** User Service 分层已完成（相比其他 Controller 先行重构）。