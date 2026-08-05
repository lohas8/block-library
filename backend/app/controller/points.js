/* eslint-disable */
const { BaseController } = require('../core/base_controller');

class PointsController extends BaseController {
  // 获取积分兑换物品列表
  async itemList() {
    const { ctx } = this;
    const { page = 1, pageSize = 10 } = ctx.query;

    const total = await ctx.model.PointsItem.countDocuments();
    const list = await ctx.model.PointsItem.find()
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ points: 1 });

    this.success({ list, total, page: parseInt(page), pageSize: parseInt(pageSize) });
  }

  // 添加积分兑换物品（仅管理员）
  async createItem() {
    try {
      this.requireAdmin();
      const { ctx } = this;
      const data = ctx.request.body;

      if (!data.name || data.points === undefined) {
        return this.fail('物品名称和积分必填', -1, 400);
      }

      const item = await ctx.model.PointsItem.create(data);
      this.success(item, '添加成功');
    } catch (e) {
      if (e.name === 'ForbiddenError' || (e.message && e.message.includes('无权限'))) {
        this.fail(e.message, -1, 403);
      } else {
        this.fail(e.message);
      }
    }
  }

  // 更新积分兑换物品（仅管理员）
  async updateItem() {
    try {
      this.requireAdmin();
      const { ctx } = this;
      const { id } = ctx.params;
      const data = ctx.request.body;

      if (data.points !== undefined && data.points < 0) {
        return this.fail('积分不能为负数', -1, 400);
      }

      const item = await ctx.model.PointsItem.findByIdAndUpdate(id, data, { new: true });
      if (!item) {
        return this.fail('物品不存在', -1, 404);
      }

      this.success(item, '更新成功');
    } catch (e) {
      if (e.name === 'ForbiddenError' || (e.message && e.message.includes('无权限'))) {
        this.fail(e.message, -1, 403);
      } else {
        this.fail(e.message);
      }
    }
  }

  // 删除积分兑换物品（仅管理员）
  async deleteItem() {
    try {
      this.requireAdmin();
      const { ctx } = this;
      const { id } = ctx.params;

      const item = await ctx.model.PointsItem.findByIdAndDelete(id);
      if (!item) {
        return this.fail('物品不存在', -1, 404);
      }
      this.success(null, '删除成功');
    } catch (e) {
      if (e.name === 'ForbiddenError' || (e.message && e.message.includes('无权限'))) {
        this.fail(e.message, -1, 403);
      } else {
        this.fail(e.message);
      }
    }
  }

  // 兑换物品（需登录）
  async exchange() {
    try {
      this.requireAuth();
      const { ctx } = this;
      const { userId, itemId, quantity = 1 } = ctx.request.body;

      if (quantity <= 0) {
        return this.fail('兑换数量必须大于0', -1, 400);
      }

      // 检查 itemId 是否有效 ObjectId
      if (!ctx.model.PointsItem.schema.path('_id').cast(itemId)) {
        return this.fail('物品不存在', -1, 404);
      }

      // 检查物品是否存在
      const item = await ctx.model.PointsItem.findById(itemId);
      if (!item) {
        return this.fail('物品不存在', -1, 404);
      }

      // 检查库存
      if (item.stock < quantity) {
        return this.fail('物品库存不足', -1, 400);
      }

      // 检查用户积分
      const user = await ctx.model.User.findById(userId);
      if (!user) {
        return this.fail('用户不存在', -1, 404);
      }
      const totalPoints = item.points * quantity;
      if (user.points < totalPoints) {
        return this.fail('积分不足', -1, 400);
      }

      // 扣除积分
      user.points -= totalPoints;
      await user.save();

      // 减少库存
      item.stock -= quantity;
      await item.save();

      // 发送站内通知
      await ctx.model.Notification.create({
        userId,
        title: '兑换成功',
        content: `您已成功兑换「${item.name}」，请到管理员处领取`,
        type: 'exchange_success',
      });

      this.success({ remainingPoints: user.points }, '兑换成功');
    } catch (e) {
      if (e.name === 'UnauthorizedError') {
        this.fail(e.message, -1, 401);
      } else if (e.name === 'CastError' || (e.message && e.message.includes('Cast to ObjectId'))) {
        this.fail('物品不存在', -1, 404);
      } else {
        this.fail(e.message);
      }
    }
  }
}

module.exports = PointsController;
