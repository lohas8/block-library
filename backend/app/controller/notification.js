/* eslint-disable */
const Controller = require('egg').Controller;

class NotificationController extends Controller {
  // 获取用户通知列表
  async list() {
    const { ctx } = this;
    const { userId, page = 1, pageSize = 10, unread } = ctx.query;

    const query = { userId };
    if (unread === 'true') {
      query.read = false;
    }

    const total = await ctx.model.Notification.countDocuments(query);
    const list = await ctx.model.Notification.find(query)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ createdAt: -1 });

    const unreadCount = await ctx.model.Notification.countDocuments({
      userId,
      read: false,
    });

    ctx.success({
      list,
      total,
      unreadCount,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  }

  // 标记已读
  async markRead() {
    const { ctx } = this;
    const { id } = ctx.params;

    await ctx.model.Notification.findByIdAndUpdate(id, { read: true });
    ctx.success(null, '标记成功');
  }

  // 全部标记已读
  async markAllRead() {
    const { ctx } = this;
    const { userId } = ctx.request.body;

    await ctx.model.Notification.updateMany(
      { userId, read: false },
      { read: true }
    );
    ctx.success(null, '全部标记已读');
  }

  // 删除通知
  async delete() {
    const { ctx } = this;
    const { id } = ctx.params;

    await ctx.model.Notification.findByIdAndDelete(id);
    ctx.success(null, '删除成功');
  }

  // 创建通知（管理员发送全员通知）
  async create() {
    const { ctx } = this;
    const { title, content, type, userId } = ctx.request.body;

    if (userId) {
      // 发送给指定用户
      await ctx.model.Notification.create({ userId, title, content, type });
    } else {
      // 发送给所有用户（暂不实现）
      return ctx.fail('暂不支持群发');
    }

    ctx.success(null, '发送成功');
  }
}

module.exports = NotificationController;
