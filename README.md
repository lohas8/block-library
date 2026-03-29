# 小区图书管理系统

## 项目简介
为小区/乡村设计的共享图书管理系统，支持图书录入、借阅、预约、积分等功能。

## 技术栈
- **后端**: EggJS + MongoDB
- **前端**: React + Redux

## 功能模块
1. 图书管理 - ISBN扫码/手动录入、搜索、筛选、分类
2. 借阅管理 - 共享/借出/归还/预约
3. 读者管理 - 会员注册/管理
4. 数据统计 - 借阅排行、库存统计
5. 积分系统 - 共享得积分、借阅扣积分、积分兑换
6. 站内提醒 - 到期提醒、新书上架通知
7. 数据导入导出 - Excel/CSV

## 快速开始

### 后端启动
```bash
cd backend
npm install
npm run dev
```

### 前端启动
```bash
cd frontend
npm install
npm start
```

## 配置
- 积分规则在 `backend/app/config/config.default.js` 中配置
- 积分兑换物品在数据库中配置
