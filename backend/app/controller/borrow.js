/* eslint-disable */
const { BaseController } = require('../core/base_controller');

class BorrowController extends BaseController {
  // 借阅图书（需登录）
  async borrow() {
    this.requireAuth();
    const { ctx } = this;
    const { bookId, userId, userName, dueDate } = ctx.request.body;

    try {
      const record = await ctx.service.borrow.borrow({ bookId, userId, userName, dueDate });
      this.success(record, '借阅成功');
    } catch (e) {
      this.fail(e.message, -1, 400);
    }
  }

  // 归还图书（需登录）
  async return() {
    this.requireAuth();
    const { ctx } = this;
    const { id } = ctx.params;

    try {
      const record = await ctx.service.borrow.return(id);
      this.success(record, '归还成功');
    } catch (e) {
      this.fail(e.message, -1, 400);
    }
  }

  // 获取借阅记录列表（需登录）
  async list() {
    this.requireAuth();
    const { ctx } = this;
    const { page = 1, pageSize = 10, status, userId, bookId } = ctx.query;
    const operator = ctx.state.user || {};

    try {
      const result = await ctx.service.borrow.getList({
        page, pageSize, status, bookId,
        userId: operator.id,
        userRole: operator.role,
      });
      this.success(result);
    } catch (e) {
      this.fail(e.message, -1, 400);
    }
  }

  // 预约图书（需登录）
  async reserve() {
    this.requireAuth();
    const { ctx } = this;
    const { bookId, userId } = ctx.request.body;

    try {
      const reservation = await ctx.service.borrow.reserve({ bookId, userId });
      this.success(reservation, '预约成功');
    } catch (e) {
      this.fail(e.message, -1, 400);
    }
  }

  // 取消预约（需登录）
  async cancelReserve() {
    this.requireAuth();
    const { ctx } = this;
    const { id } = ctx.params;

    try {
      const reservation = await ctx.service.borrow.cancelReserve(id);
      this.success(reservation, '取消预约成功');
    } catch (e) {
      this.fail(e.message, -1, 400);
    }
  }

  // 获取预约列表（需登录）
  async reservationList() {
    this.requireAuth();
    const { ctx } = this;
    const { userId, status } = ctx.query;

    try {
      const list = await ctx.service.borrow.getReservationList({ userId, status });
      this.success(list);
    } catch (e) {
      this.fail(e.message, -1, 400);
    }
  }

  // 统计接口（需登录）
  async statistics() {
    this.requireAuth();
    const { ctx } = this;

    try {
      const stats = await ctx.service.borrow.getStatistics();
      this.success(stats);
    } catch (e) {
      this.fail(e.message, -1, 400);
    }
  }
}

module.exports = BorrowController;
