# Books（图书管理子系统）

> 图书 CRUD、分类管理、ISBN 查询、状态管理（在馆/借出/预约/下架）。

---

## Overview

### Purpose
管理社区共享图书的全生命周期——从录入、分类、借出状态流转到下架。图书状态是 Borrow 子系统的决策依据。

### Responsibilities
- 图书新增（手动 / ISBN 查询）
- 图书列表查询（分页 + 分类筛选）
- 图书详情、修改、删除
- 图书分类管理（增/删/改/查）
- 图书状态维护（available / borrowed / reserved / unavailable）

### Boundaries
图书的借出/归还操作由 Borrow subsystem 处理，Books subsystem 仅维护状态值。

---

## File Map

| File | Role |
|---|---|
| `backend/app/controller/book.js` | 图书 Controller（未完全重构，直连 Model） |
| `backend/app/service/book.js` | 图书 Service（未重构） |
| `backend/app/model/book.js` | Mongoose Book 模型 |
| `frontend/src/api/index.js` | bookApi（list/detail/create/update/delete/categories） |
| `frontend/src/pages/BookList.js` | 图书列表页 |
| `frontend/src/store/index.js` | Redux `bookSlice` |

---

## Execution Flow

### Book Creation（添加图书）

1. `POST /api/books` → `BookController.create`
2. Controller 直接调用 `ctx.model.Book.create(data)`
3. 返回新建图书 ID 和信息

### Book Status Transition（图书状态流转）

```
available → borrowed（借出时 Borrow subsystem 更新）
available → reserved（预约时 Topic subsystem 更新）
borrowed → available（归还后）
reserved → available（取消预约或借出完成）
unavailable（管理员下架）
```

---

## Gotchas

- 图书状态由借阅/预约操作自动流转，删除图书前应检查是否有未完成借阅记录。
- 前端 BookList 使用 Ant Design Table，有分页和筛选能力。

---

## Findings

- **[ISSUE]** Book Controller/Service 未完成分层重构，存在 Model 直连 Controller 问题。
- **[REVIEW]** ISBN 查询接口（第三方 API）未实现。
- **[NOT AUDITED]** `book.js` Controller 实际代码未完整读取，以上为基于架构文档推断。