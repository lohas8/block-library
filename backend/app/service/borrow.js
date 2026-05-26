/**
 * BorrowService - 借阅模块业务逻辑层
 * 负责借阅相关的业务逻辑、数据组装
 */
const Service = require('egg').Service;

class BorrowService extends Service {
  /**
   * 借阅列表（管理员看全部，用户看自己）
   */
  async getList({ userId, userRole, page = 1, pageSize = 20, status, bookId }) {
    const query = {};
    if (status) query.status = status;
    if (bookId) query.bookId = bookId;

    // 普通用户只能看自己的记录
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      query.userId = userId;
    } else if (userId) {
      // 管理员可以指定查看某个用户的记录
      query.userId = userId;
    }

    const total = await this.ctx.model.BorrowRecord.countDocuments(query);
    const list = await this.ctx.model.BorrowRecord.find(query)
      .populate('bookId')
      .populate('userId', 'name username')
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ borrowDate: -1 });
    return { list, total, page: parseInt(page), pageSize: parseInt(pageSize) };
  }

  /**
   * 借书
   */
  async borrow({ bookId, userId, userName, dueDate }) {
    // 检查图书是否存在且可借
    const book = await this.ctx.model.Book.findById(bookId);
    if (!book) {
      throw new Error('图书不存在');
    }
    if (book.available <= 0) {
      throw new Error('该图书已全部借出');
    }

    // 检查用户借阅数量是否超限
    const borrowCount = await this.ctx.model.BorrowRecord.countDocuments({
      userId,
      status: 'borrowed',
    });
    if (borrowCount >= this.ctx.config.borrow.maxBooks) {
      throw new Error(`最多同时借阅 ${this.ctx.config.borrow.maxBooks} 本书`);
    }

    // 检查用户积分是否足够
    const user = await this.ctx.model.User.findById(userId);
    if (user.points < this.ctx.config.points.borrowBook) {
      throw new Error('积分不足，借阅需要扣除积分');
    }

    // 计算应还日期
    const actualDueDate = dueDate || new Date(Date.now() + this.ctx.config.borrow.maxDays * 24 * 60 * 60 * 1000);

    // 创建借阅记录
    const record = await this.ctx.model.BorrowRecord.create({
      bookId,
      userId,
      userName,
      dueDate: actualDueDate,
      status: 'borrowed',
    });

    // 更新图书可借数量
    book.available -= 1;
    await book.save();

    // 扣除积分
    user.points -= this.ctx.config.points.borrowBook;
    await user.save();

    // 发送站内通知
    await this.ctx.model.Notification.create({
      userId,
      title: '借阅成功',
      content: `您已成功借阅《${book.title}》，请在 ${this.ctx.config.borrow.maxDays} 天内归还`,
      type: 'success',
    });

    return record;
  }

  /**
   * 归还图书
   */
  async return(recordId) {
    const record = await this.ctx.model.BorrowRecord.findById(recordId);
    if (!record) {
      throw new Error('借阅记录不存在');
    }
    if (record.status !== 'borrowed') {
      throw new Error('该图书已归还');
    }

    // 更新借阅记录
    record.status = 'returned';
    record.returnDate = new Date();
    await record.save();

    // 更新图书可借数量
    const book = await this.ctx.model.Book.findById(record.bookId);
    book.available += 1;
    await book.save();

    // 发送站内通知
    await this.ctx.model.Notification.create({
      userId: record.userId,
      title: '归还成功',
      content: `您已成功归还《${book.title}》，感谢您的阅读！`,
      type: 'success',
    });

    return record;
  }

  /**
   * 借阅统计
   */
  async getStatistics() {
    // 图书总数
    const totalBooks = await this.ctx.model.Book.countDocuments();
    // 可借数量
    const availableBooks = await this.ctx.model.Book.aggregate([
      { $group: { _id: null, total: { $sum: '$available' } } },
    ]);
    // 借阅中数量
    const borrowedCount = await this.ctx.model.BorrowRecord.countDocuments({ status: 'borrowed' });
    // 用户总数
    const totalUsers = await this.ctx.model.User.countDocuments();
    // 借阅排行（Top 10）
    const topBorrowed = await this.ctx.model.BorrowRecord.aggregate([
      { $group: { _id: '$bookId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'book',
        },
      },
      { $unwind: '$book' },
      { $project: { title: '$book.title', author: '$book.author', count: 1 } },
    ]);
    // 借阅统计（最近7天）
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const borrowTrend = await this.ctx.model.BorrowRecord.aggregate([
      { $match: { borrowDate: { $gte: weekAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$borrowDate' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      totalBooks,
      availableBooks: availableBooks[0]?.total || 0,
      borrowedCount,
      totalUsers,
      topBorrowed,
      borrowTrend,
    };
  }

  /**
   * 获取用户的借阅记录
   */
  async getByUserId(userId, { page = 1, pageSize = 20, status }) {
    const query = { userId };
    if (status) query.status = status;

    const total = await this.ctx.model.BorrowRecord.countDocuments(query);
    const list = await this.ctx.model.BorrowRecord.find(query)
      .populate('bookId')
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ borrowDate: -1 });
    return { list, total, page: parseInt(page), pageSize: parseInt(pageSize) };
  }

  /**
   * 预约图书
   */
  async reserve({ bookId, userId }) {
    // 检查图书是否存在
    const book = await this.ctx.model.Book.findById(bookId);
    if (!book) {
      throw new Error('图书不存在');
    }

    // 检查是否已有预约
    const existReservation = await this.ctx.model.Reservation.findOne({
      bookId,
      userId,
      status: 'pending',
    });
    if (existReservation) {
      throw new Error('您已预约过该图书');
    }

    return this.ctx.model.Reservation.create({
      bookId,
      userId,
      status: 'pending',
    });
  }

  /**
   * 取消预约
   */
  async cancelReserve(reservationId) {
    const reservation = await this.ctx.model.Reservation.findByIdAndUpdate(
      reservationId,
      { status: 'cancelled' },
      { new: true }
    );
    if (!reservation) {
      throw new Error('预约记录不存在');
    }
    return reservation;
  }

  /**
   * 获取预约列表
   */
  async getReservationList({ userId, status }) {
    const query = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;

    return this.ctx.model.Reservation.find(query)
      .populate('bookId')
      .populate('userId', 'name username')
      .sort({ reserveDate: -1 });
  }
}

module.exports = BorrowService;