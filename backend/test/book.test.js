/**
 * 图书接口测试
 */

const request = require('supertest');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:7001';

describe('图书接口测试', () => {
  let adminToken;
  let testBookId;

  beforeAll(async () => {
    // 登录管理员
    await request(BASE_URL)
      .post('/api/users/register')
      .send({ username: 'bookadmin2', password: 'admin123', name: 'BookAdmin2', role: 'admin' })
      .catch(() => {});

    const loginRes = await request(BASE_URL)
      .post('/api/users/login')
      .send({ username: 'bookadmin2', password: 'admin123' });
    adminToken = loginRes.body.data.token;
  });

  describe('GET /api/books - 图书列表', () => {
    it('应该返回图书列表', async () => {
      const response = await request(BASE_URL)
        .get('/api/books')
        .expect(200);

      expect(response.body.data).toHaveProperty('list');
      expect(Array.isArray(response.body.data.list)).toBe(true);
    });

    it('支持分页参数', async () => {
      const response = await request(BASE_URL)
        .get('/api/books?page=1&pageSize=10')
        .expect(200);

      expect(response.body.data).toHaveProperty('page');
      expect(response.body.data).toHaveProperty('pageSize');
    });

    it('支持搜索参数', async () => {
      const response = await request(BASE_URL)
        .get('/api/books?keyword=测试')
        .expect(200);

      expect(Array.isArray(response.body.data.list)).toBe(true);
    });
  });

  describe('GET /api/books/categories - 图书分类', () => {
    it('应该返回分类列表', async () => {
      const response = await request(BASE_URL)
        .get('/api/books/categories')
        .expect(200);

      expect(Array.isArray(response.body.data.list) || Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/books/:id - 图书详情', () => {
    it('应该返回指定图书详情', async () => {
      // 先创建一本图书
      const createRes = await request(BASE_URL)
        .post('/api/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: '详情测试图书', author: '作者', total: 3, available: 3 });
      const bookId = createRes.body.data._id;

      const response = await request(BASE_URL)
        .get(`/api/books/${bookId}`)
        .expect(200);

      expect(response.body.data.title).toBe('详情测试图书');
    });

    it('图书不存在时应返回404', async () => {
      const response = await request(BASE_URL)
        .get('/api/books/507f1f77bcf86cd799439011')
        .expect(404);
    });
  });

  describe('POST /api/books - 创建图书（需管理员）', () => {
    it('应该成功创建图书', async () => {
      const newBook = {
        title: '新测试图书_' + Date.now(),
        author: '测试作者',
        category: '技术',
        total: 5,
        available: 5,
      };

      const response = await request(BASE_URL)
        .post('/api/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newBook)
        .expect(200);

      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.title).toBe(newBook.title);
      testBookId = response.body.data._id;
    });

    it('缺少必填字段应返回400', async () => {
      const response = await request(BASE_URL)
        .post('/api/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: '只有标题' })
        .expect(400);
    });

    it('无管理员权限应返回403', async () => {
      // 注册普通用户
      await request(BASE_URL)
        .post('/api/users/register')
        .send({ username: 'normaluser_book', password: '123456', name: 'Normal' })
        .catch(() => {});
      const userLogin = await request(BASE_URL)
        .post('/api/users/login')
        .send({ username: 'normaluser_book', password: '123456' });
      const userToken = userLogin.body.data.token;

      const response = await request(BASE_URL)
        .post('/api/books')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: '测试' })
        .expect(403);
    });
  });

  describe('PUT /api/books/:id - 更新图书（需管理员）', () => {
    it('应该成功更新图书信息', async () => {
      if (!testBookId) this.skip();

      const response = await request(BASE_URL)
        .put(`/api/books/${testBookId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: '更新后的标题' })
        .expect(200);

      expect(response.body.data.title).toBe('更新后的标题');
    });

    it('更新不存在的图书应返回404', async () => {
      const response = await request(BASE_URL)
        .put('/api/books/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: '测试' })
        .expect(404);
    });
  });

  describe('DELETE /api/books/:id - 删除图书（需管理员）', () => {
    it('应该成功删除图书', async () => {
      if (!testBookId) this.skip();

      await request(BASE_URL)
        .delete(`/api/books/${testBookId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('删除不存在的图书应返回404', async () => {
      const response = await request(BASE_URL)
        .delete('/api/books/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('POST /api/books/import - 导入图书（需管理员）', () => {
    it('无文件上传应返回400', async () => {
      const response = await request(BASE_URL)
        .post('/api/books/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });
});
