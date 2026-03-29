/**
 * 用户接口测试
 * 测试所有用户相关的 API 接口
 */

const request = require('supertest');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:7001';

describe('用户接口测试', () => {
  let authToken;
  let testUserId;
  const testUser = {
    username: 'testuser',
    password: '123456',
    phone: '13800138000',
    name: '测试用户'
  };

  describe('POST /api/users/register - 用户注册', () => {
    it('应该成功注册新用户', async () => {
      const response = await request(BASE_URL)
        .post('/api/users/register')
        .send(testUser)
        .expect(201);
      
      expect(response.body).toHaveProperty('token');
      authToken = response.body.token;
      testUserId = response.body.user.id;
    });

    it('用户名重复应返回错误', async () => {
      const response = await request(BASE_URL)
        .post('/api/users/register')
        .send(testUser)
        .expect(400);
      
      expect(response.body.message).toContain('用户名已存在');
    });

    it('缺少必填字段应返回错误', async () => {
      const response = await request(BASE_URL)
        .post('/api/users/register')
        .send({ username: 'test' })
        .expect(400);
    });
  });

  describe('POST /api/users/login - 用户登录', () => {
    it('应该成功登录', async () => {
      const response = await request(BASE_URL)
        .post('/api/users/login')
        .send({
          username: testUser.username,
          password: testUser.password
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('token');
    });

    it('密码错误应返回错误', async () => {
      const response = await request(BASE_URL)
        .post('/api/users/login')
        .send({
          username: testUser.username,
          password: 'wrongpassword'
        })
        .expect(401);
    });

    it('用户不存在应返回错误', async () => {
      const response = await request(BASE_URL)
        .post('/api/users/login')
        .send({
          username: 'nonexistent',
          password: '123456'
        })
        .expect(404);
    });
  });

  describe('GET /api/users - 用户列表', () => {
    it('应该返回用户列表（需管理员权限）', async () => {
      const response = await request(BASE_URL)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(Array.isArray(response.body.list)).toBe(true);
    });

    it('未授权应返回401', async () => {
      const response = await request(BASE_URL)
        .get('/api/users')
        .expect(401);
    });
  });

  describe('GET /api/users/:id - 用户详情', () => {
    it('应该返回指定用户详情', async () => {
      const response = await request(BASE_URL)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('username');
    });

    it('用户不存在应返回404', async () => {
      const response = await request(BASE_URL)
        .get('/api/users/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/users/:id - 更新用户', () => {
    it('应该成功更新用户信息', async () => {
      const response = await request(BASE_URL)
        .put(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '新名字' })
        .expect(200);
      
      expect(response.body.name).toBe('新名字');
    });

    it('无权限更新其他用户应返回403', async () => {
      const response = await request(BASE_URL)
        .put('/api/users/99998')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '尝试修改' })
        .expect(403);
    });
  });

  describe('POST /api/users/:id/points - 更新积分', () => {
    it('应该成功增加用户积分', async () => {
      const response = await request(BASE_URL)
        .post(`/api/users/${testUserId}/points`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ points: 10, type: 'add', reason: '测试增加' })
        .expect(200);
      
      expect(response.body.points).toBeGreaterThanOrEqual(10);
    });

    it('积分不足应返回错误', async () => {
      const response = await request(BASE_URL)
        .post(`/api/users/${testUserId}/points`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ points: -99999, type: 'deduct', reason: '测试扣减' })
        .expect(400);
    });
  });

  describe('GET /api/users/:id/borrow-history - 借阅历史', () => {
    it('应该返回用户借阅历史', async () => {
      const response = await request(BASE_URL)
        .get(`/api/users/${testUserId}/borrow-history`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('支持分页', async () => {
      const response = await request(BASE_URL)
        .get(`/api/users/${testUserId}/borrow-history?page=1&pageSize=10`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('pagination');
    });
  });
});
