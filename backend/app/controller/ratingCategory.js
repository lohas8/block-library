/**
 * RatingCategoryController - 评价配置管理（管理员）
 */
const { BaseController } = require('../core/base_controller');

class RatingCategoryController extends BaseController {
  // 评价配置列表（用户端：只查启用；管理端：可查全部）
  async list() {
    const { ctx } = this;
    const { community_id, include_disabled } = ctx.query;
    try {
      const list = await ctx.service.ratingCategory.getList(community_id, include_disabled === 'true');
      this.success(list);
    } catch (e) {
      this.fail(e.message);
    }
  }

  // 创建评价配置
  async create() {
    const { ctx } = this;
    const user = ctx.state.user || {};
    if (!['admin', 'super_admin'].includes(user.role)) {
      return this.fail('无权限操作');
    }
    try {
      const result = await ctx.service.ratingCategory.create(ctx.request.body);
      this.success(result, '创建成功');
    } catch (e) {
      this.fail(e.message);
    }
  }

  // 更新评价配置
  async update() {
    const { ctx } = this;
    const { id } = ctx.params;
    const user = ctx.state.user || {};
    if (!['admin', 'super_admin'].includes(user.role)) {
      return this.fail('无权限操作');
    }
    try {
      const result = await ctx.service.ratingCategory.update(id, ctx.request.body);
      this.success(result, '更新成功');
    } catch (e) {
      this.fail(e.message);
    }
  }

  // 删除评价配置
  async delete() {
    const { ctx } = this;
    const { id } = ctx.params;
    const user = ctx.state.user || {};
    if (!['admin', 'super_admin'].includes(user.role)) {
      return this.fail('无权限操作');
    }
    try {
      await ctx.service.ratingCategory.delete(id);
      this.success(null, '删除成功');
    } catch (e) {
      this.fail(e.message);
    }
  }

  // 新增小项
  async addItem() {
    const { ctx } = this;
    const { id } = ctx.params;
    const user = ctx.state.user || {};
    if (!['admin', 'super_admin'].includes(user.role)) {
      return this.fail('无权限操作');
    }
    try {
      const result = await ctx.service.ratingCategory.addItem(id, ctx.request.body);
      this.success(result, '小项添加成功');
    } catch (e) {
      this.fail(e.message);
    }
  }

  // 更新小项
  async updateItem() {
    const { ctx } = this;
    const { id, itemKey } = ctx.params;
    const user = ctx.state.user || {};
    if (!['admin', 'super_admin'].includes(user.role)) {
      return this.fail('无权限操作');
    }
    try {
      const result = await ctx.service.ratingCategory.updateItem(id, itemKey, ctx.request.body);
      this.success(result, '小项更新成功');
    } catch (e) {
      this.fail(e.message);
    }
  }

  // 删除小项
  async removeItem() {
    const { ctx } = this;
    const { id, itemKey } = ctx.params;
    const user = ctx.state.user || {};
    if (!['admin', 'super_admin'].includes(user.role)) {
      return this.fail('无权限操作');
    }
    try {
      const result = await ctx.service.ratingCategory.removeItem(id, itemKey);
      this.success(result, '小项删除成功');
    } catch (e) {
      this.fail(e.message);
    }
  }

  // 初始化种子数据
  async seed() {
    const { ctx } = this;
    const user = ctx.state.user || {};
    if (!['admin', 'super_admin'].includes(user.role)) {
      return this.fail('无权限操作');
    }
    try {
      const community_id = ctx.request.body.community_id || null;
      const result = await ctx.service.ratingCategory.seedDefaults(community_id);
      this.success(result);
    } catch (e) {
      this.fail(e.message);
    }
  }
}

module.exports = RatingCategoryController;