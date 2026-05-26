/**
 * BookService - 图书模块业务逻辑层
 * 负责图书相关的业务逻辑、数据组装
 */
const Service = require('egg').Service;

class BookService extends Service {
  /**
   * 图书列表（支持分类筛选 + 关键词搜索）
   */
  async getList({ category, page = 1, pageSize = 20, keyword }) {
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

    const total = await this.ctx.model.Book.countDocuments(query);
    const list = await this.ctx.model.Book.find(query)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ createdAt: -1 });
    return { list, total, page: parseInt(page), pageSize: parseInt(pageSize) };
  }

  /**
   * 图书详情
   */
  async getDetail(id) {
    const book = await this.ctx.model.Book.findById(id);
    if (!book) {
      throw new Error('图书不存在');
    }
    return book;
  }

  /**
   * 创建图书
   */
  async create(data) {
    const book = await this.ctx.model.Book.create(data);
    return book;
  }

  /**
   * 更新图书
   */
  async update(id, data) {
    const book = await this.ctx.model.Book.findByIdAndUpdate(id, data, { new: true });
    if (!book) {
      throw new Error('图书不存在');
    }
    return book;
  }

  /**
   * 删除图书
   */
  async delete(id) {
    // 检查是否有未归还的借阅记录
    const borrowRecord = await this.ctx.model.BorrowRecord.findOne({
      bookId: id,
      status: 'borrowed',
    });
    if (borrowRecord) {
      throw new Error('该图书有未归还的借阅记录，无法删除');
    }

    const result = await this.ctx.model.Book.findByIdAndDelete(id);
    if (!result) {
      throw new Error('图书不存在');
    }
    return true;
  }

  /**
   * 图书分类列表
   */
  async getCategories() {
    return this.ctx.model.Book.distinct('category');
  }

  /**
   * 批量导入图书
   */
  async importBooks(books) {
    if (!books || !Array.isArray(books)) {
      throw new Error('请提供图书列表');
    }
    const results = [];
    for (const book of books) {
      const created = await this.ctx.model.Book.create(book);
      results.push(created);
    }
    return results;
  }

  /**
   * 导出图书
   */
  async exportAll() {
    return this.ctx.model.Book.find().select('-__v');
  }
}

module.exports = BookService;