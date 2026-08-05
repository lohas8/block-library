/**
 * PropertyRatingController - 物业评价
 */
const { BaseController } = require('../core/base_controller');

class PropertyRatingController extends BaseController {
  // 评分统计
  async stats() {
    const { ctx } = this;
    const { community_id, year } = ctx.query;
    try {
      const result = await ctx.service.propertyRating.getStats(community_id, year ? parseInt(year) : null);
      this.success(result);
    } catch (e) {
      this.fail(e.message);
    }
  }

  // 提交评价
  async create() {
    const { ctx } = this;
    const userId = ctx.state.user?.id;
    if (!userId) return this.fail('请先登录');
    try {
      const result = await ctx.service.propertyRating.create(ctx.request.body, userId);
      this.success(result, '评价成功');
    } catch (e) {
      this.fail(e.message);
    }
  }
}

module.exports = PropertyRatingController;