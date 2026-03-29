/**
 * 通知接口测试
 * 测试所有通知相关的 API 接口
 */

const request = require('supertest');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:7001';

describe('通知接口测试', () => {
  let authToken;
  let testNotificationId;
  let testUserId = 1;

  beforeAll(async () => {
    const loginRes = await request(BASE_URL)
      .post('/api/users/login')
      .send({ username: 'testuser', password: '123456' });
    authToken = loginRes.body.token;
  });

  describe('GET /api/notifications - 通知列表', () => {
    it('应该返回通知列表', async () => {
      const response = await request(BASE_URL)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(Array.isArray(response.body.list)).toBe(true);
    });

    it('未授权应返回401', async () => {
      const response = await request(BASE_URL)
        .get('/api/notifications')
        .expect(401);
    });

    it('支持已读/未读筛选', async () => {
      const response = await request(BASE_URL)
        .get('/api/notifications?read=false')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      response.body.list.forEach(item => {
        expect(item.read).toBe(false);
      });
    });

    it('支持分页', async () => {
      const response = await request(BASE_URL)
        .get('/api/notifications?page=1&pageSize=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.pagination).toBeDefined();
    });

    it('应该返回未读数量', async () => {
      const response = await request(BASE_URL)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('unreadCount');
    });
  });

  describe('POST /api/notifications/:id/read - 标记已读', () => {
    it('应该成功标记单条通知为已读', async () => {
      const response = await request(BASE_URL)
        .post('/api/notifications/1/read')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.read).toBe(true);
    });

    it('通知不存在应返回404', async () => {
      const response = await request(BASE_URL)
        .post('/api/notifications/99999/read')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('POST /api/notifications/read-all - 全部标记已读', () => {
    it('应该成功标记所有通知为已读', async () => {
      const response = await request(BASE_URL)
        .post('/api/notifications/read-all')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });

    it('应该返回已读数量', async () => {
      const response = await request(BASE_URL)
        .post('/api/notifications/read-all')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('count');
    });
  });

  describe('DELETE /api/notifications/:id - 删除通知', () => {
    it('应该成功删除通知', async () => {
      // 先创建一条通知
      const createRes = await request(BASE_URL)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '测试通知',
          content: '测试内容',
          userId: testUserId
        });
      
      const notifId = createRes.body.id;

      const response = await request(BASE_URL)
        .delete(`/api/notifications/${notifId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('删除不存在的通知应返回404', async () => {
      const response = await request(BASE_URL)
        .delete('/api/notifications/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('无权限删除应返回403', async () => {
      const response = await request(BASE_URL)
        .delete('/api/notifications/1')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('POST /api/notifications - 创建通知', () => {
    it('应该成功创建通知', async () => {
      const response = await request(BASE_URL)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '新通知',
          content: '通知内容',
          userId: testUserId,
          type: 'system'
        })
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      testNotificationId = response.body.id;
    });

    it('缺少必填字段应返回400', async () => {
      const response = await request(BASE_URL)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: '只有标题' })
        .expect(400);
    });

    it('无权限创建应返回403', async () => {
      const response = await request(BASE_URL)
        .post('/api/notifications')
        .send({
          title: '尝试创建',
          content: '无权限'
        })
        .expect(401);
    });

    it('支持指定通知类型', async () => {
      const response = await request(BASE_URL)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '借阅提醒',
          content: '请尽快归还图书',
          userId: testUserId,
          type: 'borrow_reminder'
        })
        .expect(201);
      
      expect(response.body.type).toBe('borrow_reminder');
    });
  });
});
