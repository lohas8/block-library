# Auth（认证子系统）

> Token 生成与验证、用户登录/注册状态管理。Frontend 通过 base64 编码的简化 token 与 Backend 通信。

---

## Overview

### Purpose
统一管理用户身份认证。登录后 Backend 返回编码 token，Frontend 存储于 localStorage 并在每次请求时附加。Backend 从请求头解码出用户 ID 并挂载到 `ctx.state.user`。

### Responsibilities
- 用户注册（用户名/密码/姓名/手机/邮箱）
- 用户登录（用户名+密码校验 → 返回 token）
- Token 解析与用户上下文注入
- 登出（前端清空 localStorage）

### Boundaries
不负责积分计算（由 Points subsystem 处理）、不负责权限校验逻辑（由各 Controller 自行判断 role）。

---

## File Map

| File | Role |
|---|---|
| `backend/app/controller/user.js` | 用户注册/登录/详情接口，thin controller |
| `backend/app/service/user.js` | 用户业务逻辑（部分已重构） |
| `backend/app/core/base_controller.js` | `ctx.success` / `ctx.fail` 封装 |
| `backend/app/core/exceptions.js` | 自定义异常类 |
| `backend/app/model/user.js` | Mongoose User 模型，含 `comparePassword` |
| `frontend/src/api/index.js` | axios 实例，请求/响应拦截器 |
| `frontend/src/store/index.js` | Redux user slice (`setUser` / `logout`) |

---

## Execution Flow

### Login（登录）

1. `POST /api/user/login` → `backend/app/router.js` → `UserController.login`
2. `UserController.login` 调用 `ctx.model.User.findOne({ username })`
3. 调用 `user.comparePassword(password)`（bcrypt 比对）
4. 密码正确则用 `Buffer.from(`${user._id}:${user.username}`).toString('base64')` 生成 token
5. `ctx.success({ token, user: { id, username, name, points, role } })`
6. Frontend axios 拦截器从 response header 提取 token 存入 localStorage

### Protected Request（受保护请求）

1. Frontend 发起请求，`apiInstance.interceptors.request` 注入 `Authorization: Bearer <token>`
2. Backend 路由通过中间件或手动 `ctx.state.user` 读取
3. 401 时 Frontend axios 拦截器跳转 `/login`

---

## Gotchas

- Token 是 base64 编码而非签名 JWT，任何人都可解码。**绝对不能用于生产环境**。
- `ctx.fail('用户名或密码错误')` 对登录失败不区分具体原因（防用户名枚举攻击）。
- 前端 Redux `setUser` 支持两种 payload 格式：`{ token, user }` 和 flat 格式。

---

## Findings

- **[ISSUE]** 应使用 `egg-jwt` 或 `jsonwebtoken` 替代 base64 编码，加入过期时间和签名验证。
- **[ISSUE]** `user.js` Service 仅部分重构，登录/注册仍在 Controller 内直连 Model。
- **[CLEAN]** 前端 API 拦截器对 401 的处理直接 `window.location.href`，会影响前端路由历史。