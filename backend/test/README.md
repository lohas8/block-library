# 图书馆管理系统 - 后端测试

本目录包含所有后端接口的测试用例。

## 测试文件结构

```
test/
├── app.test.js          # 基础配置和全局 hooks
├── book.test.js         # 图书接口测试 (8个接口)
├── user.test.js         # 用户接口测试 (7个接口)
├── borrow.test.js       # 借阅接口测试 (7个接口)
├── points.test.js       # 积分接口测试 (5个接口)
└── notification.test.js # 通知接口测试 (5个接口)
```

## 接口覆盖

| 模块 | 接口数量 | 状态 |
|------|----------|------|
| 图书 | 8 | ✅ |
| 用户 | 7 | ✅ |
| 借阅 | 7 | ✅ |
| 积分 | 5 | ✅ |
| 通知 | 5 | ✅ |
| **总计** | **32** | ✅ |

## 快速开始

### 1. 启动测试服务器

```bash
cd backend
npm run dev
```

服务器默认运行在 `http://localhost:7001`

### 2. 运行测试

```bash
# 运行所有测试
npm test

# 监听模式 (文件修改自动重跑)
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

### 3. 运行特定模块测试

```bash
# 只测试图书接口
npm test -- book

# 只测试用户接口
npm test -- user
```

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| TEST_BASE_URL | http://localhost:7001 | 测试服务器地址 |

## 测试说明

- 测试使用 `supertest` 模拟 HTTP 请求
- 测试会创建测试数据并在完成后自动清理
- 部分测试需要预先创建管理员/普通用户
- 测试默认等待服务器响应超时 10 秒

## 添加新测试

1. 在 `test/` 目录创建新的 `.test.js` 文件
2. 使用 `describe` 和 `it` 组织测试用例
3. 使用 `expect` 断言响应结果
4. 运行 `npm test` 验证
