/* eslint-disable */
/**
 * VoteController - 投票 Controller
 */
const { BaseController } = require('../core/base_controller');

class VoteController extends BaseController {
  // 投票列表
  async list() {
    const { ctx } = this;
    const { status, page = 1, pageSize = 10 } = ctx.query;
    try {
      const result = await ctx.service.vote.getList({ status, page, pageSize });
      this.success(result);
    } catch (e) {
      this.fail(e.message);
    }
  }

  // 投票详情
  async detail() {
    try {
      const id = this.ctx.params.id;
      const userId = this.ctx.state.user?.id || null;
      const result = await this.ctx.service.vote.getDetail(id, userId);
      if (!result) throw new Error('NOT_FOUND');
      this.success(result);
    } catch (err) {
      if (err.message === 'NOT_FOUND') {
        this.ctx.status = 404;
        this.fail('投票不存在', 404, 404);
      } else {
        this.fail(err.message || '获取投票详情失败');
      }
    }
  }

  // 创建投票（管理员）
  async create() {
    try {
      const operator = this.requireAdmin();
      const { ctx } = this;
      const { title, items } = ctx.request.body;
      if (!title || !items || !Array.isArray(items) || items.length < 2) {
        return this.fail('投票标题和至少两个选项必填', -1, 400);
      }
      const result = await ctx.service.vote.create(ctx.request.body, operator.id, operator.name);
      this.success(result, '投票创建成功');
    } catch (e) {
      if (e.name === 'ForbiddenError' || (e.message && e.message.includes('无权限'))) {
        this.fail(e.message, -1, 403);
      } else {
        this.fail(e.message);
      }
    }
  }

  // 结束投票（管理员）
  async close() {
    try {
      this.requireAdmin();
      const { ctx } = this;
      const { id } = ctx.params;
      await ctx.model.Vote.findByIdAndUpdate(id, { status: 'closed' });
      this.success(null, '投票已结束');
    } catch (e) {
      if (e.name === 'ForbiddenError' || (e.message && e.message.includes('无权限'))) {
        this.fail(e.message, -1, 403);
      } else {
        this.fail(e.message);
      }
    }
  }

  // 投票（业主）
  async castVote() {
    try {
      this.requireAuth();
      const { ctx } = this;
      const { id } = ctx.params;
      const { selected_item_ids } = ctx.request.body;
      const userId = ctx.state.user.id;

      const vote = await ctx.model.Vote.findById(id);
      if (!vote) {
        return this.fail('投票不存在');
      }
      if (vote.status !== 'active') {
        return this.fail('投票已结束');
      }

      const existingVote = await ctx.model.VoteRecord.findOne({ vote_id: id, user_id: userId });
      if (existingVote) {
        return this.fail('您已投过票', -1, 400);
      }

      await ctx.model.VoteRecord.create({
        vote_id: id,
        user_id: userId,
        selected_item_ids: selected_item_ids.join(','),
        voted_at: new Date(),
      });

      // 更新各选项的投票计数
      await ctx.model.Vote.updateOne(
        { _id: id },
        { $inc: { 'items.$[elem].vote_count': 1 } },
        { arrayFilters: [{ 'elem._id': { $in: selected_item_ids } }] }
      );

      this.success({ success: true }, '投票成功');
    } catch (e) {
      if (e.name === 'UnauthorizedError') {
        this.fail(e.message, -1, 401);
      } else {
        this.fail(e.message);
      }
    }
  }
}

module.exports = VoteController;
