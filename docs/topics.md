# Topics（议事广场子系统）

> 社区议事模块：发布议题、评论互动、关注机制、热度计算。Desktop UI，通过首页「立即进入」卡片进入。

---

## Overview

### Purpose
为社区提供一个公共议事空间，业主可以发起议题、发表评论、关注感兴趣的议题。热度计算基于评论数和关注数综合评估。

### Responsibilities
- 议题发布（标题、内容、分类）
- 评论（对议题的回复）
- 关注（收藏感兴趣的议题）
- 热度计算（关注数 × 1 + 评论数 × 2）
- 议事广场列表（分页、热度排序）

### Boundaries
不处理借阅相关话题（Borrow subsystem），不处理用户积分（Users subsystem）。

---

## File Map

| File | Role |
|---|---|
| `backend/app/controller/topic.js` | 议题 CRUD + 评论 + 关注 |
| `backend/app/service/topic.js` | 议事广场业务逻辑（未完全重构） |
| `backend/app/model/topic.js` | Mongoose Topic 模型 |
| `backend/app/model/comment.js` | Mongoose Comment 模型 |
| `frontend/src/pages/TopicsList.js` | 议题列表 |
| `frontend/src/pages/TopicDetail.js` | 议题详情+评论 |
| `frontend/src/pages/TopicCreate.js` | 发布议题 |
| `frontend/src/store/index.js` | Redux 无独立 slice（共用 borrow/notification） |

---

## Execution Flow

### Publish Topic（发布议题）

1. `POST /api/topics` → `TopicController.create`
2. 校验标题/内容非空
3. 写入 Topic 模型（authorId, title, content, category, createdAt）
4. 初始化 `viewCount=0, followerCount=0, commentCount=0`

### Heat Score Calculation（热度计算）

```
heatScore = followerCount × 1 + commentCount × 2
```

热度实时计算，排序查询时按 `followerCount + commentCount * 2` 降序。

---

## Gotchas

- 桌面端 UI，移动端未适配。
- 暂无议题分类体系（category 仅存储，查询未做分类过滤）。

---

## Findings

- **[ISSUE]** Topic Controller/Service 未完全分层重构。
- **[ISSUE]** Comment 模型的 API 端点未在 `router.js` 中确认（需要补充 audit）。
- **[REVIEW]** 桌面端 UI 确认（2026-05-26），移动端适配待定。
- **[NOT AUDITED]** 完整 controller 代码未读取，热度计算公式待验证。