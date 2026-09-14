# 物业评价系统 - 详细设计

## 1. 概述

业主对物业进行评价，按**大项→小项**二级结构，每大项5个评分项，每小项1-5星评分。

## 2. 数据模型

### RatingCategory（评价配置）
```json
{
  "_id": "ObjectId",
  "name": "安保",        // 大项名称
  "icon": "🔒",          // emoji图标
  "color": "#2DCCB6",    // 主题色
  "order": 0,            // 排序
  "enabled": true,
  "items": [
    { "item_key": "security_patrol", "item_name": "保安巡逻频次", "order": 0 },
    { "item_key": "security_access", "item_name": "门禁管理", "order": 1 },
    { "item_key": "security_response", "item_name": "突发事件响应", "order": 2 },
    { "item_key": "security_camera", "item_name": "监控覆盖", "order": 3 },
    { "item_key": "security_parking", "item_name": "车辆管理", "order": 4 }
  ]
}
```

四大类（seed数据）：
- **安保**：保安巡逻频次、门禁管理、突发事件响应、监控覆盖、车辆管理（🔒/#2DCCB6）
- **环境**：绿化养护、垃圾分类、道路清洁、景观维护、公共区域卫生（🌿/#1A7F6F）
- **保洁**：楼道清洁、电梯清洁、垃圾清运、公共设施消毒、地下室清洁（🧹/#F4A261）
- **服务**：前台服务态度、报修响应速度、投诉处理效率、公告通知透明度、费用公示（👔/#8B5CF6）

### RatingResult（评价结果）
```json
{
  "_id": "ObjectId",
  "community_id": "ObjectId",
  "user_id": "ObjectId",
  "year": 2026,
  "ratings": [
    { "category_name": "安保", "item_key": "security_patrol", "item_name": "保安巡逻频次", "score": 4 },
    ...
  ],
  "submitted_at": "Date"
}
```

## 3. 接口设计

### 管理端 API
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/admin/rating-categories | 评价配置列表 |
| POST | /api/admin/rating-categories | 创建评价大项 |
| PUT | /api/admin/rating-categories/:id | 更新评价大项 |
| DELETE | /api/admin/rating-categories/:id | 删除评价大项 |
| POST | /api/admin/rating-categories/:id/items | 新增评分小项 |
| PUT | /api/admin/rating-categories/:id/items/:itemKey | 更新评分小项 |
| DELETE | /api/admin/rating-categories/:id/items/:itemKey | 删除评分小项 |

### 用户端 API
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/rating-categories | 获取评价配置（含小项） |
| POST | /api/rating-results | 提交评价 |
| GET | /api/rating-results/check | 检查本年度是否已评价 |

## 4. 页面

### 移动端 - 物业评价详情页 MobileRateRating
路径：`/mobile/rate`
- 顶部：年度 + 已评/未评状态
- 四大分类卡片（可折叠），每类展示5个小项
- 每个小项：名称 + 1-5星评分
- 底部提交按钮

### 管理后台 - 评价配置页
- 左侧菜单新增"评价配置"
- 四大分类的增删改查
- 每个分类下小项的增删改
