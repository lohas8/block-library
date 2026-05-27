/**
 * RatingCategoryController - 评价配置管理（管理员）
 */
const Controller = require('../core/base_controller');

class RatingCategoryController extends Controller {
  // 评价配置列表
  async list() {
    const { ctx } = this;
    const { community_id } = ctx.query;
    try {
      const list = await ctx.service.ratingCategory.getList(community_id);
      ctx.success(list);
    } catch (e) {
      ctx.fail(e.message);
    }
  }

  // 创建评价配置
  async create() {
    const { ctx } = this;
    // 管理员权限校验（简化：检查 role 为 admin 或 super_admin）
    const user = ctx.state.user || {};
    if (!['admin', 'super_admin'].includes(user.role)) {
      return ctx.fail('无权限操作');
    }
    try {
      const result = await ctx.service.ratingCategory.create(ctx.request.body);
      ctx.success(result, '创建成功');
    } catch (e) {
      ctx.fail(e.message);
    }
  }

  // 更新评价配置
  async update() {
    const { ctx } = this;
    const { id } = ctx.params;
    const user = ctx.state.user || {};
    if (!['admin', 'super_admin'].includes(user.role)) {
      return ctx.fail('无权限操作');
    }
    try {
      const result = await ctx.service.ratingCategory.update(id, ctx.request.body);
      ctx.success(result, '更新成功');
    } catch (e) {
      ctx.fail(e.message);
    }
  }

  // 删除评价配置
  async delete() {
    const { ctx } = this;
    const { id } = ctx.params;
    const user = ctx.state.user || {};
    if (!['admin', 'super_admin'].includes(user.role)) {
      return ctx.fail('无权限操作');
    }
    try {
      await ctx.service.ratingCategory.delete(id);
      ctx.success(null, '删除成功');
    } catch (e) {
      ctx.fail(e.message);
    }
  }
}

module.exports = RatingCategoryController;