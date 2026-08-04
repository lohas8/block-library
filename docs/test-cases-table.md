# Block-Library 测试用例表

## 使用说明
| 字段 | 说明 |
|------|------|
| 特征编号 | 模块-功能-序号 格式，如 U-001 表示 User 模块第1个测试点 |
| Level | P0=核心功能 P1=重要功能 P2=一般功能 |
| 测试点 | 测试的具体功能点 |
| 测试步骤 | 简化的测试步骤描述 |
| 预期结果 | 期望的返回/行为 |
| 是否通过 | 待执行后填写 |
| 通过截图 | 执行后截图路径 |
| 责任人 | 测试执行人 |
| 测试时间 | 执行日期 |
| 备注 | 补充说明 |

---

## 一、用户模块 (User Module) 特征前缀：U

| 特征编号 | Level | 测试点 | 测试步骤 | 预期结果 | 是否通过 | 通过截图 | 责任人 | 测试时间 | 备注 |
|----------|-------|--------|----------|----------|----------|----------|--------|----------|------|
| U-001 | P0 | 用户注册-成功 | POST /api/users/register，提交完整用户信息 | 返回201，body含token和user.id | | | | | |
| U-002 | P0 | 用户注册-用户名重复 | POST /api/users/register，使用已存在用户名 | 返回400，message含"用户名已存在" | | | | | |
| U-003 | P1 | 用户注册-缺少必填字段 | POST /api/users/register，只提交username | 返回400 | | | | | |
| U-004 | P0 | 用户登录-成功 | POST /api/users/login，提交正确账密 | 返回200，body含token | | | | | |
| U-005 | P0 | 用户登录-密码错误 | POST /api/users/login，密码错误 | 返回401 | | | | | |
| U-006 | P0 | 用户登录-用户不存在 | POST /api/users/login，用户名不存在 | 返回404 | | | | | |
| U-007 | P1 | 用户列表-管理员权限 | GET /api/users，带有效admin token | 返回200，body.list为数组 | | | | | |
| U-008 | P0 | 用户列表-未授权 | GET /api/users，不带token | 返回401 | | | | | |
| U-009 | P1 | 用户详情-成功 | GET /api/users/:id，带有效token | 返回200，含username | | | | | |
| U-010 | P1 | 用户详情-不存在 | GET /api/users/99999，带有效token | 返回404 | | | | | |
| U-011 | P1 | 更新用户-成功 | PUT /api/users/:id，带有效token和新name | 返回200，name已更新 | | | | | |
| U-012 | P1 | 更新用户-无权限 | PUT /api/users/99998，带有效token | 返回403 | | | | | |
| U-013 | P0 | 更新积分-成功增加 | POST /api/users/:id/points，type=add | 返回200，points>=10 | | | | | |
| U-014 | P1 | 更新积分-积分不足 | POST /api/users/:id/points，type=deduct，points=-99999 | 返回400 | | | | | |
| U-015 | P1 | 借阅历史-成功 | GET /api/users/:id/borrow-history | 返回200，body为数组 | | | | | |
| U-016 | P1 | 借阅历史-分页 | GET /api/users/:id/borrow-history?page=1&pageSize=10 | 返回200，body.pagination存在 | | | | | |

## 二、图书模块 (Book Module) 特征前缀：B

| 特征编号 | Level | 测试点 | 测试步骤 | 预期结果 | 是否通过 | 通过截图 | 责任人 | 测试时间 | 备注 |
|----------|-------|--------|----------|----------|----------|----------|--------|----------|------|
| B-001 | P0 | 图书列表-成功 | GET /api/books | 返回200，body.list为数组 | | | | | |
| B-002 | P0 | 图书列表-分页 | GET /api/books?page=1&pageSize=10 | 返回200，body.pagination存在 | | | | | |
| B-003 | P1 | 图书列表-搜索 | GET /api/books?keyword=python | 返回200，list含搜索结果 | | | | | |
| B-004 | P1 | 图书分类-成功 | GET /api/books/categories | 返回200，body为数组 | | | | | |
| B-005 | P0 | 图书详情-成功 | GET /api/books/1 | 返回200，含id | | | | | |
| B-006 | P0 | 图书详情-不存在 | GET /api/books/99999 | 返回404，含message | | | | | |
| B-007 | P0 | 创建图书-成功 | POST /api/books，提交完整图书信息 | 返回201，body含id | | | | | |
| B-008 | P0 | 创建图书-缺少必填字段 | POST /api/books，只提交title | 返回400，含message | | | | | |
| B-009 | P1 | 创建图书-重复ISBN | POST /api/books，使用已存在ISBN | 返回400 | | | | | |
| B-010 | P1 | 更新图书-成功 | PUT /api/books/:id，提交新title | 返回200，title已更新 | | | | | |
| B-011 | P1 | 更新图书-不存在 | PUT /api/books/99999 | 返回404 | | | | | |
| B-012 | P1 | 删除图书-成功 | DELETE /api/books/:id | 返回200 | | | | | |
| B-013 | P1 | 删除图书-不存在 | DELETE /api/books/99999 | 返回404 | | | | | |
| B-014 | P2 | 导入图书-成功 | POST /api/books/import，attach Excel文件 | 返回200，body.success | | | | | |
| B-015 | P2 | 导入图书-无文件 | POST /api/books/import，不附文件 | 返回400 | | | | | |
| B-016 | P2 | 导出图书-成功 | GET /api/books/export | 返回200，content-type含vnd.openxmlformats | | | | | |

## 三、借阅模块 (Borrow Module) 特征前缀：BR

| 特征编号 | Level | 测试点 | 测试步骤 | 预期结果 | 是否通过 | 通过截图 | 责任人 | 测试时间 | 备注 |
|----------|-------|--------|----------|----------|----------|----------|--------|----------|------|
| BR-001 | P0 | 借书-成功 | POST /api/borrow，带token和bookId | 返回201，body含id | | | | | |
| BR-002 | P0 | 借书-库存不足 | POST /api/borrow，bookId库存为0 | 返回400，message含"库存不足" | | | | | |
| BR-003 | P0 | 借书-超上限 | POST /api/borrow，用户已达借阅上限 | 返回400，message含"借阅数量已达上限" | | | | | |
| BR-004 | P0 | 借书-未授权 | POST /api/borrow，不带token | 返回401 | | | | | |
| BR-005 | P0 | 还书-成功 | POST /api/borrow/return/:id，带token | 返回200，status='returned' | | | | | |
| BR-006 | P0 | 还书-记录不存在 | POST /api/borrow/return/99999 | 返回404 | | | | | |
| BR-007 | P1 | 还书-重复还书 | POST /api/borrow/return/:id，再次还同一本书 | 返回400 | | | | | |
| BR-008 | P1 | 借阅列表-成功 | GET /api/borrow，带token | 返回200，list为数组 | | | | | |
| BR-009 | P1 | 借阅列表-状态筛选 | GET /api/borrow?status=borrowing | 返回200，list每项status='borrowing' | | | | | |
| BR-010 | P1 | 借阅列表-用户筛选 | GET /api/borrow?userId=1 | 返回200，含该用户借阅记录 | | | | | |
| BR-011 | P1 | 借阅列表-分页 | GET /api/borrow?page=1&pageSize=5 | 返回200，pagination.pageSize=5 | | | | | |
| BR-012 | P1 | 预约图书-成功 | POST /api/reserve，带token和bookId | 返回201，body含id | | | | | |
| BR-013 | P1 | 预约图书-已预约 | POST /api/reserve，再次预约同一本 | 返回400 | | | | | |
| BR-014 | P2 | 预约图书-可借不允许 | POST /api/reserve，预约有库存的书 | 返回400或相应提示 | | | | | |
| BR-015 | P2 | 取消预约-成功 | POST /api/reserve/cancel/:id | 返回200，status='cancelled' | | | | | |
| BR-016 | P2 | 取消预约-不存在 | POST /api/reserve/cancel/99999 | 返回404 | | | | | |
| BR-017 | P2 | 预约列表-成功 | GET /api/reserve，带token | 返回200，list为数组 | | | | | |
| BR-018 | P2 | 预约列表-状态筛选 | GET /api/reserve?status=active | 返回200，list每项status='active' | | | | | |
| BR-019 | P1 | 统计数据-成功 | GET /api/statistics，带token | 返回200，含totalBooks/borrowing/returned | | | | | |
| BR-020 | P1 | 统计数据-日期范围 | GET /api/statistics?startDate=2024-01-01&endDate=2024-12-31 | 返回200，含日期范围内数据 | | | | | |
| BR-021 | P1 | 统计数据-未授权 | GET /api/statistics，不带token | 返回401 | | | | | |

## 四、积分模块 (Points Module) 特征前缀：P

| 特征编号 | Level | 测试点 | 测试步骤 | 预期结果 | 是否通过 | 通过截图 | 责任人 | 测试时间 | 备注 |
|----------|-------|--------|----------|----------|----------|----------|--------|----------|------|
| P-001 | P0 | 商品列表-成功 | GET /api/points/items | 返回200，list为数组 | | | | | |
| P-002 | P0 | 商品列表-含状态 | GET /api/points/items | 返回200，每项含status字段 | | | | | |
| P-003 | P1 | 商品列表-分类筛选 | GET /api/points/items?category=图书 | 返回200，含该分类商品 | | | | | |
| P-004 | P1 | 商品列表-分页 | GET /api/points/items?page=1&pageSize=10 | 返回200，pagination存在 | | | | | |
| P-005 | P0 | 创建商品-管理员成功 | POST /api/points/items，admin token | 返回201，body含id | | | | | |
| P-006 | P0 | 创建商品-普通用户拒绝 | POST /api/points/items，普通用户token | 返回403 | | | | | |
| P-007 | P1 | 创建商品-缺少必填字段 | POST /api/points/items，只有name | 返回400 | | | | | |
| P-008 | P1 | 创建商品-积分为负 | POST /api/points/items，points=-100 | 返回400 | | | | | |
| P-009 | P1 | 更新商品-成功 | PUT /api/points/items/:id，admin token | 返回200，字段已更新 | | | | | |
| P-010 | P1 | 更新商品-不存在 | PUT /api/points/items/99999 | 返回404 | | | | | |
| P-011 | P1 | 更新商品-普通用户拒绝 | PUT /api/points/items/:id，普通用户token | 返回403 | | | | | |
| P-012 | P1 | 删除商品-成功 | DELETE /api/points/items/:id，admin token | 返回200 | | | | | |
| P-013 | P1 | 删除商品-不存在 | DELETE /api/points/items/99999 | 返回404 | | | | | |
| P-014 | P1 | 删除商品-普通用户拒绝 | DELETE /api/points/items/:id，普通用户token | 返回403 | | | | | |
| P-015 | P0 | 积分兑换-成功 | POST /api/points/exchange，token+itemId+quantity=1 | 返回201，body含id | | | | | |
| P-016 | P0 | 积分兑换-积分不足 | POST /api/points/exchange，quantity=9999 | 返回400，message含"积分不足" | | | | | |
| P-017 | P0 | 积分兑换-库存不足 | POST /api/points/exchange，item stock=0 | 返回400，message含"库存不足" | | | | | |
| P-018 | P1 | 积分兑换-商品不存在 | POST /api/points/exchange，itemId=99999 | 返回404 | | | | | |
| P-019 | P0 | 积分兑换-未授权 | POST /api/points/exchange，不带token | 返回401 | | | | | |
| P-020 | P1 | 积分兑换-数量为负 | POST /api/points/exchange，quantity=-1 | 返回400 | | | | | |
| P-021 | P1 | 积分兑换-数量为0 | POST /api/points/exchange，quantity=0 | 返回400 | | | | | |

## 五、投票模块 (Vote Module) 特征前缀：V

| 特征编号 | Level | 测试点 | 测试步骤 | 预期结果 | 是否通过 | 通过截图 | 责任人 | 测试时间 | 备注 |
|----------|-------|--------|----------|----------|----------|----------|--------|----------|------|
| V-001 | P0 | 创建投票-二选一成功 | POST /api/votes，admin token，vote_type=binary | 返回200，body含_id，items.length=2 | | | | | |
| V-002 | P0 | 创建投票-普通用户拒绝 | POST /api/votes，普通用户token | 返回403，code=403 | | | | | |
| V-003 | P1 | 创建投票-缺少必填字段 | POST /api/votes，admin token，只有title | 返回400 | | | | | |
| V-004 | P0 | 投票列表-成功 | GET /api/votes | 返回200，body含list和total | | | | | |
| V-005 | P0 | 投票列表-状态筛选 | GET /api/votes?status=active | 返回200，list为active投票 | | | | | |
| V-006 | P1 | 投票详情-成功 | GET /api/votes/:id | 返回200，含title/items/vote_count | | | | | |
| V-007 | P1 | 投票详情-不存在 | GET /api/votes/000000000000000000000000 | 返回404 | | | | | |
| V-008 | P0 | 投票-成功 | POST /api/votes/:id/cast，业主token | 返回200，success=true | | | | | |
| V-009 | P0 | 投票-未登录 | POST /api/votes/:id/cast，不带token | 返回401 | | | | | |
| V-010 | P0 | 投票-重复投票 | POST /api/votes/:id/cast，同一用户再次投票 | 返回400，message含"已投过" | | | | | |
| V-011 | P1 | 结束投票-管理员成功 | POST /api/votes/:id/close，admin token | 返回200，message含"结束" | | | | | |
| V-012 | P1 | 结束投票-普通用户拒绝 | POST /api/votes/:id/close，普通用户token | 返回403 | | | | | |
| V-013 | P2 | 多选投票-成功 | POST /api/votes，admin token，vote_type=multi | 返回200，vote_type='multi'，items.length>=2 | | | | | |

## 六、物业评价模块 (Property Rating Module) 特征前缀：PR

| 特征编号 | Level | 测试点 | 测试步骤 | 预期结果 | 是否通过 | 通过截图 | 责任人 | 测试时间 | 备注 |
|----------|-------|--------|----------|----------|----------|----------|--------|----------|------|
| PR-001 | P0 | 创建评价大项-成功 | POST /api/rating-categories，admin token，含items数组 | 返回200，body含_id，items.length=3 | | | | | |
| PR-002 | P0 | 创建评价大项-普通用户拒绝 | POST /api/rating-categories，普通用户token | 返回403 | | | | | |
| PR-003 | P1 | 创建评价大项-缺少必填字段 | POST /api/rating-categories，admin token，只有name | 返回400 | | | | | |
| PR-004 | P1 | 评价配置列表-成功 | GET /api/rating-categories | 返回200，body为数组，含name/items | | | | | |
| PR-005 | P1 | 评价配置列表-小区筛选 | GET /api/rating-categories?community_id=xxx | 返回200，筛选该小区配置 | | | | | |
| PR-006 | P1 | 更新配置-更新大项名称 | PUT /api/rating-categories/:id，admin token | 返回200，name已更新 | | | | | |
| PR-007 | P2 | 更新配置-新增小项 | PUT /api/rating-categories/:id，admin token，含新items | 返回200，items.length增加 | | | | | |
| PR-008 | P1 | 删除配置-成功 | DELETE /api/rating-categories/:id，admin token | 返回200，message含"删除成功" | | | | | |
| PR-009 | P1 | 删除配置-普通用户拒绝 | DELETE /api/rating-categories/:id，普通用户token | 返回403 | | | | | |
| PR-010 | P0 | 提交评价-成功 | POST /api/property-ratings，业主token，提交scores | 返回200，body含_id | | | | | |
| PR-011 | P0 | 提交评价-重复提交 | POST /api/property-ratings，同一年度再次提交 | 返回400，message含"已提交过" | | | | | |
| PR-012 | P0 | 提交评价-未登录 | POST /api/property-ratings，不带token | 返回401 | | | | | |
| PR-013 | P1 | 检查提交状态-未提交 | GET /api/property-ratings/check?community_id=xxx&year=2026 | 返回200，has_submitted=false | | | | | |
| PR-014 | P1 | 检查提交状态-已提交 | GET /api/property-ratings/check，提交后检查 | 返回200，has_submitted=true | | | | | |
| PR-015 | P1 | 评分统计-成功 | GET /api/property-ratings/stats?community_id=xxx&year=2026 | 返回200，含year/total_raters/items | | | | | |
| PR-016 | P1 | 评分统计-年份筛选 | GET /api/property-ratings/stats?year=2025 | 返回200，year=2025 | | | | | |
| PR-017 | P1 | 评分统计-平均分格式 | GET /api/property-ratings/stats，返回的avg | avg保留1位小数，格式如4.5 | | | | | |
| PR-018 | P2 | 边界-评分超出范围 | POST /api/property-ratings，scores某项=99 | 返回400或无效值被过滤 | | | | | |

## 七、通知模块 (Notification Module) 特征前缀：N

| 特征编号 | Level | 测试点 | 测试步骤 | 预期结果 | 是否通过 | 通过截图 | 责任人 | 测试时间 | 备注 |
|----------|-------|--------|----------|----------|----------|----------|--------|----------|------|
| N-001 | P0 | 通知列表-成功 | GET /api/notifications，带token | 返回200，list为数组 | | | | | |
| N-002 | P0 | 通知列表-未授权 | GET /api/notifications，不带token | 返回401 | | | | | |
| N-003 | P1 | 通知列表-已读/未读筛选 | GET /api/notifications?read=false | 返回200，list每项read=false | | | | | |
| N-004 | P1 | 通知列表-分页 | GET /api/notifications?page=1&pageSize=10 | 返回200，pagination存在 | | | | | |
| N-005 | P1 | 通知列表-含未读数量 | GET /api/notifications | 返回200，body含unreadCount | | | | | |
| N-006 | P1 | 标记已读-成功 | POST /api/notifications/:id/read | 返回200，read=true | | | | | |
| N-007 | P1 | 标记已读-不存在 | POST /api/notifications/99999/read | 返回404 | | | | | |
| N-008 | P1 | 全部标记已读-成功 | POST /api/notifications/read-all | 返回200，success=true | | | | | |
| N-009 | P1 | 全部标记已读-返回数量 | POST /api/notifications/read-all | 返回200，body含count | | | | | |
| N-010 | P1 | 删除通知-成功 | DELETE /api/notifications/:id，带token | 返回200 | | | | | |
| N-011 | P1 | 删除通知-不存在 | DELETE /api/notifications/99999 | 返回404 | | | | | |
| N-012 | P1 | 删除通知-无权限 | DELETE /api/notifications/1，invalid token | 返回401/403 | | | | | |
| N-013 | P1 | 创建通知-成功 | POST /api/notifications，带token和完整信息 | 返回201，body含id | | | | | |
| N-014 | P1 | 创建通知-缺少必填字段 | POST /api/notifications，只有title | 返回400 | | | | | |
| N-015 | P1 | 创建通知-无权限 | POST /api/notifications，不带token | 返回401/403 | | | | | |
| N-016 | P2 | 创建通知-指定类型 | POST /api/notifications，type=borrow_reminder | 返回201，body.type='borrow_reminder' | | | | | |

## 八、移动端-家园页面 (MobileGarden) 特征前缀：MG

| 特征编号 | Level | 测试点 | 测试步骤 | 预期结果 | 是否通过 | 通过截图 | 责任人 | 测试时间 | 备注 |
|----------|-------|--------|----------|----------|----------|--------|----------|----------|------|
| MG-001 | P0 | 页面Header渲染 | render(<MobileGarden />) | 页面含"🏠 家园"和副标题 | | | | | |
| MG-002 | P0 | Tab切换渲染 | render(<MobileGarden />) | 页面含"按楼栋"和"小区总榜" | | | | | |
| MG-003 | P0 | 默认显示楼栋视角 | render(<MobileGarden />) | 页面含"A栋" | | | | | |
| MG-004 | P0 | Mock数据渲染楼栋列表 | render(<MobileGarden />) | 页面含"B栋"和"C栋" | | | | | |
| MG-005 | P0 | 楼栋总积分显示 | render(<MobileGarden />) | 页面含"🏆 总积分 1250"等 | | | | | |
| MG-006 | P1 | Top3贡献者显示 | render(<MobileGarden />) | 页面含"张三""李四""王五" | | | | | |
| MG-007 | P1 | 贡献积分显示 | render(<MobileGarden />) | 页面含"+320分"等 | | | | | |
| MG-008 | P1 | 贡献等级星级显示 | render(<MobileGarden />) | 页面含"★★★"和"★★" | | | | | |
| MG-009 | P1 | 排名徽章显示 | render(<MobileGarden />) | 页面含.rank-badge元素 | | | | | |
| MG-010 | P0 | Tab切换-小区总榜 | fireEvent.click("小区总榜") | 页面显示"绿城花园" | | | | | |
| MG-011 | P0 | 小区总榜-社区总积分 | fireEvent.click("小区总榜") | 页面含"🏆 社区总贡献积分" | | | | | |
| MG-012 | P0 | 小区总榜-Top10住户 | fireEvent.click("小区总榜") | 页面含"陈十四""张三"等 | | | | | |
| MG-013 | P1 | Tab切回楼栋视角 | fireEvent.click("按楼栋") | 页面显示"A栋"，不含"绿城花园" | | | | | |
| MG-014 | P1 | 楼栋展开 | fireEvent.click(buildingHeader) | 页面显示"赵六" | | | | | |
| MG-015 | P1 | 楼栋折叠 | fireEvent.click(buildingHeader)两次 | 页面不显示"赵六" | | | | | |
| MG-016 | P2 | 空数据不崩溃 | render with empty data | 页面不崩溃，含garden-page根元素 | | | | | |
| MG-017 | P2 | 楼栋渲染数量 | render(<MobileGarden />) | building-card数量=3 | | | | | |
| MG-018 | P1 | 小区Banner渲染 | fireEvent.click("小区总榜") | 页面含.community-banner | | | | | |
| MG-019 | P1 | 排名列表渲染 | fireEvent.click("小区总榜") | 页面含.rank-list | | | | | |
| MG-020 | P1 | 排名列表记录数 | fireEvent.click("小区总榜") | resident-row数量=10 | | | | | |

---

## 测试用例汇总统计

| 模块 | P0用例数 | P1用例数 | P2用例数 | 合计 |
|------|---------|---------|---------|------|
| 用户模块 (U) | 5 | 9 | 2 | 16 |
| 图书模块 (B) | 4 | 7 | 5 | 16 |
| 借阅模块 (BR) | 7 | 10 | 4 | 21 |
| 积分模块 (P) | 5 | 10 | 6 | 21 |
| 投票模块 (V) | 5 | 6 | 2 | 13 |
| 物业评价 (PR) | 3 | 12 | 3 | 18 |
| 通知模块 (N) | 2 | 13 | 1 | 16 |
| 移动端 (MG) | 6 | 10 | 4 | 20 |
| **合计** | **37** | **77** | **27** | **141** |

## 优先级分布
- **P0（核心功能）**: 37用例 - 必须全部通过
- **P1（重要功能）**: 77用例 - 正式发布前必须通过
- **P2（一般功能）**: 27用例 - 可在后续迭代中修复
