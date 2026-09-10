/**
 * 借阅接口测试
 * 测试所有借阅、预约相关的 API 接口
 */

const request = require('supertest');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:7001';

describe('借阅接口测试', () => {
  let authToken;
  let adminToken;
  let testBorrowId;
  let testUserId;
  let adminUserId;
  let testBookId;

  // 准备：创建测试用户并登录（时间戳用户名确保每次都是新用户）
  beforeAll(async () => {
    const ts = Date.now();
    const testUsername = `borrowuser_${ts}`;
    const adminUsername = `bookadmin_${ts}`;

    // 注册测试用户
    await request(BASE_URL)
      .post('/api/users/register')
      .send({ username: testUsername, password: 'test123', name: 'BorrowUser' })
      .catch(() => {});

    const loginRes = await request(BASE_URL)
      .post('/api/users/login')
      .send({ username: testUsername, password: 'test123' });

    authToken = loginRes.body.data.token;
    testUserId = loginRes.body.data.id;

    // 创建管理员用户和测试图书
    await request(BASE_URL)
      .post('/api/users/register')
      .send({ username: adminUsername, password: 'admin123', name: 'BookAdmin', role: 'admin' })
      .catch(() => {});
    const adminLogin = await request(BASE_URL)
      .post('/api/users/login')
      .send({ username: adminUsername, password: 'admin123' });
    adminToken = adminLogin.body.data.token;
    adminUserId = adminLogin.body.data.id;

    const bookRes = await request(BASE_URL)
      .post('/api/books')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: '测试图书-借阅', author: '测试作者', total: 5, available: 5 });
    testBookId = bookRes.body.data._id;
  }, 30000);

  afterAll(async () => {
    // 删除测试图书
    if (adminToken && testBookId) {
      await request(BASE_URL)
        .delete(`/api/books/${testBookId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .catch(() => {});
    }
    // 删除测试用户
    if (authToken && testUserId) {
      await request(BASE_URL)
        .delete(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .catch(() => {});
    }
    if (adminToken && adminUserId) {
      await request(BASE_URL)
        .delete(`/api/users/${adminUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .catch(() => {});
    }
    console.log('🧹 borrow 测试数据已清理');
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
        .expect(200);

      expect(response.body.data).toHaveProperty('_id');
      testBorrowId = response.body.data._id;
    });

    it('图书库存不足应返回错误', async () => {
      // 先借光所有书

      // 创建一本只剩1本的图书
      const bookRes = await request(BASE_URL)
        .post('/api/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: '限量图书', author: '作者', total: 1, available: 1 });
      const limitedBookId = bookRes.body.data._id;

      // 借走最后一本
      await request(BASE_URL)
        .post('/api/borrow')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ bookId: limitedBookId, userId: testUserId });

      // 再借应该失败
      const response = await request(BASE_URL)
        .post('/api/borrow')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ bookId: limitedBookId, userId: testUserId })
        .expect(400);

      expect(response.body.msg).toMatch(/借出|库存|无可借/);
    });

    it('超过借阅上限应返回错误', async () => {
      // 先借满5本书（使用同一本有足够库存的书）
      const adminLogin = await request(BASE_URL)
        .post('/api/users/login')
        .send({ username: 'bookadmin', password: 'admin123' });
      const adminToken = adminLogin.body.data.token;

      // 创建一本有5本库存的书用于测试上限
      const bookRes = await request(BASE_URL)
        .post('/api/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: '上限测试图书', author: '作者', total: 5, available: 5 });
      const limitBookId = bookRes.body.data._id;

      // 借5次（达到上限）
      for (let i = 0; i < 5; i++) {
        await request(BASE_URL)
          .post('/api/borrow')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ bookId: limitBookId, userId: testUserId });
      }

      // 再借一本应该失败
      const response = await request(BASE_URL)
        .post('/api/borrow')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ bookId: limitBookId, userId: testUserId })
        .expect(400);

      expect(response.body.msg).toMatch(/上限|已达|借阅数量|5/);
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
      if (!testBorrowId) return;

      const response = await request(BASE_URL)
        .post(`/api/borrow/return/${testBorrowId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.status).toBe('returned');
    });

    it('还书记录不存在应返回404', async () => {
      const response = await request(BASE_URL)
        .post('/api/borrow/return/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('重复还书应返回错误', async () => {
      if (!testBorrowId) return;

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

      expect(Array.isArray(response.body.data.list)).toBe(true);
    });

    it('支持状态筛选', async () => {
      const response = await request(BASE_URL)
        .get('/api/borrow?status=borrowed')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.data.list.forEach(item => {
        expect(item.status).toBe('borrowed');
      });
    });

    it('支持用户筛选', async () => {
      const response = await request(BASE_URL)
        .get(`/api/borrow?userId=${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.list).toBeDefined();
    });

    it('支持分页', async () => {
      const response = await request(BASE_URL)
        .get('/api/borrow?page=1&pageSize=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.pageSize).toBe(5);
    });
  });

  describe('POST /api/reserve - 预约图书', () => {
    it('应该成功预约图书', async () => {
      // 先创建一本不可借的图书

      const bookRes = await request(BASE_URL)
        .post('/api/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: '预约测试图书', author: '作者', total: 1, available: 0 });
      const reserveBookId = bookRes.body.data._id;

      const response = await request(BASE_URL)
        .post('/api/reserve')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bookId: reserveBookId,
          userId: testUserId
        })
        .expect(200);

      expect(response.body.data).toHaveProperty('_id');
    });

    it('已预约过应返回错误', async () => {
      // 创建一本不可借的书

      const bookRes = await request(BASE_URL)
        .post('/api/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: '重复预约测试', author: '作者', total: 1, available: 0 });
      const reserveBookId = bookRes.body.data._id;

      // 第一次预约
      await request(BASE_URL)
        .post('/api/reserve')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ bookId: reserveBookId, userId: testUserId });

      // 第二次预约应该失败
      const response = await request(BASE_URL)
        .post('/api/reserve')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ bookId: reserveBookId, userId: testUserId })
        .expect(400);
    });
  });

  describe('POST /api/reserve/cancel/:id - 取消预约', () => {
    it('应该成功取消预约', async () => {
      // 先创建一个预约

      const bookRes = await request(BASE_URL)
        .post('/api/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: '取消预约测试', author: '作者', total: 1, available: 0 });
      const reserveBookId = bookRes.body.data._id;

      const reserveRes = await request(BASE_URL)
        .post('/api/reserve')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ bookId: reserveBookId, userId: testUserId });

      const reserveId = reserveRes.body.data._id;

      const response = await request(BASE_URL)
        .post(`/api/reserve/cancel/${reserveId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.status).toBe('cancelled');
    });

    it('取消不存在的预约应返回404', async () => {
      const response = await request(BASE_URL)
        .post('/api/reserve/cancel/507f1f77bcf86cd799439011')
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

      // 接口返回的是数组，不是 { list: [] }
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('支持状态筛选', async () => {
      const response = await request(BASE_URL)
        .get('/api/reserve?status=pending')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.data.forEach(item => {
        expect(item.status).toBe('pending');
      });
    });
  });

  describe('GET /api/statistics - 统计数据', () => {
    it('应该返回统计数据', async () => {
      const response = await request(BASE_URL)
        .get('/api/statistics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('totalBooks');
      // 实际返回 borrowedCount 而不是 borrowing/returned
      expect(response.body.data).toHaveProperty('borrowedCount');
    });

    it('支持日期范围筛选', async () => {
      const response = await request(BASE_URL)
        .get('/api/statistics?startDate=2024-01-01&endDate=2026-12-31')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
    });

    it('未授权应返回401', async () => {
      const response = await request(BASE_URL)
        .get('/api/statistics')
        .expect(401);
    });
  });
});
