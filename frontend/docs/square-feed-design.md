# Square Feed 广场瀑布流页面设计文档

## 1. 概述

- **页面名称**：MobileSquare（广场）
- **路径**：`/mobile/square`
- **功能**：展示混合内容流（文章+商品），瀑布流布局，支持无限滚动和下拉刷新
- **目标用户**：移动端用户

## 2. 技术栈

- React 18 + React Router 6
- antd-mobile 5.x
- CSS Columns 实现瀑布流

## 3. 布局规格

### 3.1 瀑布流配置
- **列数**：2 列（移动端）
- **列间距**：12px
- **卡片间距**：12px
- **底部安全区**：80px（防止内容被底部导航遮挡）

### 3.2 页面结构
```
┌────────────────────────┐
│  顶部安全区（状态栏）    │
├────────────────────────┤
│  下拉刷新触发区域       │
├────────────────────────┤
│  ┌─────┐  ┌─────┐     │
│  │Card1│  │Card2│     │
│  │     │  │     │     │
│  └─────┘  └─────┘     │
│  ┌─────┐  ┌─────┐     │
│  │Card3│  │Card4│     │
│  │     │  │     │     │
│  └─────┘  └─────┘     │
│         ...           │
│  [Loading 指示器]      │
├────────────────────────┤
│  底部安全区 80px        │
└────────────────────────┘
```

## 4. 卡片设计

### 4.1 文章卡片
```
┌────────────────────────┐
│ ┌────────────────────┐ │
│ │                    │ │
│ │   封面图 (16:9)     │ │
│ │                    │ │
│ └────────────────────┘ │
│ 标题文字（最多2行）      │
│ 摘要内容（最多2行）      │
│ ┌──┐ 作者昵称 · 时间   │
│ └──┘                   │
│ ♡ 128  💬 24  ↗ 分享   │
└────────────────────────┘
```

**字段**：
- `id`: 唯一标识
- `type`: "article"
- `cover_image`: 封面图URL
- `title`: 标题（最多2行截断）
- `summary`: 摘要（最多2行截断）
- `author.nickname`: 作者昵称
- `author.avatar`: 作者头像
- `created_at`: 相对时间（"2小时前"）
- `likes_count`: 点赞数
- `comments_count`: 评论数
- `shares_count`: 分享数
- `is_liked`: 是否已点赞（boolean）

### 4.2 商品卡片
```
┌────────────────────────┐
│ ┌────────────────────┐ │
│ │              [二手] │ │
│ │                    │ │
│ │     主图 (1:1)      │ │
│ │                    │ │
│ └────────────────────┘ │
│ 商品标题（最多2行）      │
│ ¥128  ~~¥200~~        │
│ ┌──┐ 卖家昵称          │
│ └──┘                   │
│ ♡ 收藏 45              │
└────────────────────────┘
```

**字段**：
- `id`: 唯一标识
- `type`: "product"
- `images[0]`: 主图URL
- `condition`: "二手" | "全新"
- `title`: 商品标题
- `price`: 现价（红色）
- `old_price`: 原价（灰色删除线）
- `seller.nickname`: 卖家昵称
- `seller.avatar`: 卖家头像
- `likes_count`: 收藏数
- `is_liked`: 是否已收藏

## 5. 交互设计

### 5.1 无限滚动
- **触发时机**：滚动到距离底部 200px 时
- **加载逻辑**：
  1. 检测到触底 → 显示 loading 指示器
  2. 加载下一页数据
  3. 追加到列表末尾
  4. 隐藏 loading 指示器
- **Loading 指示器**：antd-mobile `DotLoading` 居中显示

### 5.2 下拉刷新
- 使用 antd-mobile `PullToRefresh`
- 触发时：
  1. 显示加载动画
  2. 清空当前列表
  3. 重新加载第一页
  4. 完成后收起

### 5.3 乐观更新
#### 点赞/收藏
1. 用户点击 → 立即更新UI（图标变红，计数+1）
2. 发送后端请求
3. 成功 → 保持现状
4. 失败 → 回滚UI（图标恢复，计数-1），显示轻量错误提示

#### 点击卡片
- 跳转至详情页：`/mobile/square/:id`（后续实现）
- 目前 Console Log 模拟

### 5.4 骨架屏
- 初次加载或下拉刷新时显示
- 6 个占位卡片（3行 x 2列）
- 使用灰色块模拟卡片结构

## 6. Mock 数据结构

```javascript
// 文章
{
  id: 'article-1',
  type: 'article',
  cover_image: 'https://picsum.photos/400/225?random=1',
  title: '如何培养良好的阅读习惯',
  summary: '阅读是提升自我的最佳方式之一，本文分享几个实用的阅读技巧...',
  author: { nickname: '书虫小王', avatar: 'https://i.pravatar.cc/40?img=1' },
  created_at: '2小时前',
  likes_count: 128,
  comments_count: 24,
  shares_count: 12,
  is_liked: false
}

// 商品
{
  id: 'product-1',
  type: 'product',
  images: ['https://picsum.photos/400/400?random=10'],
  condition: '二手',
  title: '九成新《人类简史》',
  price: 45,
  old_price: 68,
  seller: { nickname: '爱读书的小李', avatar: 'https://i.pravatar.cc/40?img=5' },
  likes_count: 8,
  is_liked: true
}
```

## 7. 文件结构

```
src/mobile/
├── AppMobile.js                  # 路由注册（修改）
└── pages/
    ├── MobileSquare.js           # 主页面组件
    ├── MobileSquare.css          # 样式文件
    ├── SquareCard.js             # 通用卡片组件
    └── SkeletonCard.js           # 骨架屏卡片

docs/
└── square-feed-design.md         # 本文档
```

## 8. 路由配置

在 `AppMobile.js` 的 `YishiRoutes` 中：
```jsx
<Route path="square" element={<MobileSquare />} />
```

## 9. 状态管理

使用 React `useState` + `useEffect`：
- `items`: 内容列表
- `page`: 当前页码
- `loading`: 是否加载中
- `refreshing`: 是否刷新中
- `hasMore`: 是否有更多数据

## 10. 性能考虑

- 图片懒加载（原生 `loading="lazy"`）
- 节流滚动监听（100ms）
- 避免在滚动中触发状态更新