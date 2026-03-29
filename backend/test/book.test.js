/**
 * 图书接口测试
 * 测试所有图书相关的 API 接口
 */

const request = require('supertest');

// 由于 Egg.js 需要完整的应用上下文，我们创建 mock 测试
// 实际运行时需要先启动应用服务器

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:7001';

describe('图书接口测试', () => {
  let app;
  let authToken;
  let testBookId;

  beforeAll(async () => {
    // 启动应用或获取已启动的应用实例
    // 这里假设测试服务器已启动
  });

  describe('GET /api/books - 图书列表', () => {
    it('应该返回图书列表', async () => {
      const response = await request(BASE_URL)
        .get('/api/books')
        .expect('Content-Type', /json/);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('list');
      expect(Array.isArray(response.body.list)).toBe(true);
    });

    it('支持分页参数', async () => {
      const response = await request(BASE_URL)
        .get('/api/books?page=1&pageSize=10')
        .expect(200);
      
      expect(response.body).toHaveProperty('pagination');
    });

    it('支持搜索参数', async () => {
      const response = await request(BASE_URL)
        .get('/api/books?keyword=python')
        .expect(200);
      
      expect(response.body.list).toBeDefined();
    });
  });

  describe('GET /api/books/categories - 图书分类', () => {
    it('应该返回分类列表', async () => {
      const response = await request(BASE_URL)
        .get('/api/books/categories')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/books/:id - 图书详情', () => {
    it('应该返回指定图书详情', async () => {
      const response = await request(BASE_URL)
        .get('/api/books/1')
        .expect(200);
      
      expect(response.body).toHaveProperty('id');
    });

    it('图书不存在时应返回错误', async () => {
      const response = await request(BASE_URL)
        .get('/api/books/99999')
        .expect(404);
      
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/books - 创建图书', () => {
    it('应该成功创建图书', async () => {
      const newBook = {
        title: '测试图书',
        author: '测试作者',
        isbn: '978-7-111-00000-0',
        category: '技术',
        stock: 5
      };

      const response = await request(BASE_URL)
        .post('/api/books')
        .send(newBook)
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      testBookId = response.body.id;
    });

    it('缺少必填字段应返回错误', async () => {
      const response = await request(BASE_URL)
        .post('/api/books')
        .send({ title: '只有标题' })
        .expect(400);
      
      expect(response.body).toHaveProperty('message');
    });

    it('重复ISBN应返回错误', async () => {
      const response = await request(BASE_URL)
        .post('/api/books')
        .send({
          title: '重复ISBN',
          isbn: '978-7-111-00000-0' // 与上面重复
        })
        .expect(400);
    });
  });

  describe('PUT /api/books/:id - 更新图书', () => {
    it('应该成功更新图书信息', async () => {
      const response = await request(BASE_URL)
        .put(`/api/books/${testBookId}`)
        .send({ title: '更新后的标题' })
        .expect(200);
      
      expect(response.body.title).toBe('更新后的标题');
    });

    it('更新不存在的图书应返回错误', async () => {
      const response = await request(BASE_URL)
        .put('/api/books/99999')
        .send({ title: '测试' })
        .expect(404);
    });
  });

  describe('DELETE /api/books/:id - 删除图书', () => {
    it('应该成功删除图书', async () => {
      await request(BASE_URL)
        .delete(`/api/books/${testBookId}`)
        .expect(200);
    });

    it('删除不存在的图书应返回错误', async () => {
      const response = await request(BASE_URL)
        .delete('/api/books/99999')
        .expect(404);
    });
  });

  describe('POST /api/books/import - 导入图书', () => {
    it('应该支持Excel导入', async () => {
      const response = await request(BASE_URL)
        .post('/api/books/import')
        .attach('file', Buffer.from('test'), 'books.xlsx')
        .expect(200);
      
      expect(response.body).toHaveProperty('success');
    });

    it('无文件上传应返回错误', async () => {
      const response = await request(BASE_URL)
        .post('/api/books/import')
        .expect(400);
    });
  });

  describe('GET /api/books/export - 导出图书', () => {
    it('应该导出Excel文件', async () => {
      const response = await request(BASE_URL)
        .get('/api/books/export')
        .expect(200);
      
      expect(response.headers['content-type']).toContain('application/vnd.openxmlformats');
    });
  });
});
