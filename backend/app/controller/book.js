/* eslint-disable */
const Controller = require('egg').Controller;

class BookController extends Controller {
  // 获取图书列表
  async list() {
    const { ctx } = this;
    const { page = 1, pageSize = 10, keyword, category } = ctx.query;

    try {
      const result = await ctx.service.book.getList({ page, pageSize, keyword, category });
      ctx.success(result);
    } catch (e) {
      ctx.fail(e.message);
    }
  }

  // 获取图书详情
  async detail() {
    const { ctx } = this;
    const { id } = ctx.params;

    try {
      const book = await ctx.service.book.getDetail(id);
      ctx.success(book);
    } catch (e) {
      ctx.fail(e.message);
    }
  }

  // 添加图书
  async create() {
    const { ctx } = this;
    const data = ctx.request.body;

    try {
      const book = await ctx.service.book.create(data);
      ctx.success(book, '图书添加成功');
    } catch (e) {
      ctx.fail(e.message);
    }
  }

  // 更新图书
  async update() {
    const { ctx } = this;
    const { id } = ctx.params;
    const data = ctx.request.body;

    try {
      const book = await ctx.service.book.update(id, data);
      ctx.success(book, '图书更新成功');
    } catch (e) {
      ctx.fail(e.message);
    }
  }

  // 删除图书
  async delete() {
    const { ctx } = this;
    const { id } = ctx.params;

    try {
      await ctx.service.book.delete(id);
      ctx.success(null, '图书删除成功');
    } catch (e) {
      ctx.fail(e.message);
    }
  }

  // 获取分类列表
  async categories() {
    const { ctx } = this;

    try {
      const categories = await ctx.service.book.getCategories();
      ctx.success(categories);
    } catch (e) {
      ctx.fail(e.message);
    }
  }

  // 导入图书
  async import() {
    const { ctx } = this;
    const { books } = ctx.request.body;

    try {
      const results = await ctx.service.book.importBooks(books);
      ctx.success(results, `成功导入 ${results.length} 本图书`);
    } catch (e) {
      ctx.fail(e.message);
    }
  }

  // 导出图书
  async export() {
    const { ctx } = this;

    try {
      const books = await ctx.service.book.exportAll();
      ctx.success(books);
    } catch (e) {
      ctx.fail(e.message);
    }
  }
}

module.exports = BookController;