/**
 * VoteController - 投票 Controller
 */
const Controller = require('../core/base_controller');

class VoteController extends Controller {
  // 投票列表
  async list() {
    const { ctx } = this;
    const { status, page = 1, pageSize = 10 } = ctx.query;
    try {
      const result = await ctx.service.vote.getList({ status, page, pageSize });
      ctx.success(result);
    } catch (e) {
      ctx.fail(e.message);
    }
  }

  // 投票详情
  async detail() {
    const { ctx } = this;
    const { id } = ctx.params;
    const userId = ctx.state.user?.id || null;
    try {
      const result = await ctx.service.vote.getDetail(id, userId);
      ctx.success(result);
    } catch (e) {
      ctx.fail(e.message);
    }
  }

  // 创建投票（管理员）
  async create() {
    const { ctx } = this;
    const operator = ctx.state.user || {};
    if (!['admin', 'super_admin'].includes(operator.role)) {
      return ctx.fail('无权限操作');
    }
    try {
      const result = await ctx.service.vote.create(ctx.request.body, operator.id, operator.name);
      ctx.success(result, '投票创建成功');
    } catch (e) {
      ctx.fail(e.message);
    }
  }

  // 结束投票（管理员）
  async close() {
    const { ctx } = this;
    const { id } = ctx.params;
    const operator = ctx.state.user || {};
    if (!['admin', 'super_admin'].includes(operator.role)) {
      return ctx.fail('无权限操作');
    }
    try {
      await ctx.model.Vote.findByIdAndUpdate(id, { status: 'closed' });
      ctx.success(null, '投票已结束');
    } catch (e) {
      ctx.fail(e.message);
    }
  }

  // 投票（业主）
  async castVote() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { selected_item_ids } = ctx.request.body;
    const userId = ctx.state.user?.id;
    if (!userId) return ctx.fail('请先登录');
    try {
      const result = await ctx.service.vote.castVote(id, userId, selected_item_ids);
      ctx.success(result, '投票成功');
    } catch (e) {
      ctx.fail(e.message);
    }
  }
}

module.exports = VoteController;