/* eslint-disable */
const Controller = require('egg').Controller;

class BookController extends Controller {
  // 获取图书列表
  async list() {
    const { ctx } = this;
    const { page = 1, pageSize = 10, keyword, category } = ctx.query;
    
    const query = {};
    if (keyword) {
      query.$or = [
        { title: new RegExp(keyword, 'i') },
        { author: new RegExp(keyword, 'i') },
        { isbn: new RegExp(keyword, 'i') },
      ];
    }
    if (category) {
      query.category = category;
    }

    const total = await ctx.model.Book.countDocuments(query);
    const list = await ctx.model.Book.find(query)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ createdAt: -1 });

    ctx.success({ list, total, page: parseInt(page), pageSize: parseInt(pageSize) });
  }

  // 获取图书详情
  async detail() {
    const { ctx } = this;
    const { id } = ctx.params;
    
    const book = await ctx.model.Book.findById(id);
    if (!book) {
      return ctx.fail('图书不存在');
    }

    ctx.success(book);
  }

  // 添加图书
  async create() {
    const { ctx } = this;
    const data = ctx.request.body;

    const book = await ctx.model.Book.create(data);
    ctx.success(book, '图书添加成功');
  }

  // 更新图书
  async update() {
    const { ctx } = this;
    const { id } = ctx.params;
    const data = ctx.request.body;

    const book = await ctx.model.Book.findByIdAndUpdate(id, data, { new: true });
    if (!book) {
      return ctx.fail('图书不存在');
    }

    ctx.success(book, '图书更新成功');
  }

  // 删除图书
  async delete() {
    const { ctx } = this;
    const { id } = ctx.params;

    // 检查是否有未归还的借阅记录
    const borrowRecord = await ctx.model.BorrowRecord.findOne({
      bookId: id,
      status: 'borrowed',
    });
    if (borrowRecord) {
      return ctx.fail('该图书有未归还的借阅记录，无法删除');
    }

    await ctx.model.Book.findByIdAndDelete(id);
    ctx.success(null, '图书删除成功');
  }

  // 获取分类列表
  async categories() {
    const { ctx } = this;
    
    const categories = await ctx.model.Book.distinct('category');
    ctx.success(categories);
  }

  // 导入图书
  async import() {
    const { ctx } = this;
    const { books } = ctx.request.body;

    if (!books || !Array.isArray(books)) {
      return ctx.fail('请提供图书列表');
    }

    const results = [];
    for (const book of books) {
      const created = await ctx.model.Book.create(book);
      results.push(created);
    }

    ctx.success(results, `成功导入 ${results.length} 本图书`);
  }

  // 导出图书
  async export() {
    const { ctx } = this;
    
    const books = await ctx.model.Book.find().select('-__v');
    ctx.success(books);
  }
}

module.exports = BookController;
