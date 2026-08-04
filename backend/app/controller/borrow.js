/* eslint-disable */
const { BaseController } = require('../core/base_controller');

class BorrowController extends BaseController {
  // 借阅图书
  async borrow() {
    const { ctx } = this;
    const { bookId, userId, userName, dueDate } = ctx.request.body;

    try {
      const record = await ctx.service.borrow.borrow({ bookId, userId, userName, dueDate });
      ctx.success(record, '借阅成功');
    } catch (e) {
      ctx.fail(e.message);
    }
  }

  // 归还图书
  async return() {
    const { ctx } = this;
    const { id } = ctx.params;

    try {
      const record = await ctx.service.borrow.return(id);
      ctx.success(record, '归还成功');
    } catch (e) {
      ctx.fail(e.message);
    }
  }

  // 获取借阅记录列表
  async list() {
    const { ctx } = this;
    const { page = 1, pageSize = 10, status, userId, bookId } = ctx.query;
    const operator = ctx.state.user || {};

    try {
      const result = await ctx.service.borrow.getList({
        page, pageSize, status, userId, bookId,
        userId: operator.id,
        userRole: operator.role,
      });
      ctx.success(result);
    } catch (e) {
      ctx.fail(e.message);
    }
  }

  // 预约图书
  async reserve() {
    const { ctx } = this;
    const { bookId, userId } = ctx.request.body;

    try {
      const reservation = await ctx.service.borrow.reserve({ bookId, userId });
      ctx.success(reservation, '预约成功');
    } catch (e) {
      ctx.fail(e.message);
    }
  }

  // 取消预约
  async cancelReserve() {
    const { ctx } = this;
    const { id } = ctx.params;

    try {
      const reservation = await ctx.service.borrow.cancelReserve(id);
      ctx.success(reservation, '取消预约成功');
    } catch (e) {
      ctx.fail(e.message);
    }
  }

  // 获取预约列表
  async reservationList() {
    const { ctx } = this;
    const { userId, status } = ctx.query;

    try {
      const list = await ctx.service.borrow.getReservationList({ userId, status });
      ctx.success(list);
    } catch (e) {
      ctx.fail(e.message);
    }
  }

  // 统计接口
  async statistics() {
    const { ctx } = this;

    try {
      const stats = await ctx.service.borrow.getStatistics();
      ctx.success(stats);
    } catch (e) {
      ctx.fail(e.message);
    }
  }
}

module.exports = BorrowController;