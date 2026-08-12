/**
 * 投票模块接口测试
 * 测试投票创建、投票、统计相关 API
 */
const request = require('supertest');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:7001';

describe('投票模块 API 测试', () => {
  let adminToken;
  let userToken;
  let testUserId;
  let createdVoteId;

  // 在所有测试前先登录获取 token
  beforeAll(async () => {
    // 注册并登录管理员
    await request(BASE_URL)
      .post('/api/users/register')
      .send({ username: 'voteadmin', password: 'admin123', name: 'VoteAdmin', role: 'admin' })
      .catch(() => {}); // 忽略已存在错误

    const adminLoginRes = await request(BASE_URL)
      .post('/api/users/login')
      .send({ username: 'voteadmin', password: 'admin123' });
    adminToken = adminLoginRes.body.data.token;

    // 注册并登录普通用户
    await request(BASE_URL)
      .post('/api/users/register')
      .send({ username: 'voteuser', password: 'user123', name: 'VoteUser' })
      .catch(() => {});

    const userLoginRes = await request(BASE_URL)
      .post('/api/users/login')
      .send({ username: 'voteuser', password: 'user123' });
    userToken = userLoginRes.body.data.token;
    testUserId = userLoginRes.body.data.user.id;
  });

  describe('POST /api/votes - 创建投票（需管理员权限）', () => {
    it('管理员应能成功创建二选一投票', async () => {
      const response = await request(BASE_URL)
        .post('/api/votes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: '健身器材更新采购方案',
          content: '是否更换小区健身器材？',
          vote_type: 'binary',
          deadline: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
          items: [
            { label: '同意', color: '#4caf50' },
            { label: '反对', color: '#ef5350' },
          ],
        })
        .expect(200);

      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.title).toBe('健身器材更新采购方案');
      expect(Array.isArray(response.body.data.items)).toBe(true);
      expect(response.body.data.items.length).toBe(2);
      createdVoteId = response.body.data._id;
    });

    it('普通用户创建投票应返回 403', async () => {
      const response = await request(BASE_URL)
        .post('/api/votes')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: '测试投票',
          items: [{ label: '同意' }, { label: '反对' }],
        })
        .expect(403);

      expect(response.body.code).toBe(403);
    });

    it('缺少必填字段应返回错误', async () => {
      const response = await request(BASE_URL)
        .post('/api/votes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: '无选项投票' })
        .expect(400);
    });
  });

  describe('GET /api/votes - 投票列表', () => {
    it('应返回投票列表（支持状态筛选）', async () => {
      const response = await request(BASE_URL)
        .get('/api/votes')
        .expect(200);

      expect(response.body.data).toHaveProperty('list');
      expect(Array.isArray(response.body.data.list)).toBe(true);
      expect(response.body.data).toHaveProperty('total');
    });

    it('支持按状态筛选 active 投票', async () => {
      const response = await request(BASE_URL)
        .get('/api/votes?status=active')
        .expect(200);

      const activeVotes = response.body.data.list.filter(v => v.status === 'active');
      expect(activeVotes.length).toBe(response.body.data.list.length);
    });
  });

  describe('GET /api/votes/:id - 投票详情', () => {
    it('应返回投票详情（含选项）', async () => {
      if (!createdVoteId) {
        this.skip();
      }
      const response = await request(BASE_URL)
        .get(`/api/votes/${createdVoteId}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('title');
      expect(response.body.data).toHaveProperty('items');
      expect(Array.isArray(response.body.data.items)).toBe(true);
      expect(response.body.data.items[0]).toHaveProperty('vote_count');
      expect(response.body.data.items[0]).toHaveProperty('label');
    });

    it('投票不存在应返回 404', async () => {
      const response = await request(BASE_URL)
        .get('/api/votes/000000000000000000000000')
        .expect(404);
    });
  });

  describe('POST /api/votes/:id/cast - 投票', () => {
    it('业主应能成功投票', async () => {
      if (!createdVoteId) return;

      const response = await request(BASE_URL)
        .post(`/api/votes/${createdVoteId}/cast`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ selected_item_ids: [createdVoteId] })
        .expect(200);

      expect(response.body.data.success).toBe(true);
    });

    it('未登录用户投票应返回 401', async () => {
      if (!createdVoteId) return;

      const response = await request(BASE_URL)
        .post(`/api/votes/${createdVoteId}/cast`)
        .send({ selected_item_ids: [] })
        .expect(401);
    });

    it('重复投票应返回错误', async () => {
      if (!createdVoteId) return;

      const response = await request(BASE_URL)
        .post(`/api/votes/${createdVoteId}/cast`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ selected_item_ids: [] })
        .expect(400);

      expect(response.body.msg).toContain('已投过');
    });
  });

  describe('POST /api/votes/:id/close - 结束投票（需管理员）', () => {
    it('管理员应能结束投票', async () => {
      if (!createdVoteId) return;

      const response = await request(BASE_URL)
        .post(`/api/votes/${createdVoteId}/close`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.msg).toContain('结束');
    });

    it('普通用户结束投票应返回 403', async () => {
      if (!createdVoteId) return;

      const response = await request(BASE_URL)
        .post(`/api/votes/${createdVoteId}/close`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('GET /api/votes - 多选投票', () => {
    it('应支持多选类型投票', async () => {
      const response = await request(BASE_URL)
        .post('/api/votes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: '社区活动选择（多选）',
          vote_type: 'multi',
          items: [
            { label: '徒步', color: '#4caf50' },
            { label: '球赛', color: '#2196f3' },
            { label: '读书会', color: '#ff9800' },
          ],
        })
        .expect(200);

      expect(response.body.data.vote_type).toBe('multi');
      expect(response.body.data.items.length).toBe(3);
    });
  });
});
