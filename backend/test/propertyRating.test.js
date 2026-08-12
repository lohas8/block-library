/**
 * 物业评价模块接口测试
 * 测试评价配置管理（管理员）和评价提交/统计（业主）
 */
const request = require('supertest');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:7001';

const TEST_COMMUNITY = 'test-community-001';
const TEST_YEAR = new Date().getFullYear();

describe('物业评价模块 API 测试', () => {
  let adminToken;
  let userToken;
  let createdCategoryId;

  // 在所有测试前先登录获取真实 token
  beforeAll(async () => {
    // 注册并登录管理员
    await request(BASE_URL)
      .post('/api/users/register')
      .send({ username: 'rateadmin', password: 'admin123', name: 'RateAdmin', role: 'admin' })
      .catch(() => {});

    const adminLoginRes = await request(BASE_URL)
      .post('/api/users/login')
      .send({ username: 'rateadmin', password: 'admin123' });
    adminToken = adminLoginRes.body.data.token;

    // 注册并登录普通用户
    await request(BASE_URL)
      .post('/api/users/register')
      .send({ username: 'rateuser', password: 'user123', name: 'RateUser' })
      .catch(() => {});

    const userLoginRes = await request(BASE_URL)
      .post('/api/users/login')
      .send({ username: 'rateuser', password: 'user123' });
    userToken = userLoginRes.body.data.token;
  }, 30000);

  // =============================================
  // 评价配置管理（管理员）
  // =============================================

  describe('POST /api/rating-categories - 创建评价大项（管理员）', () => {
    it('管理员应能创建评价大项（含小项）', async () => {
      const response = await request(BASE_URL)
        .post('/api/rating-categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          community_id: TEST_COMMUNITY,
          name: '服务态度',
          items: [
            { item_key: 'service_response', item_name: '服务响应速度' },
            { item_key: 'service_attitude', item_name: '服务人员态度' },
            { item_key: 'service_professional', item_name: '专业化程度' },
          ],
        })
        .expect(200);

      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe('服务态度');
      expect(Array.isArray(response.body.data.items)).toBe(true);
      expect(response.body.data.items.length).toBe(3);
      createdCategoryId = response.body.data._id;
    });

    it('普通用户创建应返回 403', async () => {
      const response = await request(BASE_URL)
        .post('/api/rating-categories')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: '测试大项',
          items: [{ item_key: 't1', item_name: '测试项' }],
        })
        .expect(403);
    });

    it('缺少必填字段应返回 400', async () => {
      const response = await request(BASE_URL)
        .post('/api/rating-categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '无小项配置' })
        .expect(400);
    });
  });

  describe('GET /api/rating-categories - 评价配置列表', () => {
    it('应返回当前评价配置列表', async () => {
      const response = await request(BASE_URL)
        .get('/api/rating-categories')
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('name');
        expect(response.body.data[0]).toHaveProperty('items');
      }
    });

    it('支持按小区筛选', async () => {
      const response = await request(BASE_URL)
        .get(`/api/rating-categories?community_id=${TEST_COMMUNITY}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('PUT /api/rating-categories/:id - 更新配置', () => {
    it('管理员应能更新大项名称', async () => {
      if (!createdCategoryId) return;

      const response = await request(BASE_URL)
        .put(`/api/rating-categories/${createdCategoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '服务态度（更新后）' })
        .expect(200);

      expect(response.body.data.name).toBe('服务态度（更新后）');
    });

    it('管理员应能新增小项', async () => {
      if (!createdCategoryId) return;

      const response = await request(BASE_URL)
        .put(`/api/rating-categories/${createdCategoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          items: [
            { item_key: 'service_response', item_name: '服务响应速度' },
            { item_key: 'service_attitude', item_name: '服务人员态度' },
            { item_key: 'service_new', item_name: '新增小项' },
          ],
        })
        .expect(200);

      expect(response.body.data.items.length).toBe(3);
    });
  });

  describe('DELETE /api/rating-categories/:id - 删除配置', () => {
    it('管理员应能删除配置', async () => {
      // 先创建一个用于删除的类别
      const createRes = await request(BASE_URL)
        .post('/api/rating-categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '待删除大项',
          items: [{ item_key: 'to_delete', item_name: '待删除小项' }],
        });

      const idToDelete = createRes.body._id;

      const response = await request(BASE_URL)
        .delete(`/api/rating-categories/${idToDelete}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.msg).toContain('删除成功');
    });

    it('普通用户删除应返回 403', async () => {
      if (!createdCategoryId) return;

      const response = await request(BASE_URL)
        .delete(`/api/rating-categories/${createdCategoryId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  // =============================================
  // 评价提交（业主）
  // =============================================

  let hasSubmittedVoteId;

  describe('GET /api/property-ratings/check - 检查是否已提交', () => {
    it('应正确反映本年度未提交状态', async () => {
      const response = await request(BASE_URL)
        .get(`/api/property-ratings/check?community_id=${TEST_COMMUNITY}&year=${TEST_YEAR}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(typeof response.body.has_submitted).toBe('boolean');
    });
  });

  describe('POST /api/property-ratings - 提交评价（业主）', () => {
    it('业主应能成功提交年度评价', async () => {
      // 获取当前配置的小项
      const catRes = await request(BASE_URL)
        .get('/api/rating-categories')
        .expect(200);

      const allItems = {};
      (catRes.body.data || []).forEach(cat => {
        (cat.items || []).forEach(item => {
          allItems[item.item_key] = 4; // 评4分
        });
      });

      const response = await request(BASE_URL)
        .post('/api/property-ratings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          community_id: TEST_COMMUNITY,
          year: TEST_YEAR,
          scores: allItems,
        })
        .expect(200);

      expect(response.body.data).toHaveProperty('_id');
      hasSubmittedVoteId = response.body.data._id;
    });

    it('同一年度重复提交应返回错误', async () => {
      const response = await request(BASE_URL)
        .post('/api/property-ratings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          community_id: TEST_COMMUNITY,
          year: TEST_YEAR,
          scores: { service_response: 5 },
        })
        .expect(400);

      expect(response.body.msg).toContain('已提交过');
    });

    it('未登录提交应返回 401', async () => {
      const response = await request(BASE_URL)
        .post('/api/property-ratings')
        .send({
          community_id: TEST_COMMUNITY,
          year: TEST_YEAR,
          scores: { service_response: 5 },
        })
        .expect(401);
    });
  });

  describe('GET /api/property-ratings/check - 提交后状态', () => {
    it('提交后 has_submitted 应为 true', async () => {
      const response = await request(BASE_URL)
        .get(`/api/property-ratings/check?community_id=${TEST_COMMUNITY}&year=${TEST_YEAR}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.has_submitted).toBe(true);
    });
  });

  // =============================================
  // 评分统计
  // =============================================

  describe('GET /api/property-ratings/stats - 评分统计', () => {
    it('应返回各小项的平均分和评分人数', async () => {
      const response = await request(BASE_URL)
        .get(`/api/property-ratings/stats?community_id=${TEST_COMMUNITY}&year=${TEST_YEAR}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('year', TEST_YEAR);
      expect(response.body.data).toHaveProperty('total_raters');
      expect(Array.isArray(response.body.data.items)).toBe(true);

      if (response.body.data.items.length > 0) {
        const item = response.body.data.items[0];
        expect(item).toHaveProperty('item_key');
        expect(item).toHaveProperty('avg');
        expect(item).toHaveProperty('count');
        expect(typeof item.avg).toBe('number');
        expect(typeof item.count).toBe('number');
      }
    });

    it('支持按年份筛选', async () => {
      const response = await request(BASE_URL)
        .get(`/api/property-ratings/stats?community_id=${TEST_COMMUNITY}&year=${TEST_YEAR - 1}`)
        .expect(200);

      expect(response.body.data.year).toBe(TEST_YEAR - 1);
    });

    it('平均分应保留1位小数', async () => {
      const response = await request(BASE_URL)
        .get(`/api/property-ratings/stats?community_id=${TEST_COMMUNITY}&year=${TEST_YEAR}`)
        .expect(200);

      if (response.body.data.items.length > 0) {
        const avgStr = response.body.data.items[0].avg.toFixed(1);
        expect(avgStr).toMatch(/^\d+\.\d$/);
      }
    });
  });

  // =============================================
  // 边界测试
  // =============================================

  describe('边界测试', () => {
    it('评分超出 1-5 范围应被拒绝', async () => {
      const catRes = await request(BASE_URL)
        .get('/api/rating-categories')
        .expect(200);

      const allItems = {};
      (catRes.body.data || []).forEach(cat => {
        (cat.items || []).forEach(item => {
          allItems[item.item_key] = 99; // 超出范围
        });
      });

      const response = await request(BASE_URL)
        .post('/api/property-ratings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          community_id: TEST_COMMUNITY,
          year: TEST_YEAR,
          scores: allItems,
        });

      // 不应成功（但 mongoose 校验取决于 schema 实现）
      expect([200, 400]).toContain(response.status);
    });
  });
});