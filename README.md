# 小区图书管理系统

## 项目简介
为小区/乡村设计的共享图书管理系统，支持图书录入、借阅、预约、积分等功能。

## 技术栈
- **后端**: EggJS + MongoDB（开发中）
- **前端**: React + Redux + Ant Design
- **Mock 服务**: Express（前后端分离开发期间使用）

## 当前状态
- ✅ 前端界面已完成，可直接运行
- 🔧 后端接口开发中
- 📦 使用 Mock 数据展示前端功能

## 快速开始

### 1. 启动 Mock 服务（提供模拟数据）
```bash
node mock-server.js
```
Mock 服务运行于 `http://localhost:7002`
- 管理账户: `admin` / `admin123`

### 2. 启动前端
```bash
cd frontend
npm install
npm start
```
前端运行于 `http://localhost:3000`

### 3. 访问系统
打开浏览器访问 `http://localhost:3000`，使用 mock 账户登录。

## 目录结构
```
block-library/
├── frontend/          # React 前端
│   ├── src/
│   │   ├── pages/    # 页面组件
│   │   ├── components/  # 公共组件
│   │   ├── store/    # Redux 状态管理
│   │   └── api/      # API 接口封装
│   └── build/        # 生产构建输出
├── backend/          # EggJS 后端（开发中）
├── mock-server.js    # Mock 数据服务
└── README.md
```

## 功能模块
1. 图书管理 - 添加/编辑/删除图书，分类筛选
2. 借阅管理 - 借书/还书/预约
3. 用户管理 - 会员注册/管理
4. 数据统计 - 借阅排行、库存统计
5. 积分系统 - 共享得积分、积分兑换
6. 通知系统 - 到期提醒、新书上架通知

## Mock API 列表
- `POST /api/users/login` - 用户登录
- `GET /api/books` - 图书列表
- `GET /api/books/categories` - 图书分类
- `GET /api/users` - 用户列表
- `GET /api/borrow` - 借阅记录
- `GET /api/statistics` - 统计数据
- `GET /api/points/items` - 积分商品
- `GET /api/notifications` - 通知列表