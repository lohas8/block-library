// 工具共享控制器
const Controller = require('egg').Controller;

class ToolController extends Controller {
  // 工具列表
  async list() {
    const { ctx } = this;
    const result = await ctx.service.tool.list(ctx.query);
    ctx.body = { code: 0, msg: 'success', data: result };
  }

  // 工具详情
  async detail() {
    const { ctx } = this;
    const tool = await ctx.service.tool.detail(ctx.params.id);
    ctx.body = { code: 0, msg: 'success', data: tool };
  }

  // 创建工具
  async create() {
    const { ctx } = this;
    const tool = await ctx.service.tool.create(ctx.request.body);
    ctx.body = { code: 0, msg: '创建成功', data: tool };
  }

  // 更新工具
  async update() {
    const { ctx } = this;
    const tool = await ctx.service.tool.update(ctx.params.id, ctx.request.body);
    ctx.body = { code: 0, msg: '更新成功', data: tool };
  }

  // 删除工具
  async delete() {
    const { ctx } = this;
    await ctx.service.tool.delete(ctx.params.id);
    ctx.body = { code: 0, msg: '删除成功' };
  }

  // 分类列表
  async categories() {
    const { ctx } = this;
    const cats = await ctx.service.tool.categories();
    ctx.body = { code: 0, msg: 'success', data: cats };
  }

  // 租用工具
  async rent() {
    const { ctx } = this;
    const tool = await ctx.service.tool.rent(ctx.request.body);
    ctx.body = { code: 0, msg: '租用成功', data: tool };
  }

  // 归还工具
  async Return() {
    const { ctx } = this;
    const tool = await ctx.service.tool.Return(ctx.params.id);
    ctx.body = { code: 0, msg: '归还成功', data: tool };
  }

  // 统计
  async statistics() {
    const { ctx } = this;
    const stats = await ctx.service.tool.statistics();
    ctx.body = { code: 0, msg: 'success', data: stats };
  }
}

module.exports = ToolController;
