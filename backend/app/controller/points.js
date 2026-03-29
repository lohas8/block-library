/* eslint-disable */
const Controller = require('egg').Controller;

class PointsController extends Controller {
  // 获取积分兑换物品列表
  async itemList() {
    const { ctx } = this;
    const { page = 1, pageSize = 10 } = ctx.query;

    const total = await ctx.model.PointsItem.countDocuments();
    const list = await ctx.model.PointsItem.find()
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ points: 1 });

    ctx.success({ list, total, page: parseInt(page), pageSize: parseInt(pageSize) });
  }

  // 添加积分兑换物品
  async createItem() {
    const { ctx } = this;
    const data = ctx.request.body;

    const item = await ctx.model.PointsItem.create(data);
    ctx.success(item, '添加成功');
  }

  // 更新积分兑换物品
  async updateItem() {
    const { ctx } = this;
    const { id } = ctx.params;
    const data = ctx.request.body;

    const item = await ctx.model.PointsItem.findByIdAndUpdate(id, data, { new: true });
    if (!item) {
      return ctx.fail('物品不存在');
    }

    ctx.success(item, '更新成功');
  }

  // 删除积分兑换物品
  async deleteItem() {
    const { ctx } = this;
    const { id } = ctx.params;

    await ctx.model.PointsItem.findByIdAndDelete(id);
    ctx.success(null, '删除成功');
  }

  // 兑换物品
  async exchange() {
    const { ctx } = this;
    const { userId, itemId } = ctx.request.body;

    // 检查物品是否存在
    const item = await ctx.model.PointsItem.findById(itemId);
    if (!item) {
      return ctx.fail('物品不存在');
    }

    // 检查库存
    if (item.stock === 0) {
      return ctx.fail('物品已兑完');
    }

    // 检查用户积分
    const user = await ctx.model.User.findById(userId);
    if (user.points < item.points) {
      return ctx.fail('积分不足');
    }

    // 扣除积分
    user.points -= item.points;
    await user.save();

    // 减少库存
    if (item.stock > 0) {
      item.stock -= 1;
      await item.save();
    }

    // 发送站内通知
    await ctx.model.Notification.create({
      userId,
      title: '兑换成功',
      content: `您已成功兑换「${item.name}」，请到管理员处领取`,
      type: 'success',
    });

    ctx.success({ remainingPoints: user.points }, '兑换成功');
  }
}

module.exports = PointsController;
