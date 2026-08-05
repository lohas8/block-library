/* eslint-disable */
const { BaseController } = require('../core/base_controller');

class NotificationController extends BaseController {
  // 获取用户通知列表（需登录）
  async list() {
    this.requireAuth();
    const { ctx } = this;
    const { page = 1, pageSize = 10, unread } = ctx.query;
    const operator = ctx.state.user;

    const query = { userId: operator.id };
    if (unread === 'true') {
      query.read = false;
    }

    const total = await ctx.model.Notification.countDocuments(query);
    const list = await ctx.model.Notification.find(query)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ createdAt: -1 });

    const unreadCount = await ctx.model.Notification.countDocuments({
      userId: operator.id,
      read: false,
    });

    this.success({
      list,
      total,
      unreadCount,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  }

  // 标记单条已读（需登录）
  async markRead() {
    this.requireAuth();
    const { ctx } = this;
    const { id } = ctx.params;

    await ctx.model.Notification.findByIdAndUpdate(id, { read: true });
    this.success(null, '标记成功');
  }

  // 全部标记已读（需登录）
  async markAllRead() {
    this.requireAuth();
    const { ctx } = this;
    const { userId } = ctx.request.body;
    const operator = ctx.state.user;

    await ctx.model.Notification.updateMany(
      { userId: operator.id, read: false },
      { read: true }
    );
    this.success(null, '全部标记已读');
  }

  // 删除通知（需登录）
  async delete() {
    this.requireAuth();
    const { ctx } = this;
    const { id } = ctx.params;

    await ctx.model.Notification.findByIdAndDelete(id);
    this.success(null, '删除成功');
  }

  // 创建通知（需登录）
  async create() {
    this.requireAuth();
    const { ctx } = this;
    const { title, content, type, userId } = ctx.request.body;

    if (userId) {
      const notif = await ctx.model.Notification.create({ userId, title, content, type });
      this.success(notif, '发送成功');
    } else {
      return this.fail('暂不支持群发');
    }
  }
}

module.exports = NotificationController;
