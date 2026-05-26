const http = require('http');

const PORT = 7002;
const MOCK_TOKEN = 'mock-admin-token-2026';

const MOCK_ADMIN = {
  _id: 'admin001',
  username: 'admin',
  name: '系统管理员',
  role: 'admin',
  points: 888,
  phone: '13800138000',
  email: 'admin@community.library',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const MOCK_SUPER_ADMIN = {
  _id: 'su001',
  username: 'superadmin',
  name: '超级管理员',
  role: 'super_admin',
  points: 9999,
  phone: '13900000000',
  email: 'superadmin@community.library',
  createdAt: '2026-01-01T00:00:00.000Z',
};

let mockBooks = [
  { _id: 'b1', title: '活着', author: '余华', category: '文学', status: 'available', cover: '', owner: 'admin001', location: 'A-1-01', description: '经典文学', createdAt: '2026-01-10' },
  { _id: 'b2', title: '三体', author: '刘慈欣', category: '科幻', status: 'borrowed', borrower: 'u2', borrowDate: '2026-04-01', dueDate: '2026-05-01', cover: '', owner: 'admin001', location: 'B-2-03', description: '科幻巨著', createdAt: '2026-01-15' },
  { _id: 'b3', title: 'Python编程', author: 'Mark Lutz', category: '技术', status: 'available', cover: '', owner: 'admin001', location: 'C-1-05', description: 'Python入门经典', createdAt: '2026-02-01' },
  { _id: 'b4', title: '红楼梦', author: '曹雪芹', category: '文学', status: 'available', cover: '', owner: 'admin001', location: 'A-2-01', description: '中国古典四大名著', createdAt: '2026-02-10' },
  { _id: 'b5', title: '宇宙简史', author: '霍金', category: '科普', status: 'borrowed', borrower: 'u3', borrowDate: '2026-04-15', dueDate: '2026-05-15', cover: '', owner: 'admin001', location: 'D-1-02', description: '霍金遗作', createdAt: '2026-03-01' },
  { _id: 'b6', title: '设计心理学', author: 'Don Norman', category: '技术', status: 'available', cover: '', owner: 'admin001', location: 'C-2-01', description: '产品设计必读', createdAt: '2026-03-15' },
  { _id: 'b7', title: '百年孤独', author: '马尔克斯', category: '文学', status: 'available', cover: '', owner: 'admin001', location: 'A-3-02', description: '拉美文学经典', createdAt: '2026-04-01' },
  { _id: 'b8', title: '时间简史', author: '霍金', category: '科普', status: 'available', cover: '', owner: 'admin001', location: 'D-1-01', description: '霍金科普代表作', createdAt: '2026-04-10' },
];

let mockUsers = [
  { _id: 'admin001', username: 'admin', name: '系统管理员', role: 'admin', points: 888, phone: '13800138000', inviterId: null, communityId: 'c1', createdAt: '2026-01-01' },
  { _id: 'u2', username: 'zhangsan', name: '张三', role: 'user', points: 520, phone: '13900139001', inviterId: 'admin001', communityId: 'c1', createdAt: '2026-02-01' },
  { _id: 'u3', username: 'lisi', name: '李四', role: 'user', points: 320, phone: '13900139002', inviterId: null, communityId: 'c1', createdAt: '2026-02-15' },
  { _id: 'u4', username: 'wangwu', name: '王五', role: 'user', points: 150, phone: '13900139003', inviterId: 'u2', communityId: 'c1', createdAt: '2026-03-01' },
  { _id: 'u5', username: 'zhaoliu', name: '赵六', role: 'user', points: 80, phone: '13900139004', inviterId: null, communityId: 'c1', createdAt: '2026-03-10' },
  // 张三邀请的5人
  { _id: 'u6', username: 'sunqi', name: '孙七', role: 'user', points: 200, phone: '13900139006', inviterId: 'u2', communityId: 'c1', createdAt: '2026-03-15' },
  { _id: 'u7', username: 'zhouba', name: '周八', role: 'user', points: 180, phone: '13900139007', inviterId: 'u2', communityId: 'c1', createdAt: '2026-03-20' },
  { _id: 'u8', username: 'wuliu', name: '吴九', role: 'user', points: 160, phone: '13900139008', inviterId: 'u2', communityId: 'c1', createdAt: '2026-03-25' },
  { _id: 'u9', username: 'zhengshi', name: '郑十', role: 'user', points: 140, phone: '13900139009', inviterId: 'u2', communityId: 'c1', createdAt: '2026-04-01' },
  { _id: 'u10', username: 'chen11', name: '陈十一', role: 'user', points: 120, phone: '13900139010', inviterId: null, communityId: null, createdAt: '2026-04-05' },
];

let mockBorrowRecords = [
  { _id: 'br1', bookId: 'b2', bookTitle: '三体', userId: 'u2', userName: '张三', borrowDate: '2026-04-01', dueDate: '2026-05-01', status: 'borrowed', returnedDate: null },
  { _id: 'br2', bookId: 'b5', bookTitle: '宇宙简史', userId: 'u3', userName: '李四', borrowDate: '2026-04-15', dueDate: '2026-05-15', status: 'borrowed', returnedDate: null },
  { _id: 'br3', bookId: 'b1', bookTitle: '活着', userId: 'u4', userName: '王五', borrowDate: '2026-03-20', dueDate: '2026-04-20', status: 'returned', returnedDate: '2026-04-18' },
  { _id: 'br4', bookId: 'b3', bookTitle: 'Python编程', userId: 'u5', userName: '赵六', borrowDate: '2026-03-01', dueDate: '2026-03-31', status: 'returned', returnedDate: '2026-03-28' },
  { _id: 'br5', bookId: 'b4', bookTitle: '红楼梦', userId: 'u2', userName: '张三', borrowDate: '2026-02-01', dueDate: '2026-03-01', status: 'returned', returnedDate: '2026-02-28' },
];

const mockPointsItems = [
  { _id: 'p1', name: '借书优惠券', points: 50, stock: 100, description: '免运费一次', image: '', createdAt: '2026-01-01' },
  { _id: 'p2', name: '限量马克杯', points: 200, stock: 20, description: '小区定制马克杯', image: '', createdAt: '2026-01-15' },
  { _id: 'p3', name: '免排队优先券', points: 100, stock: 50, description: '可预约时段优先权', image: '', createdAt: '2026-02-01' },
];

let mockNotifications = [
  { _id: 'n1', title: '新书入库通知', content: '《三体》已入库，欢迎借阅！', read: false, createdAt: '2026-05-15T08:00:00.000Z' },
  { _id: 'n2', title: '借阅超时提醒', content: '张三借阅的《活着》已超时，请尽快归还', read: false, createdAt: '2026-05-14T10:00:00.000Z' },
  { _id: 'n3', title: '社区活动通知', content: '本周六在社区中心有读书会，欢迎参加！', read: true, createdAt: '2026-05-10T09:00:00.000Z' },
];

// ===== 小区管理数据 =====
let mockCommunities = [
  { _id: 'c1', name: '阳光花园小区', address: '北京市朝阳区阳光路88号', adminName: '李明', status: 'active', createdAt: '2026-01-15' },
  { _id: 'c2', name: '绿城业主社区', address: '上海市浦东新区绿城大道1号', adminName: '王芳', status: 'active', createdAt: '2026-02-20' },
  { _id: 'c3', name: '碧水蓝天苑', address: '广州市天河区碧水道99号', adminName: '张伟', status: 'active', createdAt: '2026-03-10' },
  { _id: 'c4', name: '锦绣星河小区', address: '深圳市南山区星河路66号', adminName: '', status: 'inactive', createdAt: '2026-04-05' },
];

// ===== 规则管理数据 =====
let mockRules = [
  { _id: 'r1', name: '主动清理楼道垃圾', content: '主动清理楼道公共区域垃圾，保持环境整洁', type: 'reward', points: 5, communityId: 'c1', createdAt: '2026-02-01' },
  { _id: 'r2', name: '参加社区读书会', content: '参加小区组织的读书分享活动', type: 'reward', points: 10, communityId: 'c1', createdAt: '2026-02-05' },
  { _id: 'r3', name: '举报违停车辆', content: '发现并举报占用消防通道的违停车辆', type: 'reward', points: 3, communityId: 'c1', createdAt: '2026-02-10' },
  { _id: 'r4', name: '损坏公共设施', content: '故意损坏小区公共设施（如电梯、门禁等）', type: 'penalty', points: -20, communityId: 'c1', createdAt: '2026-02-15' },
  { _id: 'r5', name: '夜间噪音扰民', content: '在晚上22:00后制造噪音影响邻居休息', type: 'penalty', points: -10, communityId: 'c1', createdAt: '2026-02-20' },
];

let mockRuleApprovals = [];

// ===== 工具共享数据 =====
let mockTools = [
  { _id: 't1', name: '电钻', category: '电动工具', image: 'https://img.icons8.com/?size=200&id=dDlNCCvBxNOr&format=png', depositPoints: 50, rentPointsPerDay: 10, owner: 'admin001', ownerName: '系统管理员', status: 'available', description: '博世电钻，含多型号钻头', createdAt: '2026-04-01' },
  { _id: 't2', name: '落地扇', category: '家电', image: 'https://img.icons8.com/?size=200&id=Q2q3yB9k3tK4&format=png', depositPoints: 30, rentPointsPerDay: 5, owner: 'u2', ownerName: '张三', status: 'borrowed', borrower: 'u3', borrowerName: '李四', borrowDate: '2026-05-10', dueDate: '2026-05-20', description: '美的落地扇，三档调速', createdAt: '2026-04-15' },
  { _id: 't3', name: '帐篷', category: '户外', image: 'https://img.icons8.com/?size=200&id=7Jq7Rk2e5l9a&format=png', depositPoints: 80, rentPointsPerDay: 15, owner: 'u3', ownerName: '李四', status: 'available', description: '户外露营帐篷，适合4人', createdAt: '2026-04-20' },
  { _id: 't4', name: '投影仪', category: '家电', image: 'https://img.icons8.com/?size=200&id=KPx2q2q2q2q2&format=png', depositPoints: 100, rentPointsPerDay: 20, owner: 'admin001', ownerName: '系统管理员', status: 'available', description: '坚果投影仪，1080P，支持HDMI', createdAt: '2026-05-01' },
  { _id: 't5', name: '自行车', category: '交通工具', image: 'https://img.icons8.com/?size=200&id=bicycle_icon&format=png', depositPoints: 60, rentPointsPerDay: 8, owner: 'u4', ownerName: '王五', status: 'available', description: '捷安特山地车，24速', createdAt: '2026-05-05' },
];

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch (e) { resolve({}); }
    });
    req.on('error', reject);
  });
}

function matchPath(method, url, patterns) {
  for (const { pattern, handler } of patterns) {
    const match = url.match(pattern);
    if (match && match[0] === url) {
      return { handler, params: match.slice(1) };
    }
  }
  return null;
}



let mockTopics = [
  {
    _id: 'topic1', title: '关于东门垃圾分类点位调整的建议',
    content: '目前东门分类点位设置在主通道旁，早高峰时段容易造成拥堵，建议迁移至小区花园旁空闲区域。',
    status: 'pending', is_focused: false, focused_at: null,
    follow_count: 3, comment_count: 2, hot_score: 2.1,
    last_activity_at: '2026-05-26T08:00:00.000Z',
    author_id: 'admin001', author_name: '系统管理员',
    community_id: 'c1', tags: ['环保', '物业'], images: [],
    created_at: '2026-05-26T06:00:00.000Z', updated_at: '2026-05-26T06:00:00.000Z',
  },
];
let mockComments = [
  { _id: 'c1', topic_id: 'topic1', content: '支持这个建议！确实每天早上都很堵。',
    author_id: 'u2', author_name: '张三', is_deleted: false,
    created_at: '2026-05-26T06:30:00.000Z', updated_at: '2026-05-26T06:30:00.000Z' },
  { _id: 'c2', topic_id: 'topic1', content: '建议物业实地考察后给出具体方案。',
    author_id: 'u3', author_name: '李四', is_deleted: false,
    created_at: '2026-05-26T07:00:00.000Z', updated_at: '2026-05-26T07:00:00.000Z' },
];

let mockTopicFollows = [];

function calcHotScore(fc, cc, createdAt) {
  const hours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 3600);
  return Math.round((fc * 0.6 + cc * 0.4) * Math.exp(-0.15 * hours) * 100) / 100;
}

function findTopic(id) { return mockTopics.find(t => t._id === id); }
function findComment(cid) { return mockComments.find(c => c._id === cid && !c.is_deleted); }


const routes = [
  // 用户登录
  { method: 'POST', pattern: /^\/api\/users\/login$/, handler: async (req, res) => {
    const body = await parseBody(req);
    // 超级管理员特殊处理（不在 mockUsers 里）
    if (body.username === 'superadmin' && body.password === 'admin123') {
      sendJSON(res, 200, { token: 'mock-super-token', ...MOCK_SUPER_ADMIN });
    } else if (body.username === 'admin' && body.password === 'admin123') {
      sendJSON(res, 200, { token: MOCK_TOKEN, ...MOCK_ADMIN });
    } else {
      const user = mockUsers.find(u => u.username === body.username);
      if (!user) { sendJSON(res, 401, { msg: '用户不存在' }); return; }
      sendJSON(res, 200, { token: 'mock-token-' + user._id, ...user });
    }
  }},
  // 用户注册
  { method: 'POST', pattern: /^\/api\/users\/register$/, handler: async (req, res) => {
    sendJSON(res, 200, { msg: '注册成功' });
  }},
  // 图书列表
  { method: 'GET', pattern: /^\/api\/books$/, handler: async (req, res) => {
    sendJSON(res, 200, { list: mockBooks, total: mockBooks.length });
  }},
  // 图书分类
  { method: 'GET', pattern: /^\/api\/books\/categories$/, handler: async (req, res) => {
    sendJSON(res, 200, ['文学', '科幻', '技术', '科普', '历史', '艺术']);
  }},
  // 图书详情
  { method: 'GET', pattern: /^\/api\/books\/([^/]+)$/, handler: async (req, res, [id]) => {
    const book = mockBooks.find(b => b._id === id);
    book ? sendJSON(res, 200, book) : sendJSON(res, 404, { msg: '未找到' });
  }},
  // 创建图书
  { method: 'POST', pattern: /^\/api\/books$/, handler: async (req, res) => {
    const body = await parseBody(req);
    const book = { _id: 'b' + Date.now(), ...body };
    mockBooks.push(book);
    sendJSON(res, 200, book);
  }},
  // 更新图书
  { method: 'PUT', pattern: /^\/api\/books\/([^/]+)$/, handler: async (req, res, [id]) => {
    const body = await parseBody(req);
    const idx = mockBooks.findIndex(b => b._id === id);
    if (idx >= 0) { mockBooks[idx] = { ...mockBooks[idx], ...body }; sendJSON(res, 200, mockBooks[idx]); }
    else sendJSON(res, 404, { msg: '未找到' });
  }},
  // 删除图书
  { method: 'DELETE', pattern: /^\/api\/books\/([^/]+)$/, handler: async (req, res, [id]) => {
    mockBooks = mockBooks.filter(b => b._id !== id);
    sendJSON(res, 200, {});
  }},
  // 用户列表
  { method: 'GET', pattern: /^\/api\/users$/, handler: async (req, res) => {
    sendJSON(res, 200, { list: mockUsers, total: mockUsers.length });
  }},
  // 用户详情
  { method: 'GET', pattern: /^\/api\/users\/([^/]+)$/, handler: async (req, res, [id]) => {
    const u = mockUsers.find(u => u._id === id);
    u ? sendJSON(res, 200, u) : sendJSON(res, 404, { msg: '未找到' });
  }},
  // 更新用户信息 PUT /api/users/:id
  { method: 'PUT', pattern: /^\/api\/users\/([^\/]+)$/, handler: async (req, res, [id]) => {
    const body = await parseBody(req);
    const idx = mockUsers.findIndex(u => u._id === id);
    if (idx >= 0) { mockUsers[idx] = { ...mockUsers[idx], ...body }; sendJSON(res, 200, mockUsers[idx]); }
    else sendJSON(res, 404, { msg: '未找到' });
  }},
  // 邀请我的人 GET /api/users/:id/invited-by
  { method: 'GET', pattern: /^\/api\/users\/([^\/]+)\/invited-by$/, handler: async (req, res, [id]) => {
    const user = mockUsers.find(u => u._id === id);
    if (!user) { sendJSON(res, 404, { msg: '未找到' }); return; }
    if (!user.inviterId) { sendJSON(res, 200, null); return; }
    const inviter = mockUsers.find(u => u._id === user.inviterId);
    sendJSON(res, 200, inviter || null);
  }},
  // 我的邀请列表 GET /api/users/:id/invites
  { method: 'GET', pattern: /^\/api\/users\/([^\/]+)\/invites$/, handler: async (req, res, [id]) => {
    const invited = mockUsers.filter(u => u.inviterId === id);
    sendJSON(res, 200, { list: invited, total: invited.length });
  }},
  // 借阅记录
  { method: 'GET', pattern: /^\/api\/borrow$/, handler: async (req, res) => {
    sendJSON(res, 200, { list: mockBorrowRecords, total: mockBorrowRecords.length });
  }},
  // 借阅
  { method: 'POST', pattern: /^\/api\/borrow$/, handler: async (req, res) => {
    const body = await parseBody(req);
    const record = { _id: 'br' + Date.now(), ...body, status: 'borrowed', returnedDate: null };
    mockBorrowRecords.push(record);
    sendJSON(res, 200, record);
  }},
  // 归还
  { method: 'POST', pattern: /^\/api\/borrow\/return\/([^/]+)$/, handler: async (req, res, [id]) => {
    const idx = mockBorrowRecords.findIndex(r => r._id === id);
    if (idx >= 0) {
      mockBorrowRecords[idx].status = 'returned';
      mockBorrowRecords[idx].returnedDate = new Date().toISOString().slice(0, 10);
      sendJSON(res, 200, mockBorrowRecords[idx]);
    } else {
      sendJSON(res, 404, { msg: '未找到' });
    }
  }},
  // 统计数据
  { method: 'GET', pattern: /^\/api\/statistics$/, handler: async (req, res) => {
    sendJSON(res, 200, {
      // 图书统计
      totalBooks: mockBooks.length,
      booksAvailable: mockBooks.filter(b => b.status === 'available').length,
      booksBorrowed: mockBooks.filter(b => b.status === 'borrowed').length,
      booksOverdue: mockBooks.filter(b => b.status === 'borrowed' && b.dueDate && new Date(b.dueDate) < new Date()).length,
      // 用户统计
      totalUsers: mockUsers.length,
      totalPoints: mockUsers.reduce((sum, u) => sum + (u.points || 0), 0),
      // 工具统计
      totalTools: mockTools.length,
      toolsAvailable: mockTools.filter(t => t.status === 'available').length,
      toolsBorrowed: mockTools.filter(t => t.status === 'borrowed').length,
      // 积分统计
      totalPointsSpent: mockUsers.reduce((sum, u) => sum + (u.pointsSpent || 0), 0),
    });
  }},
  // 积分商城物品
  { method: 'GET', pattern: /^\/api\/points\/items$/, handler: async (req, res) => {
    sendJSON(res, 200, { list: mockPointsItems, total: mockPointsItems.length });
  }},
  // 积分兑换
  { method: 'POST', pattern: /^\/api\/points\/exchange$/, handler: async (req, res) => {
    sendJSON(res, 200, { msg: '兑换成功', points: 888 });
  }},
  // 通知列表
  { method: 'GET', pattern: /^\/api\/notifications$/, handler: async (req, res) => {
    sendJSON(res, 200, { list: mockNotifications, unreadCount: mockNotifications.filter(n => !n.read).length });
  }},
  // 标记已读
  { method: 'POST', pattern: /^\/api\/notifications\/([^/]+)\/read$/, handler: async (req, res, [id]) => {
    const n = mockNotifications.find(n => n._id === id);
    if (n) n.read = true;
    sendJSON(res, 200, {});
  }},

  // ===== 工具共享 API =====
  // 工具列表
  { method: 'GET', pattern: /^\/api\/tools$/, handler: async (req, res) => {
    sendJSON(res, 200, { list: mockTools, total: mockTools.length });
  }},
  // 工具统计（必须在工具详情之前，否则会被 :id 匹配到）
  { method: 'GET', pattern: /^\/api\/tools\/statistics$/, handler: async (req, res) => {
    sendJSON(res, 200, {
      totalTools: mockTools.length,
      available: mockTools.filter(t => t.status === 'available').length,
      borrowed: mockTools.filter(t => t.status === 'borrowed').length,
    });
  }},
  // 工具分类
  { method: 'GET', pattern: /^\/api\/tools\/categories$/, handler: async (req, res) => {
    sendJSON(res, 200, [...new Set(mockTools.map(t => t.category))]);
  }},
  // 工具详情
  { method: 'GET', pattern: /^\/api\/tools\/([^/]+)$/, handler: async (req, res, [id]) => {
    const tool = mockTools.find(t => t._id === id);
    tool ? sendJSON(res, 200, tool) : sendJSON(res, 404, { msg: '未找到' });
  }},
  // 添加工具
  { method: 'POST', pattern: /^\/api\/tools$/, handler: async (req, res) => {
    const body = await parseBody(req);
    const tool = { _id: 't' + Date.now(), ...body, status: 'available', createdAt: new Date().toISOString().slice(0, 10) };
    mockTools.push(tool);
    sendJSON(res, 200, tool);
  }},
  // 租赁工具
  { method: 'POST', pattern: /^\/api\/tools\/rent$/, handler: async (req, res) => {
    const body = await parseBody(req);
    const { toolId, userId, userName, days } = body;
    const idx = mockTools.findIndex(t => t._id === toolId);
    if (idx < 0) { sendJSON(res, 404, { msg: '工具不存在' }); return; }
    if (mockTools[idx].status !== 'available') { sendJSON(res, 400, { msg: '工具已被借出' }); return; }
    mockTools[idx].status = 'borrowed';
    mockTools[idx].borrower = userId;
    mockTools[idx].borrowerName = userName;
    mockTools[idx].borrowDate = new Date().toISOString().slice(0, 10);
    mockTools[idx].dueDate = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
    mockTools[idx].rentDays = days;
    sendJSON(res, 200, { msg: '租赁成功', record: mockTools[idx] });
  }},
  // 归还工具
  { method: 'POST', pattern: /^\/api\/tools\/return\/([^/]+)$/, handler: async (req, res, [id]) => {
    const idx = mockTools.findIndex(t => t._id === id);
    if (idx < 0) { sendJSON(res, 404, { msg: '未找到' }); return; }
    mockTools[idx].status = 'available';
    mockTools[idx].borrower = null;
    mockTools[idx].borrowerName = null;
    mockTools[idx].borrowDate = null;
    mockTools[idx].dueDate = null;
    mockTools[idx].rentDays = null;
    sendJSON(res, 200, { msg: '归还成功' });
  }},
  // 工具分类
  { method: 'GET', pattern: /^\/api\/tools\/categories$/, handler: async (req, res) => {
    sendJSON(res, 200, [...new Set(mockTools.map(t => t.category))]);
  }},

  // ===== 小区管理 API =====
  // 小区列表
  { method: 'GET', pattern: /^\/api\/communities$/, handler: async (req, res) => {
    sendJSON(res, 200, { list: mockCommunities, total: mockCommunities.length });
  }},
  // 小区详情
  { method: 'GET', pattern: /^\/api\/communities\/([^\/]+)$/, handler: async (req, res, [id]) => {
    const c = mockCommunities.find(c => c._id === id);
    c ? sendJSON(res, 200, c) : sendJSON(res, 404, { msg: '未找到' });
  }},
  // 创建小区
  { method: 'POST', pattern: /^\/api\/communities$/, handler: async (req, res) => {
    const body = await parseBody(req);
    const c = { _id: 'c' + Date.now(), ...body, createdAt: new Date().toISOString().slice(0, 10) };
    mockCommunities.push(c);
    sendJSON(res, 200, c);
  }},
  // 更新小区
  { method: 'PUT', pattern: /^\/api\/communities\/([^\/]+)$/, handler: async (req, res, [id]) => {
    const body = await parseBody(req);
    const idx = mockCommunities.findIndex(c => c._id === id);
    if (idx >= 0) { mockCommunities[idx] = { ...mockCommunities[idx], ...body }; sendJSON(res, 200, mockCommunities[idx]); }
    else sendJSON(res, 404, { msg: '未找到' });
  }},
  // 删除小区
  { method: 'DELETE', pattern: /^\/api\/communities\/([^\/]+)$/, handler: async (req, res, [id]) => {
    mockCommunities = mockCommunities.filter(c => c._id !== id);
    sendJSON(res, 200, {});
  }},

  // ===== 规则管理 API =====
  // 规则列表
  { method: 'GET', pattern: /^\/api\/rules$/, handler: async (req, res) => {
    const urlParams = new URL(req.url, 'http://localhost').searchParams;
    const communityId = urlParams.get('communityId');
    const list = communityId
      ? mockRules.filter(r => r.communityId === communityId)
      : mockRules;
    sendJSON(res, 200, { list, total: list.length });
  }},
  // 规则详情
  { method: 'GET', pattern: /^\/api\/rules\/([^\/]+)$/, handler: async (req, res, [id]) => {
    const r = mockRules.find(r => r._id === id);
    r ? sendJSON(res, 200, r) : sendJSON(res, 404, { msg: '未找到' });
  }},
  // 创建规则
  { method: 'POST', pattern: /^\/api\/rules$/, handler: async (req, res) => {
    const body = await parseBody(req);
    const rule = { _id: 'r' + Date.now(), ...body, createdAt: new Date().toISOString().slice(0, 10) };
    mockRules.push(rule);
    sendJSON(res, 200, rule);
  }},
  // 更新规则
  { method: 'PUT', pattern: /^\/api\/rules\/([^\/]+)$/, handler: async (req, res, [id]) => {
    const body = await parseBody(req);
    const idx = mockRules.findIndex(r => r._id === id);
    if (idx >= 0) { mockRules[idx] = { ...mockRules[idx], ...body }; sendJSON(res, 200, mockRules[idx]); }
    else sendJSON(res, 404, { msg: '未找到' });
  }},
  // 删除规则
  { method: 'DELETE', pattern: /^\/api\/rules\/([^\/]+)$/, handler: async (req, res, [id]) => {
    mockRules = mockRules.filter(r => r._id !== id);
    sendJSON(res, 200, {});
  }},
  // 申请规则加分
  { method: 'POST', pattern: /^\/api\/rules\/([^\/]+)\/apply$/, handler: async (req, res, [ruleId]) => {
    const body = await parseBody(req);
    const rule = mockRules.find(r => r._id === ruleId);
    if (!rule) { sendJSON(res, 404, { msg: '规则不存在' }); return; }
    const approval = { _id: 'ap' + Date.now(), ...body, ruleId, ruleName: rule.name, points: rule.points, status: 'pending', createdAt: new Date().toISOString() };
    mockRuleApprovals.push(approval);
    sendJSON(res, 200, approval);
  }},
  // 审批列表
  { method: 'GET', pattern: /^\/api\/rules\/approvals$/, handler: async (req, res) => {
    const urlParams = new URL(req.url, 'http://localhost').searchParams;
    const communityId = urlParams.get('communityId');
    const pending = mockRuleApprovals.filter(a => a.status === 'pending');
    sendJSON(res, 200, { list: pending, total: pending.length });
  }},
  // 审批通过
  { method: 'POST', pattern: /^\/api\/rules\/approvals\/([^\/]+)\/approve$/, handler: async (req, res, [id]) => {
    const idx = mockRuleApprovals.findIndex(a => a._id === id);
    if (idx < 0) { sendJSON(res, 404, { msg: '未找到' }); return; }
    mockRuleApprovals[idx].status = 'approved';
    const a = mockRuleApprovals[idx];
    // 给用户加积分
    const user = mockUsers.find(u => u._id === a.userId);
    if (user) user.points += a.points;
    sendJSON(res, 200, a);
  }},
  // 审批拒绝
  { method: 'POST', pattern: /^\/api\/rules\/approvals\/([^\/]+)\/reject$/, handler: async (req, res, [id]) => {
    const idx = mockRuleApprovals.findIndex(a => a._id === id);
    if (idx < 0) { sendJSON(res, 404, { msg: '未找到' }); return; }
    mockRuleApprovals[idx].status = 'rejected';
    sendJSON(res, 200, mockRuleApprovals[idx]);
  }},
  // 用户已提交的申请
  { method: 'GET', pattern: /^\/api\/users\/([^\/]+)\/applied-rules$/, handler: async (req, res, [userId]) => {
    const list = mockRuleApprovals.filter(a => a.userId === userId);
    sendJSON(res, 200, { list, total: list.length });
  }},

  // 议事模块 - 议题列表
  { method: 'GET', pattern: /^\/api\/topics$/, handler: async (req, res) => {
    const urlParams = new URL(req.url, 'http://localhost').searchParams;
    const status = urlParams.get('status');
    const sort = urlParams.get('sort') || 'hot';
    const page = parseInt(urlParams.get('page') || '1');
    const pageSize = parseInt(urlParams.get('pageSize') || '10');
    let list = status ? mockTopics.filter(t => t.status === status) : mockTopics;
    const focusList = list.filter(t => t.is_focused).sort((a, b) => new Date(b.focused_at) - new Date(a.focused_at));
    const normalList = list.filter(t => !t.is_focused);
    if (sort === 'hot') normalList.sort((a, b) => b.hot_score - a.hot_score);
    else normalList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const merged = [...focusList, ...normalList];
    sendJSON(res, 200, { list: merged.slice((page-1)*pageSize, page*pageSize), total: merged.length, page, pageSize });
  }},
  // 议事模块 - 议题详情
  { method: 'GET', pattern: /^\/api\/topics\/([^/]+)$/, handler: async (req, res, [id]) => {
    const topic = findTopic(id);
    topic ? sendJSON(res, 200, { ...topic, is_followed: false }) : sendJSON(res, 404, { msg: '议题不存在' });
  }},
  // 议事模块 - 创建议题
  { method: 'POST', pattern: /^\/api\/topics$/, handler: async (req, res) => {
    const body = await parseBody(req);
    const topic = { _id: 'topic' + Date.now(), title: body.title, content: body.content,
      status: 'pending', is_focused: false, focused_at: null,
      follow_count: 0, comment_count: 0, hot_score: 0,
      last_activity_at: new Date().toISOString(),
      author_id: body.author_id || 'admin001', author_name: body.author_name || '匿名用户',
      community_id: body.community_id || 'c1', tags: body.tags || [], images: body.images || [],
      created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    mockTopics.push(topic);
    sendJSON(res, 200, topic);
  }},
  // 议事模块 - 修改状态
  { method: 'PUT', pattern: /^\/api\/topics\/([^/]+)\/status$/, handler: async (req, res, [id]) => {
    const body = await parseBody(req);
    const topic = findTopic(id);
    if (!topic) { sendJSON(res, 404, { msg: '议题不存在' }); return; }
    topic.status = body.status; topic.updated_at = new Date().toISOString();
    sendJSON(res, 200, topic);
  }},
  // 议事模块 - 设置/取消置顶
  { method: 'PUT', pattern: /^\/api\/topics\/([^/]+)\/focus$/, handler: async (req, res, [id]) => {
    const body = await parseBody(req);
    const topic = findTopic(id);
    if (!topic) { sendJSON(res, 404, { msg: '议题不存在' }); return; }
    topic.is_focused = body.is_focused;
    topic.focused_at = body.is_focused ? new Date().toISOString() : null;
    sendJSON(res, 200, topic);
  }},
  // 议事模块 - 关注/取消关注
  { method: 'POST', pattern: /^\/api\/topics\/([^/]+)\/follow$/, handler: async (req, res, [id]) => {
    const body = await parseBody(req);
    const topic = findTopic(id);
    if (!topic) { sendJSON(res, 404, { msg: '议题不存在' }); return; }
    const fid = id + '_' + (body.user_id || 'anon');
    if (body.action === 'follow') {
      if (!mockTopicFollows.find(f => f.key === fid)) { mockTopicFollows.push({ key: fid, topic_id: id }); topic.follow_count++; }
    } else {
      mockTopicFollows = mockTopicFollows.filter(f => f.key !== fid);
      topic.follow_count = Math.max(0, topic.follow_count - 1);
    }
    topic.hot_score = calcHotScore(topic.follow_count, topic.comment_count, topic.created_at);
    topic.updated_at = new Date().toISOString();
    sendJSON(res, 200, { follow_count: topic.follow_count, hot_score: topic.hot_score });
  }},
  // 议事模块 - 评论列表
  { method: 'GET', pattern: /^\/api\/comments$/, handler: async (req, res) => {
    const urlParams = new URL(req.url, 'http://localhost').searchParams;
    const list = mockComments.filter(c => c.topic_id === urlParams.get('topic_id') && !c.is_deleted);
    const sort = urlParams.get('sort') || 'asc';
    list.sort((a, b) => sort === 'asc' ? new Date(a.created_at) - new Date(b.created_at) : new Date(b.created_at) - new Date(a.created_at));
    sendJSON(res, 200, { list, total: list.length });
  }},
  // 议事模块 - 发评论
  { method: 'POST', pattern: /^\/api\/topics\/([^/]+)\/comments$/, handler: async (req, res, [topicId]) => {
    const body = await parseBody(req);
    const topic = findTopic(topicId);
    if (!topic) { sendJSON(res, 404, { msg: '议题不存在' }); return; }
    if (topic.status === 'closed') { sendJSON(res, 400, { msg: '该议题已关闭，无法评论' }); return; }
    const comment = { _id: 'c' + Date.now(), topic_id: topicId, content: body.content,
      author_id: body.author_id || 'admin001', author_name: body.author_name || '匿名用户',
      is_deleted: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    mockComments.push(comment);
    topic.comment_count++; topic.last_activity_at = new Date().toISOString();
    topic.hot_score = calcHotScore(topic.follow_count, topic.comment_count, topic.created_at);
    topic.updated_at = new Date().toISOString();
    sendJSON(res, 200, comment);
  }},
  // 议事模块 - 删除评论
  { method: 'DELETE', pattern: /^\/api\/topics\/([^/]+)\/comments\/([^/]+)$/, handler: async (req, res, [topicId, commentId]) => {
    const comment = findComment(commentId);
    if (!comment) { sendJSON(res, 404, { msg: '评论不存在' }); return; }
    comment.is_deleted = true; comment.updated_at = new Date().toISOString();
    const topic = findTopic(topicId);
    if (topic) { topic.comment_count = Math.max(0, topic.comment_count - 1); topic.updated_at = new Date().toISOString(); }
    sendJSON(res, 200, {});
  }},
];

const server = http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' });
    res.end();
    return;
  }

  for (const route of routes) {
    if (route.method === method) {
      const match = url.match(route.pattern);
      if (match && match[0] === url) {
        await route.handler(req, res, match.slice(1));
        return;
      }
    }
  }

  sendJSON(res, 404, { msg: 'Not Found' });
});

server.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
  console.log('Mock admin: admin / admin123');
});