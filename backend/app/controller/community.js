// 小区管理控制器
const Controller = require('egg').Controller;

class CommunityController extends Controller {
  // 小区列表
  async list() {
    const { ctx } = this;
    const result = await ctx.service.community.list(ctx.query);
    ctx.body = { code: 0, msg: 'success', list: result.list, total: result.total };
  }

  // 小区详情
  async detail() {
    const { ctx } = this;
    const community = await ctx.service.community.detail(ctx.params.id);
    ctx.body = { code: 0, msg: 'success', data: community };
  }

  // 创建小区
  async create() {
    const { ctx } = this;
    const community = await ctx.service.community.create(ctx.request.body);
    ctx.body = { code: 0, msg: '创建成功', data: community };
  }

  // 更新小区
  async update() {
    const { ctx } = this;
    const community = await ctx.service.community.update(ctx.params.id, ctx.request.body);
    ctx.body = { code: 0, msg: '更新成功', data: community };
  }

  // 删除小区
  async delete() {
    const { ctx } = this;
    await ctx.service.community.delete(ctx.params.id);
    ctx.body = { code: 0, msg: '删除成功' };
  }
}

module.exports = CommunityController;
