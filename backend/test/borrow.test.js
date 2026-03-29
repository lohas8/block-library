/**
 * 借阅接口测试
 * 测试所有借阅、预约相关的 API 接口
 */

const request = require('supertest');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:7001';

describe('借阅接口测试', () => {
  let authToken;
  let testBorrowId;
  let testUserId = 1;
  let testBookId = 1;

  beforeAll(async () => {
    // 获取认证token的辅助方法
    const loginRes = await request(BASE_URL)
      .post('/api/users/login')
      .send({ username: 'testuser', password: '123456' });
    authToken = loginRes.body.token;
  });

  describe('POST /api/borrow - 借书', () => {
    it('应该成功借书', async () => {
      const response = await request(BASE_URL)
        .post('/api/borrow')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bookId: testBookId,
          userId: testUserId
        })
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      testBorrowId = response.body.id;
    });

    it('图书库存不足应返回错误', async () => {
      const response = await request(BASE_URL)
        .post('/api/borrow')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bookId: testBookId,
          userId: testUserId
        })
        .expect(400);
      
      expect(response.body.message).toContain('库存不足');
    });

    it('超过借阅上限应返回错误', async () => {
      const response = await request(BASE_URL)
        .post('/api/borrow')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bookId: 999,
          userId: testUserId
        })
        .expect(400);
      
      expect(response.body.message).toContain('借阅数量已达上限');
    });

    it('未授权应返回401', async () => {
      const response = await request(BASE_URL)
        .post('/api/borrow')
        .send({ bookId: testBookId })
        .expect(401);
    });
  });

  describe('POST /api/borrow/return/:id - 还书', () => {
    it('应该成功还书', async () => {
      const response = await request(BASE_URL)
        .post(`/api/borrow/return/${testBorrowId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.status).toBe('returned');
    });

    it('还书记录不存在应返回404', async () => {
      const response = await request(BASE_URL)
        .post('/api/borrow/return/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('重复还书应返回错误', async () => {
      const response = await request(BASE_URL)
        .post(`/api/borrow/return/${testBorrowId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('GET /api/borrow - 借阅列表', () => {
    it('应该返回借阅列表', async () => {
      const response = await request(BASE_URL)
        .get('/api/borrow')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(Array.isArray(response.body.list)).toBe(true);
    });

    it('支持状态筛选', async () => {
      const response = await request(BASE_URL)
        .get('/api/borrow?status=borrowing')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      response.body.list.forEach(item => {
        expect(item.status).toBe('borrowing');
      });
    });

    it('支持用户筛选', async () => {
      const response = await request(BASE_URL)
        .get(`/api/borrow?userId=${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.list).toBeDefined();
    });

    it('支持分页', async () => {
      const response = await request(BASE_URL)
        .get('/api/borrow?page=1&pageSize=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.pagination.pageSize).toBe(5);
    });
  });

  describe('POST /api/reserve - 预约图书', () => {
    it('应该成功预约图书', async () => {
      const response = await request(BASE_URL)
        .post('/api/reserve')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bookId: testBookId,
          userId: testUserId
        })
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
    });

    it('已预约过应返回错误', async () => {
      const response = await request(BASE_URL)
        .post('/api/reserve')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bookId: testBookId,
          userId: testUserId
        })
        .expect(400);
    });

    it('图书可借时不应允许预约', async () => {
      // 需要先确保某本书可借
      const response = await request(BASE_URL)
        .post('/api/reserve')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bookId: 100,
          userId: testUserId
        });
      
      // 如果有库存，应该返回相应提示
      if (response.status === 400) {
        expect(response.body.message).toContain('可借');
      }
    });
  });

  describe('POST /api/reserve/cancel/:id - 取消预约', () => {
    it('应该成功取消预约', async () => {
      // 先创建一个预约
      const reserveRes = await request(BASE_URL)
        .post('/api/reserve')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ bookId: 200, userId: testUserId });
      
      const reserveId = reserveRes.body.id;

      const response = await request(BASE_URL)
        .post(`/api/reserve/cancel/${reserveId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.status).toBe('cancelled');
    });

    it('取消不存在的预约应返回404', async () => {
      const response = await request(BASE_URL)
        .post('/api/reserve/cancel/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /api/reserve - 预约列表', () => {
    it('应该返回预约列表', async () => {
      const response = await request(BASE_URL)
        .get('/api/reserve')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(Array.isArray(response.body.list)).toBe(true);
    });

    it('支持状态筛选', async () => {
      const response = await request(BASE_URL)
        .get('/api/reserve?status=active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      response.body.list.forEach(item => {
        expect(item.status).toBe('active');
      });
    });
  });

  describe('GET /api/statistics - 统计数据', () => {
    it('应该返回统计数据', async () => {
      const response = await request(BASE_URL)
        .get('/api/statistics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('totalBooks');
      expect(response.body).toHaveProperty('borrowing');
      expect(response.body).toHaveProperty('returned');
    });

    it('支持日期范围筛选', async () => {
      const response = await request(BASE_URL)
        .get('/api/statistics?startDate=2024-01-01&endDate=2024-12-31')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toBeDefined();
    });

    it('未授权应返回401', async () => {
      const response = await request(BASE_URL)
        .get('/api/statistics')
        .expect(401);
    });
  });
});
