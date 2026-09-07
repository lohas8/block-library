// 规则管理控制器
const Controller = require('egg').Controller;

class RuleController extends Controller {
  // 规则列表
  async list() {
    const { ctx } = this;
    try {
      const result = await ctx.service.rule.list(ctx.query);
      ctx.body = { code: 0, msg: 'success', list: result.list, total: result.total };
    } catch (e) {
      ctx.body = { code: -1, msg: e.message, data: null };
    }
  }

  // 规则详情
  async detail() {
    const { ctx } = this;
    try {
      const rule = await ctx.service.rule.detail(ctx.params.id);
      ctx.body = { code: 0, msg: 'success', data: rule };
    } catch (e) {
      ctx.body = { code: -1, msg: e.message, data: null };
    }
  }

  // 创建规则
  async create() {
    const { ctx } = this;
    try {
      const rule = await ctx.service.rule.create(ctx.request.body);
      ctx.body = { code: 0, msg: '创建成功', data: rule };
    } catch (e) {
      ctx.body = { code: -1, msg: e.message, data: null };
    }
  }

  // 更新规则
  async update() {
    const { ctx } = this;
    try {
      const rule = await ctx.service.rule.update(ctx.params.id, ctx.request.body);
      ctx.body = { code: 0, msg: '更新成功', data: rule };
    } catch (e) {
      ctx.body = { code: -1, msg: e.message, data: null };
    }
  }

  // 删除规则
  async delete() {
    const { ctx } = this;
    try {
      await ctx.service.rule.delete(ctx.params.id);
      ctx.body = { code: 0, msg: '删除成功' };
    } catch (e) {
      ctx.body = { code: -1, msg: e.message, data: null };
    }
  }

  // 申请规则
  async apply() {
    const { ctx } = this;
    try {
      const ruleId = ctx.params.id;
      const { ...data } = ctx.request.body;
      const user = ctx.state.user || {};
      const approval = await ctx.service.rule.apply(
        ruleId, 
        user.id || user._id || 'anonymous',
        user.name || 'Anonymous',
        data
      );
      ctx.body = { code: 0, msg: '申请已提交', data: approval };
    } catch (e) {
      ctx.body = { code: -1, msg: e.message, data: null };
    }
  }

  // 批准申请
  async approve() {
    const { ctx } = this;
    try {
      const approval = await ctx.service.rule.approve(ctx.params.id);
      ctx.body = { code: 0, msg: '已批准', data: approval };
    } catch (e) {
      ctx.body = { code: -1, msg: e.message, data: null };
    }
  }

  // 拒绝申请
  async reject() {
    const { ctx } = this;
    try {
      const { remark } = ctx.request.body || {};
      const approval = await ctx.service.rule.reject(ctx.params.id, remark);
      ctx.body = { code: 0, msg: '已拒绝', data: approval };
    } catch (e) {
      ctx.body = { code: -1, msg: e.message, data: null };
    }
  }

  // 申请列表
  async listApprovals() {
    const { ctx } = this;
    try {
      const result = await ctx.service.rule.listApprovals(ctx.query);
      ctx.body = { code: 0, msg: 'success', list: result.list, total: result.total };
    } catch (e) {
      ctx.body = { code: -1, msg: e.message, data: null };
    }
  }
}

module.exports = RuleController;
