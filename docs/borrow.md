# Borrow（借阅管理子系统）

> 借书、还书、预约全流程管理。包含借阅规则校验（限借数量、借阅时长）、逾期检测、积分计算。

---

## Overview

### Purpose
覆盖借阅全生命周期：借书时检查库存和规则 → 记录借阅 → 还书时计算是否逾期及奖励/扣除积分 → 更新图书状态。

### Responsibilities
- 借书申请（检查图书状态、用户借阅数量上限、是否逾期未还）
- 还书操作（更新还书时间、计算积分、解除预约）
- 预约管理（预约已借出图书，预约到货通知）
- 借阅统计（概览数据、借阅排行）

### Boundaries
不处理积分兑换（Points subsystem），不处理图书新增/删除（Books subsystem）。

---

## File Map

| File | Role |
|---|---|
| `backend/app/controller/borrow.js` | 借阅 Controller |
| `backend/app/service/borrow.js` | 借阅 Service（未重构） |
| `backend/app/model/borrow.js` | Mongoose Borrow 模型 |
| `frontend/src/api/index.js` | borrowApi（借书/还书/预约/记录） |
| `frontend/src/pages/BorrowManage.js` | 借阅管理页面 |
| `frontend/src/pages/ApplyRule.js` | 借阅规则申请页面 |
| `frontend/src/store/index.js` | Redux `borrowSlice` |

---

## Execution Flow

### Borrow（借书）

1. `POST /api/borrow` → `BorrowController.borrow`
2. 检查图书是否可借（status === 'available'）
3. 检查用户是否已达借阅上限
4. 检查用户是否有逾期未还记录
5. 创建 Borrow 记录（status: 'borrowed'）
6. 更新 Book status → 'borrowed'
7. 通知用户（可借）

### Return（还书）

1. `POST /api/borrow/return` → `BorrowController.return`
2. 查找对应 Borrow 记录
3. 填写 `returnDate`
4. 计算是否逾期 → 逾期无积分奖励
5. 及时归还 → 奖励积分（+10）
6. 更新 Book status → 'available'
7. 若有预约用户 → 发送通知

---

## Gotchas

- 借阅规则（限借数量、借阅时长上限）暂存于 `config/default.js`，未来应入数据库。
- 逾期检测基于 `dueDate` 字段，还书时与当前时间比较。
- 积分奖励在还书时计算，不是借出时。

---

## Findings

- **[ISSUE]** Borrow Controller/Service 未完全重构，存在直连 Model 模式。
- **[ISSUE]** 预约机制实现状态未确认（应与 Topics subsystem 联动）。
- **[NOT AUDITED]** `borrow.js` Controller 实际代码未完整读取，以上为基于架构推断。