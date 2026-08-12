/**
 * 通知接口测试
 * 测试所有通知相关的 API 接口
 */

const request = require('supertest');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:7001';

describe('通知接口测试', () => {
  let authToken;
  let testNotificationId;
  let testUserId;

  beforeAll(async () => {
    // 注册并登录
    await request(BASE_URL)
      .post('/api/users/register')
      .send({ username: 'notifuser', password: 'test123', name: 'NotifUser' })
      .catch(() => {});

    const loginRes = await request(BASE_URL)
      .post('/api/users/login')
      .send({ username: 'notifuser', password: 'test123' });

    authToken = loginRes.body.data.token;
    testUserId = loginRes.body.data.user.id;
  });

  describe('GET /api/notifications - 通知列表', () => {
    it('应该返回通知列表', async () => {
      const response = await request(BASE_URL)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data.list)).toBe(true);
    });

    it('未授权应返回401', async () => {
      const response = await request(BASE_URL)
        .get('/api/notifications')
        .expect(401);
    });

    it('支持已读/未读筛选', async () => {
      const response = await request(BASE_URL)
        .get('/api/notifications?unread=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.data.list.forEach(item => {
        expect(item.read).toBe(false);
      });
    });

    it('支持分页', async () => {
      const response = await request(BASE_URL)
        .get('/api/notifications?page=1&pageSize=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('page');
      expect(response.body.data).toHaveProperty('pageSize');
    });

    it('应该返回未读数量', async () => {
      const response = await request(BASE_URL)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('unreadCount');
    });
  });

  describe('POST /api/notifications/:id/read - 标记已读', () => {
    it('应该成功标记单条通知为已读', async () => {
      // 先创建一条通知
      const createRes = await request(BASE_URL)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '测试通知',
          content: '测试内容',
          userId: testUserId
        });

      const notifId = createRes.body.data._id;

      const response = await request(BASE_URL)
        .post(`/api/notifications/${notifId}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.msg).toBe('标记成功');
    });

    it('通知不存在应返回404', async () => {
      const response = await request(BASE_URL)
        .post('/api/notifications/507f1f77bcf86cd799439011/read')
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

      expect(response.body.msg).toBe('全部标记已读');
    });
  });

  describe('DELETE /api/notifications/:id - 删除通知', () => {
    it('应该成功删除通知', async () => {
      // 先创建一条通知
      const createRes = await request(BASE_URL)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '待删除通知',
          content: '测试内容',
          userId: testUserId
        });

      const notifId = createRes.body.data._id;

      const response = await request(BASE_URL)
        .delete(`/api/notifications/${notifId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.msg).toBe('删除成功');
    });

    it('删除不存在的通知应返回404', async () => {
      const response = await request(BASE_URL)
        .delete('/api/notifications/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
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
        .expect(200);

      expect(response.body.msg).toBe('发送成功');
    });

    it('缺少必填字段应返回400', async () => {
      const response = await request(BASE_URL)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: '只有标题' })
        .expect(400);
    });

    it('无权限创建应返回401', async () => {
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
        .expect(200);
    });
  });
});
