# 社区图书管理系统 - 实现计划

## 📅 总体安排

| 阶段 | 周期 | 目标 |
|------|------|------|
| 阶段一：基础架构 | 1天 | 项目搭建、数据库设计 |
| 阶段二：后端核心 | 3天 | 核心API开发 |
| 阶段三：前端基础 | 3天 | 页面框架、路由 |
| 阶段四：功能开发 | 5天 | 核心业务功能 |
| 阶段五：积分系统 | 2天 | 积分获取/兑换 |
| 阶段六：通知统计 | 1天 | 提醒、统计功能 |
| 阶段七：测试优化 | 1天 | 联调、测试 |

**预计总工期**：约 16 天

---

## 🏗️ 阶段一：基础架构（第1天）

### 1.1 项目初始化
- [ ] 初始化 Egg.js 后端项目
- [ ] 初始化 React + Redux 前端项目
- [ ] 配置开发环境（ESLint、Prettier）

### 1.2 数据库设计
```javascript
// 用户集合
User: {
  _id, phone, password, nickname, avatar,
  role: 'user' | 'librarian' | 'admin',  // 三种角色
  permissions: [],    // 权限列表
  points: Number,    // 积分
  createdAt
}

// 图书集合
Book: {
  _id, isbn, title, author, publisher,
  cover, category, tags,
  status: 'available' | 'borrowed' | 'reserved',
  ownerId,               // 共享者ID
  createdAt
}

// 借阅记录
Borrow: {
  _id, bookId, userId,
  borrowDate, dueDate, returnDate,
  status: 'borrowed' | 'returned' | 'overdue',
  pointsEarned           // 获得积分
}

// 预约记录
Reserve: {
  _id, bookId, userId,
  reservedAt, notified
}

// 积分记录
PointLog: {
  _id, userId, type,
  amount, description, createdAt
}

// 积分商品
Product: {
  _id, name, image, pointsRequired, stock
}

// 分类
Category: {
  _id, name, icon
}
```

### 1.3 API 目录结构规划
```
/api
├── /auth
│   ├── POST /register     # 注册
│   ├── POST /login        # 登录
│   └── GET /info         # 获取用户信息
├── /books
│   ├── GET /              # 图书列表
│   ├── POST /             # 添加图书
│   ├── GET /:id           # 图书详情
│   ├── PUT /:id           # 更新图书
│   ├── DELETE /:id       # 删除图书
│   └── POST /isbn        # ISBN查询
├── /borrow
│   ├── POST /             # 借书
│   ├── POST /return       # 还书
│   ├── GET /my            # 我的借阅
│   └── GET /history       # 借阅记录
├── /reserve
│   ├── POST /             # 预约
│   ├── DELETE /:id       # 取消预约
│   └── GET /my            # 我的预约
├── /points
│   ├── GET /              # 我的积分
│   ├── GET /logs          # 积分记录
│   └── POST /exchange     # 积分兑换
├── /products
│   ├── GET /              # 商品列表
│   └── POST /             # 添加商品（管理员）
└── /stats
    ├── GET /overview      # 数据概览
    └── GET /ranking       # 排行榜
```

---

## ⚙️ 阶段二：后端核心（第2-4天）

### 第2天：用户模块 + 图书模块
- [ ] 用户注册/登录（JWT鉴权）
- [ ] 图书 CRUD
- [ ] ISBN 查询接口（调用第三方API）
- [ ] 图书搜索/筛选

### 第3天：借阅模块
- [ ] 借书逻辑（库存检查、积分计算）
- [ ] 还书逻辑（逾期检测、积分奖励）
- [ ] 预约功能

### 第4天：积分模块 + 通知
- [ ] 积分获取规则
- [ ] 积分商品管理
- [ ] 积分兑换
- [ ] 通知服务（到期提醒）

---

## 🎨 阶段三：前端基础（第5-7天）

### 第5天：项目搭建
- [ ] React + Redux 项目初始化
- [ ] 路由配置
- [ ] 公共组件（Header、Footer、Modal）

### 第6天：页面框架
- [ ] 首页（轮播、推荐图书）
- [ ] 登录/注册页
- [ ] 个人中心

### 第7天：状态管理
- [ ] Redux store 设计
- [ ] 用户状态
- [ ] 图书状态
- [ ] 购物车/借阅车状态

---

## ✨ 阶段四：功能开发（第8-12天）

### 第8天：图书功能
- [ ] 图书列表页（分页、筛选）
- [ ] 图书详情页
- [ ] ISBN 扫码录入

### 第9-10天：借阅功能
- [ ] 借书流程
- [ ] 还书流程
- [ ] 预约功能
- [ ] 借阅记录

### 第11-12天：图书管理（管理员）
- [ ] 图书管理（增删改查）
- [ ] 读者管理
- [ ] 分类管理
- [ ] 借阅审核

---

## 🏆 阶段五：积分系统（第13-14天）

### 第13天：积分核心
- [ ] 积分展示
- [ ] 积分记录
- [ ] 积分规则配置

### 第14天：兑换功能
- [ ] 商品列表
- [ ] 兑换流程
- [ ] 兑换记录

---

## 🔔 阶段六：通知与统计（第15天）

### 通知功能
- [ ] 到期提醒
- [ ] 逾期通知
- [ ] 预约到书提醒

### 统计功能
- [ ] 数据概览
- [ ] 借阅排行
- [ ] 积分排行

---

## 🧪 阶段七：测试与优化（第16天）

- [ ] 前后端联调
- [ ] Bug 修复
- [ ] 性能优化
- [ ] 部署文档

---

## 🔐 权限模块实现要点

### 后端权限控制
1. **角色中间件** (`middleware/role.js`)
   - 验证用户角色
   - 拦截未授权请求

2. **权限装饰器** (controller 层)
   - `@RequirePermission('book:create')`
   - 可在方法级别控制权限

3. **用户角色分配**
   - 注册默认为 `user`
   - `librarian`、`admin` 由系统管理员分配

### 前端权限控制
1. **路由守卫**
   - 管理员页面需要特定角色才能访问

2. **按钮级别权限**
   - 根据用户权限显示/隐藏操作按钮
   - 使用 `<HasPermission permission="book:create">` 组件

---

## 📤 GitHub 工作流

### 代码提交流程
1. 每完成一个功能 → 创建分支 → 提交 PR
2. 你审核代码 → 决定是否合并
3. 合并后继续开发下一个功能

### 分支命名规范
- `feat/user-auth` - 用户认证功能
- `feat/book-crud` - 图书管理
- `fix/login-bug` - 登录Bug修复

---

## 📦 交付物

1. **源代码**：完整的前后端项目
2. **数据库脚本**：MongoDB 初始化脚本
3. **部署文档**：本地部署指南
4. **用户手册**：操作说明

---

## ⚠️ 风险与应对

| 风险 | 应对方案 |
|------|----------|
| ISBN API 不稳定 | 备用：手动输入 + 本地缓存 |
| 并发借阅冲突 | 乐观锁 + 事务处理 |
| 数据丢失 | 定期备份 |

---

**计划版本**：v1.0  
**创建日期**：2026-03-17
