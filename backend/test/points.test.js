/**
 * 积分接口测试
 * 测试所有积分商品和兑换相关的 API 接口
 */

const request = require('supertest');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:7001';

describe('积分接口测试', () => {
  let authToken;
  let adminToken;
  let testItemId;
  let testUserId = 1;

  beforeAll(async () => {
    // 普通用户 token
    const userLogin = await request(BASE_URL)
      .post('/api/users/login')
      .send({ username: 'testuser', password: '123456' });
    authToken = userLogin.body.token;

    // 管理员 token (需要预先创建管理员用户)
    const adminLogin = await request(BASE_URL)
      .post('/api/users/login')
      .send({ username: 'admin', password: 'admin123' });
    adminToken = adminLogin.body.token || authToken; // 降级使用
  });

  describe('GET /api/points/items - 积分商品列表', () => {
    it('应该返回商品列表', async () => {
      const response = await request(BASE_URL)
        .get('/api/points/items')
        .expect(200);
      
      expect(Array.isArray(response.body.list)).toBe(true);
    });

    it('应该返回上下架状态', async () => {
      const response = await request(BASE_URL)
        .get('/api/points/items')
        .expect(200);
      
      response.body.list.forEach(item => {
        expect(item).toHaveProperty('status');
      });
    });

    it('支持分类筛选', async () => {
      const response = await request(BASE_URL)
        .get('/api/points/items?category=图书')
        .expect(200);
      
      expect(response.body.list).toBeDefined();
    });

    it('支持分页', async () => {
      const response = await request(BASE_URL)
        .get('/api/points/items?page=1&pageSize=10')
        .expect(200);
      
      expect(response.body.pagination).toBeDefined();
    });
  });

  describe('POST /api/points/items - 创建商品', () => {
    it('管理员应该成功创建商品', async () => {
      const newItem = {
        name: '测试商品',
        points: 100,
        stock: 10,
        category: '文具',
        description: '测试用商品'
      };

      const response = await request(BASE_URL)
        .post('/api/points/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newItem)
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      testItemId = response.body.id;
    });

    it('普通用户创建应返回403', async () => {
      const response = await request(BASE_URL)
        .post('/api/points/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '测试', points: 100 })
        .expect(403);
    });

    it('缺少必填字段应返回400', async () => {
      const response = await request(BASE_URL)
        .post('/api/points/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '缺少积分' })
        .expect(400);
    });

    it('积分值为负应返回400', async () => {
      const response = await request(BASE_URL)
        .post('/api/points/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '负积分商品', points: -100 })
        .expect(400);
    });
  });

  describe('PUT /api/points/items/:id - 更新商品', () => {
    it('管理员应该成功更新商品', async () => {
      const response = await request(BASE_URL)
        .put(`/api/points/items/${testItemId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '更新后的商品', points: 200 })
        .expect(200);
      
      expect(response.body.name).toBe('更新后的商品');
      expect(response.body.points).toBe(200);
    });

    it('更新不存在的商品应返回404', async () => {
      const response = await request(BASE_URL)
        .put('/api/points/items/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '测试' })
        .expect(404);
    });

    it('普通用户更新应返回403', async () => {
      const response = await request(BASE_URL)
        .put(`/api/points/items/${testItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '尝试修改' })
        .expect(403);
    });
  });

  describe('DELETE /api/points/items/:id - 删除商品', () => {
    it('管理员应该成功删除商品', async () => {
      await request(BASE_URL)
        .delete(`/api/points/items/${testItemId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('删除不存在的商品应返回404', async () => {
      const response = await request(BASE_URL)
        .delete('/api/points/items/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('普通用户删除应返回403', async () => {
      const response = await request(BASE_URL)
        .delete(`/api/points/items/${testItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });
  });

  describe('POST /api/points/exchange - 积分兑换', () => {
    let exchangeItemId;

    beforeAll(async () => {
      // 创建测试商品
      const itemRes = await request(BASE_URL)
        .post('/api/points/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          name: '兑换测试商品', 
          points: 10, 
          stock: 100,
          category: '测试'
        });
      exchangeItemId = itemRes.body.id;
    });

    it('应该成功兑换商品', async () => {
      const response = await request(BASE_URL)
        .post('/api/points/exchange')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemId: exchangeItemId,
          quantity: 1
        })
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
    });

    it('积分不足应返回错误', async () => {
      const response = await request(BASE_URL)
        .post('/api/points/exchange')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemId: exchangeItemId,
          quantity: 9999
        })
        .expect(400);
      
      expect(response.body.message).toContain('积分不足');
    });

    it('商品库存不足应返回错误', async () => {
      // 先把库存设为0
      await request(BASE_URL)
        .put(`/api/points/items/${exchangeItemId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ stock: 0 });

      const response = await request(BASE_URL)
        .post('/api/points/exchange')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemId: exchangeItemId,
          quantity: 1
        })
        .expect(400);
      
      expect(response.body.message).toContain('库存不足');
    });

    it('商品不存在应返回404', async () => {
      const response = await request(BASE_URL)
        .post('/api/points/exchange')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemId: 99999,
          quantity: 1
        })
        .expect(404);
    });

    it('未授权应返回401', async () => {
      const response = await request(BASE_URL)
        .post('/api/points/exchange')
        .send({ itemId: exchangeItemId, quantity: 1 })
        .expect(401);
    });

    it('兑换数量为负数应返回400', async () => {
      const response = await request(BASE_URL)
        .post('/api/points/exchange')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemId: exchangeItemId,
          quantity: -1
        })
        .expect(400);
    });

    it('兑换数量为0应返回400', async () => {
      const response = await request(BASE_URL)
        .post('/api/points/exchange')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemId: exchangeItemId,
          quantity: 0
        })
        .expect(400);
    });
  });
});
