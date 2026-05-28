# 家园页面（MobileGarden）设计文档

## 1. 需求回顾

- **来源**：[2026-04-18 记忆] 用户要求将家园页面的费用公示模块取消，改为贡献榜，并按小区和楼栋进行分类展示
- **入口**：`/mobile/garden`（底部导航第二项）
- **当前状态**：路由指向 MobileProfile 占位，需新建正式页面

---

## 2. UI 布局

```
┌─────────────────────────────────────┐
│  Header：标题 + slogan              │
├─────────────────────────────────────┤
│  Tab切换：小区的楼栋列表 / 或按小区  │
├─────────────────────────────────────┤
│  贡献榜列表（每个楼栋一个区块）      │
│  ┌─────────────────────────────┐    │
│  │ 楼栋 A 栋           贡献积分 │    │
│  │ 1. 张三   ★★★     +120分   │    │
│  │ 2. 李四   ★★       +80分    │    │
│  │ 3. 王五   ★        +50分    │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ 楼栋 B 栋           贡献积分 │    │
│  │ 1. 赵六   ★★★★    +200分   │    │
│  │ ...                            │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Header 区域
- 标题：「家园」
- 副标题：AI赋能 · 区块链构建可信业主自治平台（或小区名称）

### Tab 切换
- 按「小区」/「楼栋」两种视角展示贡献榜
- 默认按楼栋展示

### 贡献榜卡片
- 每个楼栋一个卡片
- 显示楼栋名称、总积分
- 列出前3-5名住户：头像 + 姓名 + 贡献等级图标 + 积分
- 点击可展开查看完整榜单

### 贡献等级
- ★★★ 金牌贡献（≥200分）
- ★★ 银牌贡献（≥100分）
- ★ 铜牌贡献（<100分）

---

## 3. 数据结构（Mock）

```js
// contributionApi.list()
{
  code: 0,
  data: {
    buildings: [
      {
        building_id: "B1",
        building_name: "A栋",
        total_score: 1250,
        residents: [
          { rank: 1, name: "张三", avatar: "🧑", score: 320, level: "gold" },
          { rank: 2, name: "李四", avatar: "👩", score: 210, level: "gold" },
          { rank: 3, name: "王五", avatar: "🧑", score: 180, level: "silver" },
          { rank: 4, name: "赵六", avatar: "👨", score: 90,  level: "silver" },
          { rank: 5, name: "钱七", avatar: "🧑", score: 60,  level: "bronze" },
        ]
      },
      {
        building_id: "B2",
        building_name: "B栋",
        total_score: 980,
        residents: [ ... ]
      }
    ]
  }
}
```

---

## 4. 路由更新

```js
// AppMobile.js
<Route path="garden" element={<MobileGarden />} />  // 替换 MobileProfile
```

---

## 5. 文件清单

| 文件 | 说明 |
|------|------|
| `mobile/pages/MobileGarden.js` | 主页面组件 |
| `mobile/pages/MobileGarden.css` | 样式文件 |
| `mobile/pages/MobileGarden.css`（新增） | 更新 AppMobile.js 路由 |
| `common/api/contributionApi.js`（可选） | API 接口 |

---

## 6. 验收标准

- [ ] 底部导航「家园」Tab 可正常切换到本页面
- [ ] 页面显示贡献榜，按楼栋分组
- [ ] 每条记录显示：排名、姓名、贡献等级图标、积分
- [ ] Tab 切换「小区/楼栋」两种视角
- [ ] Mock 数据验证 UI 展示正确
- [ ] 提交 GitHub