/* eslint-disable */
const Controller = require('egg').Controller;

class BorrowController extends Controller {
  // 借阅图书
  async borrow() {
    const { ctx } = this;
    const { bookId, userId } = ctx.request.body;

    // 检查图书是否存在且可借
    const book = await ctx.model.Book.findById(bookId);
    if (!book) {
      return ctx.fail('图书不存在');
    }
    if (book.available <= 0) {
      return ctx.fail('该图书已全部借出');
    }

    // 检查用户借阅数量是否超限
    const borrowCount = await ctx.model.BorrowRecord.countDocuments({
      userId,
      status: 'borrowed',
    });
    if (borrowCount >= ctx.config.borrow.maxBooks) {
      return ctx.fail(`最多同时借阅 ${ctx.config.borrow.maxBooks} 本书`);
    }

    // 检查用户积分是否足够
    const user = await ctx.model.User.findById(userId);
    if (user.points < ctx.config.points.borrowBook) {
      return ctx.fail('积分不足，借阅需要扣除积分');
    }

    // 创建借阅记录
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + ctx.config.borrow.maxDays);

    const record = await ctx.model.BorrowRecord.create({
      bookId,
      userId,
      dueDate,
      status: 'borrowed',
    });

    // 更新图书可借数量
    book.available -= 1;
    await book.save();

    // 扣除积分
    user.points -= ctx.config.points.borrowBook;
    await user.save();

    // 发送站内通知
    await ctx.model.Notification.create({
      userId,
      title: '借阅成功',
      content: `您已成功借阅《${book.title}》，请在 ${ctx.config.borrow.maxDays} 天内归还`,
      type: 'success',
    });

    ctx.success(record, '借阅成功');
  }

  // 归还图书
  async return() {
    const { ctx } = this;
    const { id } = ctx.params;

    const record = await ctx.model.BorrowRecord.findById(id);
    if (!record) {
      return ctx.fail('借阅记录不存在');
    }
    if (record.status !== 'borrowed') {
      return ctx.fail('该图书已归还');
    }

    // 更新借阅记录
    record.status = 'returned';
    record.returnDate = new Date();
    await record.save();

    // 更新图书可借数量
    const book = await ctx.model.Book.findById(record.bookId);
    book.available += 1;
    await book.save();

    // 发送站内通知
    await ctx.model.Notification.create({
      userId: record.userId,
      title: '归还成功',
      content: `您已成功归还《${book.title}》，感谢您的阅读！`,
      type: 'success',
    });

    ctx.success(record, '归还成功');
  }

  // 获取借阅记录列表
  async list() {
    const { ctx } = this;
    const { page = 1, pageSize = 10, status, userId, bookId } = ctx.query;

    const query = {};
    if (status) query.status = status;
    if (userId) query.userId = userId;
    if (bookId) query.bookId = bookId;

    const total = await ctx.model.BorrowRecord.countDocuments(query);
    const list = await ctx.model.BorrowRecord.find(query)
      .populate('bookId')
      .populate('userId', 'name username')
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ borrowDate: -1 });

    ctx.success({ list, total, page: parseInt(page), pageSize: parseInt(pageSize) });
  }

  // 预约图书
  async reserve() {
    const { ctx } = this;
    const { bookId, userId } = ctx.request.body;

    // 检查图书是否存在
    const book = await ctx.model.Book.findById(bookId);
    if (!book) {
      return ctx.fail('图书不存在');
    }

    // 检查是否已有预约
    const existReservation = await ctx.model.Reservation.findOne({
      bookId,
      userId,
      status: 'pending',
    });
    if (existReservation) {
      return ctx.fail('您已预约过该图书');
    }

    const reservation = await ctx.model.Reservation.create({
      bookId,
      userId,
      status: 'pending',
    });

    ctx.success(reservation, '预约成功');
  }

  // 取消预约
  async cancelReserve() {
    const { ctx } = this;
    const { id } = ctx.params;

    const reservation = await ctx.model.Reservation.findByIdAndUpdate(
      id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!reservation) {
      return ctx.fail('预约记录不存在');
    }

    ctx.success(reservation, '取消预约成功');
  }

  // 获取预约列表
  async reservationList() {
    const { ctx } = this;
    const { userId, status } = ctx.query;

    const query = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;

    const list = await ctx.model.Reservation.find(query)
      .populate('bookId')
      .populate('userId', 'name username')
      .sort({ reserveDate: -1 });

    ctx.success(list);
  }

  // 统计接口
  async statistics() {
    const { ctx } = this;

    // 图书总数
    const totalBooks = await ctx.model.Book.countDocuments();
    // 可借数量
    const availableBooks = await ctx.model.Book.aggregate([
      { $group: { _id: null, total: { $sum: '$available' } } },
    ]);
    // 借阅中数量
    const borrowedCount = await ctx.model.BorrowRecord.countDocuments({ status: 'borrowed' });
    // 用户总数
    const totalUsers = await ctx.model.User.countDocuments();
    // 借阅排行（Top 10）
    const topBorrowed = await ctx.model.BorrowRecord.aggregate([
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
    const borrowTrend = await ctx.model.BorrowRecord.aggregate([
      { $match: { borrowDate: { $gte: weekAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$borrowDate' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    ctx.success({
      totalBooks,
      availableBooks: availableBooks[0]?.total || 0,
      borrowedCount,
      totalUsers,
      topBorrowed,
      borrowTrend,
    });
  }
}

module.exports = BorrowController;
