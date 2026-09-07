# 小区图书管理系统

## 项目简介
为小区/乡村设计的共享图书管理系统，支持图书录入、借阅、预约、积分、物业评价、投票议事等功能。

## 技术栈
- **后端**: EggJS + MongoDB (egg-mongoose)
- **前端**: React + Redux + Ant Design
- **Mock 服务**: Express（仅供前端独立开发阶段使用）

## 环境要求

### 必需环境
- **Node.js** >= 16.x
- **MongoDB** >= 4.4（本地安装或使用云服务）

### 可选：MongoDB 安装指南

#### macOS
```bash
# 使用 Homebrew 安装
brew install mongodb-community@7.0

# 启动服务（数据目录默认在 /usr/local/var/mongodb）
mongod --config /usr/local/etc/mongod.conf

# 或通过 Homebrew 服务启动
brew services start mongodb-community@7.0
```

#### Ubuntu / Debian
```bash
# 导入公钥
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# 添加仓库
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# 安装
apt update && apt install -y mongodb-org

# 启动
systemctl start mongod
systemctl enable mongod
```

#### Windows
下载 MongoDB Community Server：https://www.mongodb.com/try/download/community

#### Docker 方式（最简单）
```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:7.0
```

### 验证 MongoDB 连接
```bash
# 进入 mongo shell
mongosh

# 或旧版本
mongo

# 验证连接
show dbs
```

---

## 快速开始

### 方式一：Mock 服务（无需 MongoDB，纯前端预览）

```bash
# 启动 Mock 服务（提供模拟数据）
node mock-server.js

# 服务运行于 http://localhost:7002
# 管理账户: admin / admin123
```

### 方式二：完整后端（需要 MongoDB）

#### 1. 配置 MongoDB 连接

后端默认连接本地 MongoDB，配置在 `backend/config/config.default.js`：

```javascript
mongoose: {
  url: 'mongodb://localhost:27017/library',
}
```

**如需修改**，可设置环境变量或直接编辑配置文件。

**连接字符串格式说明：**
- 本地：`mongodb://localhost:27017/library`
- 带认证：`mongodb://username:password@localhost:27017/library`
- 云服务（如腾讯云）：`mongodb://<host>:<port>/<database>?authSource=admin`

#### 2. 安装依赖

```bash
cd backend
npm install
```

#### 3. 启动后端服务

```bash
# 开发模式（热重载）
npm run dev

# 生产模式
npm start

# 停止服务
npm stop
```

后端运行于 `http://localhost:7001`

#### 4. 验证后端启动

```bash
# 健康检查
curl http://localhost:7001/api/books

# 应返回图书列表 JSON
```

### 3. 启动前端

```bash
cd frontend
npm install
npm start
```

前端运行于 `http://localhost:3000`

### 4. 完整启动顺序（推荐）

```bash
# 终端 1：MongoDB（如果本地安装）
mongod

# 终端 2：后端
cd backend && npm run dev

# 终端 3：前端
cd frontend && npm start
```

---

## 项目结构

```
block-library/
├── frontend/                # React 前端
│   ├── src/
│   │   ├── pages/           # 页面组件
│   │   ├── components/      # 公共组件
│   │   ├── store/           # Redux 状态管理
│   │   └── api/             # API 接口封装
│   └── package.json
├── backend/                  # EggJS 后端
│   ├── app/
│   │   ├── controller/       # 控制器
│   │   ├── service/          # 服务层
│   │   ├── model/            # 数据模型
│   │   ├── middleware/       # 中间件
│   │   └── router.js         # 路由定义
│   ├── config/
│   │   ├── config.default.js # 默认配置
│   │   └── plugin.js         # 插件配置
│   ├── test/                 # 测试用例
│   └── package.json
├── mock-server.js           # Mock 数据服务
└── README.md
```

---

## 功能模块

| 模块 | 说明 |
|------|------|
| 图书管理 | 添加/编辑/删除/导入图书，分类筛选 |
| 借阅管理 | 借书/还书/预约，支持数量上限控制 |
| 用户管理 | 注册/登录/角色（普通用户/管理员） |
| 积分系统 | 共享得积分、积分兑换商品 |
| 通知系统 | 到期提醒、新书上架通知 |
| 物业评价 | 年度评价配置与业主评分 |
| 投票议事 | 创建投票、业主投票、结果统计 |

---

## 后端 API 列表

### 图书
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/books | 图书列表（分页/搜索） | 公开 |
| GET | /api/books/categories | 分类列表 | 公开 |
| GET | /api/books/:id | 图书详情 | 公开 |
| POST | /api/books | 创建图书 | 管理员 |
| PUT | /api/books/:id | 更新图书 | 管理员 |
| DELETE | /api/books/:id | 删除图书 | 管理员 |
| POST | /api/books/import | 导入图书(Excel) | 管理员 |
| GET | /api/books/export | 导出图书(Excel) | 管理员 |

### 用户
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /api/users/register | 用户注册 | 公开 |
| POST | /api/users/login | 用户登录 | 公开 |
| GET | /api/users | 用户列表 | 管理员 |
| GET | /api/users/:id | 用户详情 | 登录 |
| PUT | /api/users/:id | 更新用户 | 登录 |
| POST | /api/users/:id/points | 更新积分 | 管理员 |
| GET | /api/users/:id/borrow-history | 借阅历史 | 登录 |

### 借阅
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /api/borrow | 借书 | 登录 |
| GET | /api/borrow | 借阅列表（筛选/分页） | 登录 |
| POST | /api/borrow/return/:id | 还书 | 登录 |
| POST | /api/reserve | 预约图书 | 登录 |
| GET | /api/reserve | 预约列表 | 登录 |
| POST | /api/reserve/cancel/:id | 取消预约 | 登录 |
| GET | /api/statistics | 统计数据 | 登录 |

### 积分
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/points/items | 商品列表 | 公开 |
| POST | /api/points/items | 创建商品 | 管理员 |
| PUT | /api/points/items/:id | 更新商品 | 管理员 |
| DELETE | /api/points/items/:id | 删除商品 | 管理员 |
| POST | /api/points/exchange | 积分兑换 | 登录 |

### 通知
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/notifications | 通知列表 | 登录 |
| POST | /api/notifications | 创建通知 | 管理员 |
| POST | /api/notifications/:id/read | 标记已读 | 登录 |
| POST | /api/notifications/read-all | 全部已读 | 登录 |
| DELETE | /api/notifications/:id | 删除通知 | 登录 |

### 物业评价
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/rating-categories | 评价配置列表 | 公开 |
| POST | /api/rating-categories | 创建评价大项 | 管理员 |
| PUT | /api/rating-categories/:id | 更新配置 | 管理员 |
| DELETE | /api/rating-categories/:id | 删除配置 | 管理员 |
| GET | /api/property-ratings/check | 检查是否已提交 | 登录 |
| POST | /api/property-ratings | 提交年度评价 | 登录 |
| GET | /api/property-ratings/stats | 评分统计 | 公开 |

### 投票
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/votes | 投票列表 | 公开 |
| POST | /api/votes | 创建投票 | 管理员 |
| GET | /api/votes/:id | 投票详情 | 公开 |
| POST | /api/votes/:id/cast | 投票 | 登录 |
| POST | /api/votes/:id/close | 结束投票 | 管理员 |

---

## 后端配置说明

### 配置文件：backend/config/config.default.js

```javascript
module.exports = {
  // Cookie 密钥（生产环境需修改）
  keys: 'library-backend-secret-key-2026',

  // MongoDB 连接
  mongoose: {
    url: 'mongodb://localhost:27017/library',
  },

  // CORS 跨域配置
  cors: {
    origin: '*',
    credentials: true,
  },

  // 积分规则
  points: {
    shareBook: 5,        // 共享一本书获得积分
    borrowBook: 1,      // 借阅一次扣积分
    defaultPoints: 0,   // 新用户默认积分
  },

  // 借阅规则
  borrow: {
    maxDays: 30,        // 最大借阅天数
    maxBooks: 5,       // 最多同时借阅数量
  },
};
```

### 环境变量（可选）

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `MONGODB_URL` | MongoDB 连接地址 | `mongodb://localhost:27017/library` |
| `PORT` | 后端服务端口 | `7001` |
| `NODE_ENV` | 运行环境 | `development` |

---

## 测试

```bash
cd backend

# 运行全部测试
npm test

# 监听模式（修改文件自动重跑）
npm run test:watch

# 覆盖率报告
npm run test:coverage
```

测试前置条件：MongoDB 中存在 `library_test` 数据库，测试数据为随机生成，不影响生产数据。

---

## Mock API 列表（mock-server.js）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/users/login | 用户登录 |
| GET | /api/books | 图书列表 |
| GET | /api/books/categories | 图书分类 |
| GET | /api/users | 用户列表 |
| GET | /api/borrow | 借阅记录 |
| GET | /api/statistics | 统计数据 |
| GET | /api/points/items | 积分商品 |
| GET | /api/notifications | 通知列表 |

Mock 服务管理账户：`admin` / `admin123`

---

## 常见问题

### Q: 后端启动报错 "Cannot connect to MongoDB"
确保 MongoDB 已启动且连接地址正确：
```bash
# 检查 MongoDB 服务状态
mongosh --eval "db.adminCommand('ping')"
```

### Q: 测试用例失败
116 个测试中约 56 个失败，属于已知问题：
- 权限中间件在某些路由未生效
- 部分路由（投票/通知）可能未正确注册
- 业务层校验逻辑不完善

这些属于实现层问题，需要继续修复。

### Q: 端口被占用
```bash
# 查找占用端口的进程
lsof -i :7001
lsof -i :7002

# 杀掉进程
kill -9 <PID>
```

---

## License

MIT
