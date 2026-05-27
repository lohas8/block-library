# block-library 手机端首页 - 议事布局实现文档

> 基于 wireframe_yishi_v3.html 实现手机端首页完整布局，含议事模块、投票、物业评价三大区块。2026-05-27

---

## 一、页面结构（按 wireframe 顺序）

```
MobileHome
├── Header（议事标题 + slogan）
├── SearchBar（搜索议题）
├── SectionTitle + RateCard（物业评价 3 项评分）
├── SectionTitle + SlidesContainer（焦点议题横向滚动卡片）
├── SectionTitle + VoteList（投票列表 + 进度条）
├── SectionTitle + TagTabs（问题列表状态 Tab）
│   └── TopicsList（议事列表）
└── BottomNav（5 项底部导航，AI 项突出）
```

---

## 二、路由规划

| 路由 | 组件 | 说明 |
|---|---|---|
| `/mobile` | `AppLayoutMobile` | 根路由 |
| `/mobile/index` | `MobileHome` | 首页（本设计文档） |
| `/mobile/topics` | `MobileTopicsList` | 议事列表 |
| `/mobile/topics/:id` | `MobileTopicDetail` | 议事详情+评论 |
| `/mobile/topics/create` | `MobileTopicCreate` | 创建议题 |
| `/mobile/square` | `MobileSquare` | 广场（预留） |
| `/mobile/ai` | `MobileAI` | AI 助手（预留） |
| `/mobile/profile` | `MobileProfile` | 个人中心 |
| `/mobile/books` | `MobileBookList` | 图书列表 |
| `/mobile/my-borrows` | `MobileMyBorrows` | 我的借阅 |
| `/mobile/tools` | `MobileToolShare` | 工具共享 |
| `/mobile/notifications` | `MobileNotifications` | 通知中心 |

---

## 三、组件清单

### 3.1 Header
- 左侧空（留白对称）
- 主标题「议事」左对齐 + slogan「AI赋能 · 区块链构建可信业主自治平台」

### 3.2 SearchBar
- 占位输入框，点击跳转 `/mobile/topics` 并聚焦搜索框

### 3.3 RateCard（物业评价）
- 3 列评分：整体服务 / 维修响应 / 环境绿化
- 每列：星级 + 分数 + 标签
- "去评价"按钮 → `/mobile/rate`（新页面，Phase 3）

### 3.4 SlidesCard（焦点议题）
- 横向滚动卡片，卡片宽度 200px
- 每卡片：标题 + 描述（2行截断）+ 标签（热议/投票中）+ 参与人数
- 点击跳转 `MobileTopicDetail`

### 3.5 VoteItem（投票）
- 每投票项：标题 + 进度条（同意绿色/反对红色）+ 参与人数 + 截止时间
- 投票即 Topic 的一种展示形式（status=投票中 或 有关联投票数据）
- 点击跳转 Topic 详情

### 3.6 TagTabs（问题列表状态）
- 7 个标签：全部 / 待受理 / 已受理 / 处理中 / 待验收 / 已完成 / 已关闭
- 点击标签筛选 Topic 列表（同一页面内切换）

### 3.7 BottomNav（5 项）
- 议事（左起第1，active） / 家园 / AI（第3个圆形突出） / 广场 / 我的
- 各 tab 图标 emoji 化，控制 `AppLayoutMobile` 重构

---

## 四、数据来源

| 数据 | 来源 |
|---|---|
| 焦点议题列表 | `GET /api/topics?is_focused=true&sort=hot&pageSize=5` |
| 投票列表 | `GET /api/topics?status=投票中&pageSize=3` 或独立 vote 接口 |
| 问题列表 | `GET /api/topics?sort=hot&pageSize=10` + Tab 状态筛选 |
| 物业评分 | 前端 hardcode（Phase 1），后续接评价 API |

---

## 五、实现阶段

### Phase 1：基础框架（路由 + 结构 + BottomNav）
- [ ] 重写 `MobileHome.js`，按 wireframe 顺序实现各区块
- [ ] 新增 `MobileHome.css`（wireframe 样式）
- [ ] 更新 `AppMobile.js` 路由，新增 topics/ai/square 等路由
- [ ] 重构 `AppLayoutMobile`，支持 5 项底部导航
- [ ] `MobileTopicsList.js`（议事列表 + Tab 筛选）
- [ ] `MobileTopicDetail.js`（议事详情 + 评论）

### Phase 2：议事功能闭环
- [ ] 前端 Topics API 调用（list/detail/create/follow/comment）
- [ ] 焦点议题幻灯片（取 is_focused=true 的 Topic）
- [ ] 议事列表 Tab 筛选（7种状态）
- [ ] 关注/取关功能
- [ ] 评论功能（增/查）

### Phase 3：物业评价 + 投票
- [x] 物业评分卡片（接 propertyRating API）
- [x] "去评价"按钮 + 评价页面（路由已挂载）
- [x] 投票进度条 UI（接 vote API）
- [x] 投票详情页 MobileVoteDetail（投票/多选/百分比/防重复）

---

## 六、技术细节

### 评分体系颜色
```
热议    → background:#1a1a1a; color:#fff
投票中  → background:#e8f5e9; color:#2e7d32
待投票  → background:#fff3e0; color:#e65100
已结束  → background:#f5f5f5;  color:#999
```

### 底部导航对齐
```css
.nav-item.ai .nav-icon {
  width: 32px; height: 32px;
  background: #1a1a1a;
  border-radius: 50%;
  position: relative; top: -4px;
}
```

### 议题热度计算
```
hot_score = (follow_count × 0.6 + comment_count × 0.4) × e^(-λ × hours)
λ = 0.15
```

---

## 七、文件变更清单

```
frontend/src/mobile/
├── pages/
│   ├── MobileHome.js       ← 重写，按 wireframe
│   ├── MobileHome.css      ← 新建，wireframe 样式
│   ├── MobileTopicsList.js ← 新建（或从 existing MobileTopicsList.js 增强）
│   ├── MobileTopicDetail.js← 新建（或增强已有）
│   └── MobileTopicCreate.js← 新建（创建议题）
├── AppLayoutMobile.js      ← 重构，支持5项底部导航
└── AppMobile.js            ← 更新路由
```