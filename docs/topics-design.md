# 议事模块 + 评论模块设计方案

> 版本：v1.0 | 日期：2026-05-26 | 状态：设计阶段 → 待实现

---

## 一、需求概述

在 block-library 小区协作平台中新增**议事广场**模块，用于业主自治讨论。核心功能包括议题发布、关注跟踪、评论互动，以及管理员主导的状态推进和焦点置顶。

### 1.1 核心场景

- **业主**：创建议题、关注/取消关注、发表评论
- **其他用户**（租户、访客）：关注议题、发表评论，不能创建议题
- **管理员**：设置/取消焦点议题（置顶），推进议题状态

---

## 二、数据模型设计

### 2.1 议题表 `Topic`

| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | ObjectId | 主键 |
| `title` | String (100) | 议题标题 |
| `content` | String (5000) | 议题正文 |
| `status` | String | 状态枚举，见 2.4 |
| `is_focused` | Boolean | 是否为焦点议题（置顶） |
| `focused_at` | Date | 置顶时间（用于多个焦点议题间的排序） |
| `follow_count` | Number | 关注人数（冗余字段，避免全表 COUNT） |
| `comment_count` | Number | 评论数（冗余字段） |
| `hot_score` | Number | 预计算热度分（浮点，保留2位小数） |
| `last_activity_at` | Date | 最后活跃时间（最后评论时间，用于时间衰减） |
| `author_id` | ObjectId | 发起人（引用 User） |
| `author_name` | String | 发起人姓名（冗余存储，避免关联查询） |
| `community_id` | ObjectId | 所属小区（可选，支持多小区场景） |
| `tags` | [String] | 标签列表（预留字段） |
| `images` | [String] | 图片附件 URL 列表（预留字段） |
| `created_at` | Date | 创建时间（自动） |
| `updated_at` | Date | 更新时间（自动） |

**索引策略：**
```javascript
{ is_focused: -1, focused_at: -1 }       // 焦点议题专用，置顶时间倒序
{ community_id: 1, status: 1 }           // 小区+状态联合筛选
{ community_id: 1, hot_score: -1 }       // 热度排序
{ community_id: 1, created_at: -1 }     // 时间排序
{ author_id: 1 }                         // 作者筛选
```

### 2.2 关注关系表 `TopicFollow`

| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | ObjectId | 主键 |
| `topic_id` | ObjectId | 关联议题 |
| `user_id` | ObjectId | 关注用户 |
| `created_at` | Date | 关注时间 |

**约束：** 联合唯一索引 `{ topic_id: 1, user_id: 1 }` — 同一用户对同一议题只能关注一次，防止数据异常。

### 2.3 评论表 `Comment`

| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | ObjectId | 主键 |
| `topic_id` | ObjectId | 关联议题 |
| `content` | String (2000) | 评论内容（纯文本） |
| `author_id` | ObjectId | 评论人 |
| `author_name` | String | 评论人姓名（冗余存储） |
| `is_deleted` | Boolean | 软删除标记（默认 false） |
| `created_at` | Date | 评论时间 |
| `updated_at` | Date | 更新时间 |

**索引：** `{ topic_id: 1, created_at: 1 }`（评论列表按时间排序）、`{ author_id: 1 }`

### 2.4 议题状态流转

```
pending → accepted → processing → pending_verify → completed → closed
```

| 状态值 | 标签 | 说明 |
|--------|------|------|
| `pending` | 待受理 | 新建议题默认状态 |
| `accepted` | 已受理 | 管理员已确认受理 |
| `processing` | 处理中 | 处理中 |
| `pending_verify` | 待验收 | 待发起人验收确认 |
| `completed` | 已完成 | 流程完结 |
| `closed` | 已关闭 | **终态**，禁止评论，可保留历史 |

**流转规则：**
- 管理员可按顺序推进状态（可跳跃，如从 pending 直接到 completed）
- `closed` 为终态，不可恢复，不可再评论
- 其他状态均可评论、关注
- 管理员可将任意非终态状态重置回 `pending`

---

## 三、API 接口设计

### 3.1 议题 API

#### `GET /api/topics` — 议题列表

**Query 参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `status` | string | 否 | 状态筛选，如 `pending`；不传则返回全部 |
| `sort` | string | 否 | `hot`（默认，热度降序）或 `time`（创建时间降序） |
| `page` | number | 否 | 默认 1 |
| `pageSize` | number | 否 | 默认 10 |
| `community_id` | string | 否 | 小区筛选 |

**响应：**
```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "_id": "...",
        "title": "关于垃圾分类的建议",
        "status": "processing",
        "is_focused": true,
        "focused_at": "2026-05-26T...",
        "follow_count": 12,
        "comment_count": 5,
        "hot_score": 8.4,
        "author_name": "张三",
        "created_at": "...",
        "last_activity_at": "..."
      }
    ],
    "total": 42,
    "page": 1,
    "pageSize": 10
  }
}
```

**排序逻辑：**
1. **焦点议题组**：所有 `is_focused=true` 的议题按 `focused_at` 倒序排列，显示在列表最顶部
2. **普通议题组**：按 `hot_score` 或 `created_at` 降序，与焦点议题不混排

---

#### `GET /api/topics/:id` — 议题详情

**响应：**
```json
{
  "code": 0,
  "data": {
    "_id": "...",
    "title": "...",
    "content": "...",
    "status": "processing",
    "is_focused": false,
    "focused_at": null,
    "follow_count": 12,
    "comment_count": 5,
    "hot_score": 8.4,
    "author_id": "...",
    "author_name": "张三",
    "created_at": "...",
    "updated_at": "...",
    "is_followed": true,
    "tags": [],
    "images": []
  }
}
```

**说明：** `is_followed` 表示当前登录用户是否已关注该议题（需携带 token）。

---

#### `POST /api/topics` — 创建议题

**权限：** 仅业主（`role=user` 或 `role=owner`）可创建

**Request：**
```json
{
  "title": "关于小区垃圾分类的建议",
  "content": "建议在东门增设...",
  "community_id": "ObjectId",
  "tags": ["环保", "物业"],
  "images": ["https://..."]
}
```

**响应：**
```json
{ "code": 0, "data": { topic }, "message": "创建议题成功" }
```

---

#### `PUT /api/topics/:id/status` — 修改议题状态

**权限：** 仅管理员（`role=admin` 或 `role=super_admin`）

**Request：**
```json
{ "status": "processing" }
```

---

#### `PUT /api/topics/:id/focus` — 设置/取消焦点议题

**权限：** 仅管理员

**Request：**
```json
{ "is_focused": true }
```
> `is_focused=true` 时自动设置 `focused_at = new Date()`

---

#### `POST /api/topics/:id/follow` — 关注/取消关注

**权限：** 全体已登录用户（业主 + 其他用户）

**Request：**
```json
{ "action": "follow" | "unfollow" }
```

**响应：**
```json
{ "code": 0, "data": { "follow_count": 13, "hot_score": 9.1 }, "message": "关注成功" }
```

---

### 3.2 评论 API

#### `GET /api/comments` — 评论列表

**Query 参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `topic_id` | string | 是 | 关联议题 ID |
| `sort` | string | 否 | `asc`（从旧到新，默认）或 `desc`（从新到旧） |
| `page` | number | 否 | 默认 1 |
| `pageSize` | number | 否 | 默认 20 |

---

#### `POST /api/topics/:topic_id/comments` — 发评论

**权限：** 全体已登录用户（议题状态非 `closed`）

**Request：**
```json
{ "content": "支持这个建议！" }
```

**限制：**
- 内容最大 2000 字
- 议题状态为 `closed` 时禁止评论，返回错误

---

#### `DELETE /api/topics/:topic_id/comments/:id` — 删除评论

**权限：** 评论者本人 或 管理员

> 执行软删除：`is_deleted=true`（物理删除暂不实现）

**响应：**
```json
{ "code": 0, "message": "评论已删除" }
```

---

## 四、热度排序算法

### 4.1 推荐算法

```
hot_score = (follow_count × 0.6 + comment_count × 0.4) × decay_factor

decay_factor = e^(-λ × hours_since_created)

λ = 0.15
```

### 4.2 参数选择理由

| 参数 | 值 | 理由 |
|------|-----|------|
| `follow_weight` | 0.6 | 关注成本高于评论（需认真考虑后才能关注），权重更高 |
| `comment_weight` | 0.4 | 评论更活跃，但门槛低，适当降权 |
| `λ` | 0.15 | 半衰期 ≈ 4.6 小时；7 天后热度衰减至约 35%，14 天约 12% |
| `score_precision` | 2 位小数 | 便于前端显示和调试 |

### 4.3 衰减曲线参考

| 时间 | 衰减因子 | 说明 |
|------|---------|------|
| 0 小时 | 1.000 | 刚发布 |
| 4.6 小时 | 0.500 | 半衰期 |
| 1 天 | 0.273 | 新议题仍有优势 |
| 7 天 | 0.347 | 老议题逐渐降温 |
| 14 天 | 0.122 | 长尾内容保留曝光机会 |

### 4.4 为什么选这个算法

| 备选方案 | 缺点 |
|----------|------|
| 纯 `(关注 + 评论)` | 无法区分新老议题，刷榜后难以降权 |
| 纯时间衰减 | 优质老议题快速沉没，不利于长尾内容 |
| 对数压缩 `log1p(score)` | 过度压制高热度议题展示，实际场景不必要 |
| **带衰减的加权法** | 在新旧平衡、刷榜抑制之间取得最佳效果 |

### 4.5 刷榜抑制机制

1. **唯一关注约束**：`TopicFollow` 表联合唯一索引 `({ topic_id, user_id })`，同一用户对同一议题只能关注一次
2. **预计算字段**：`hot_score` 在数据库中预计算，排序时无需实时聚合，查询性能好
3. **更新策略**：`hot_score` 在每次 `follow/unfollow` 或 `comment/create/delete` 时同步更新（同步更新，无需定时任务）
4. **软删除不参与计算**：评论删除时 `comment_count` 减 1，但 `is_deleted=true` 的记录不计入 `comment_count`

---

## 五、前端页面设计

### 5.1 页面清单

| 页面 | 路由 | 权限 |
|------|------|------|
| 议事广场（列表） | `/topics` | 全体登录用户 |
| 议题详情 | `/topics/:id` | 全体登录用户 |
| 创建议题 | `/topics/create` | 仅业主 |
| 管理后台→议题管理 | `/admin/topics` | 仅管理员（待实现） |

### 5.2 议事广场 `/topics`

**布局参考（规则管理页面风格）：**
- 顶部标题栏：`📋 议事广场` + 总议题数 + 排序切换（下拉：热度/最新）+ 创建议题按钮
- 内容区：`Card` 容器 + `Tabs` 状态筛选（全部 / 待受理 / 已受理 / 处理中 / 待验收 / 已完成 / 已关闭）
- 列表：`Table` 展示，每行：🔥 置顶标记 | 议题标题 + 状态标签 + 作者 + 评论数 + 关注数 + 热度分 | 发布时间
- 排序：焦点议题组在最顶部；普通议题按热度或时间排序

### 5.3 议题详情 `/topics/:id`

- 顶部返回按钮
- 议题主卡片：标题 + 状态标签 + 置顶标记 + 作者信息 + 元数据（关注数/评论数/热度）+ 管理操作区（管理员专属：状态修改下拉框 + 设为/取消置顶按钮）
- 议题正文区
- 操作区：关注/取消关注按钮
- 评论区：评论输入框（非 closed 状态可见）+ 评论列表（从旧到新）+ 删除按钮（评论者或管理员可见）

### 5.4 创建议题 `/topics/create`

- 返回按钮
- 表单：`Form` > `Input(title)` + `TextArea(content)` + 提交/取消按钮
- 权限：非业主用户访问时跳转或隐藏表单

---

## 六、文件结构

```
backend/
  app/
    model/
      topic.js        ← 议题 Model
      topicFollow.js  ← 关注关系 Model
      comment.js      ← 评论 Model
    controller/
      topic.js        ← 议题 Controller
      comment.js      ← 评论 Controller
    router.js         ← 新增 8 条路由

frontend/src/
  pages/
    TopicsList.js     ← 议事广场（列表页）
    TopicsList.css
    TopicDetail.js    ← 议题详情 + 评论
    TopicDetail.css
    TopicCreate.js    ← 创建议题
    TopicCreate.css
  api/index.js        ← 新增 topics/comments API（可选，新建 api/topics.js）
  App.js              ← 新增 3 个路由
  components/
    AppLayout.js      ← 侧边栏新增「议事广场」菜单项
```

---

## 七、实现优先级

### Phase 1（核心闭环，可测试）
1. `Topic` + `TopicFollow` + `Comment` Model
2. 议题 CRUD + 列表（状态筛选 + 默认热度排序）
3. 评论功能（时间正序）
4. 关注功能（follow/unfollow）

### Phase 2（管理员能力）
5. 管理员状态修改下拉框
6. 焦点议题置顶/取消

### Phase 3（增强体验）
7. 富文本评论（预留 `content` 字段支持 HTML）
8. 热度算法完整实现（`e^(-λ×hours)` 衰减）
9. 评论排序可配置（正序/倒序）

---

## 八、数据库初始数据建议（Mock）

```javascript
// 议题示例
{
  title: "关于东门垃圾分类点位的调整建议",
  content: "目前东门分类点位设置在主通道旁，早高峰时段容易造成拥堵，建议迁移至...",
  status: "pending",
  author_name: "张三",
  follow_count: 3,
  comment_count: 2,
  hot_score: 2.1,
  created_at: new Date("2026-05-26"),
}

// 评论示例
{
  topic_id: "ObjectId",
  content: "支持！确实每天早上都很堵。",
  author_name: "李四",
}
```

---

*设计文档版本：v1.0 | 待进入编码阶段*