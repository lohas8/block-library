/* eslint-disable */
const { BaseController } = require('../core/base_controller');

class BookController extends BaseController {
  // 获取图书列表
  async list() {
    const { ctx } = this;
    const { page = 1, pageSize = 10, keyword, category } = ctx.query;

    try {
      const result = await ctx.service.book.getList({ page, pageSize, keyword, category });
      this.success(result);
    } catch (e) {
      this.fail(e.message);
    }
  }

  // 获取图书详情
  async detail() {
    const { ctx } = this;
    const { id } = ctx.params;

    try {
      const book = await ctx.service.book.getDetail(id);
      this.success(book);
    } catch (e) {
      this.fail(e.message);
    }
  }

  // 添加图书
  async create() {
    this.requireAuth();
    const { ctx } = this;
    const data = ctx.request.body;

    if (!data.title) {
      return this.fail('图书标题必填', -1, 400);
    }

    try {
      const book = await ctx.service.book.create(data);
      this.success(book, '图书添加成功');
    } catch (e) {
      this.fail(e.message);
    }
  }

  // 更新图书
  async update() {
    const { ctx } = this;
    const { id } = ctx.params;
    const data = ctx.request.body;

    try {
      const book = await ctx.service.book.update(id, data);
      this.success(book, '图书更新成功');
    } catch (e) {
      this.fail(e.message);
    }
  }

  // 删除图书
  async delete() {
    const { ctx } = this;
    const { id } = ctx.params;

    try {
      await ctx.service.book.delete(id);
      this.success(null, '图书删除成功');
    } catch (e) {
      this.fail(e.message);
    }
  }

  // 获取分类列表
  async categories() {
    const { ctx } = this;

    try {
      const categories = await ctx.service.book.getCategories();
      this.success(categories);
    } catch (e) {
      this.fail(e.message);
    }
  }

  // 导入图书
  async import() {
    const { ctx } = this;
    const { books } = ctx.request.body;

    try {
      const results = await ctx.service.book.importBooks(books);
      this.success(results, `成功导入 ${results.length} 本图书`);
    } catch (e) {
      this.fail(e.message);
    }
  }

  // 导出图书
  async export() {
    const { ctx } = this;

    try {
      const books = await ctx.service.book.exportAll();
      this.success(books);
    } catch (e) {
      this.fail(e.message);
    }
  }
}

module.exports = BookController;