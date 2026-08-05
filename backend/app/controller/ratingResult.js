/**
 * RatingResultController - 物业评价结果（业主操作）
 */
const { BaseController } = require('../core/base_controller');

class RatingResultController extends BaseController {
  // 评分统计（卡片展示用）
  async stats() {
    const { ctx } = this;
    const { community_id, year } = ctx.query;
    try {
      const result = await ctx.service.ratingResult.getStats(
        community_id,
        year ? parseInt(year) : null,
      );
      this.success(result);
    } catch (e) {
      this.fail(e.message);
    }
  }

  // 提交评价（业主）
  async submit() {
    const { ctx } = this;
    const userId = ctx.state.user?.id;
    if (!userId) return this.fail('请先登录');
    try {
      const result = await ctx.service.ratingResult.submit(ctx.request.body, userId);
      this.success(result, '评价提交成功');
    } catch (e) {
      this.fail(e.message);
    }
  }

  // 检查本年度是否已提交
  async check() {
    const { ctx } = this;
    const userId = ctx.state.user?.id;
    if (!userId) return this.fail('请先登录');
    const { community_id, year } = ctx.query;
    const hasSubmitted = await ctx.service.ratingResult.hasSubmitted(
      community_id,
      userId,
      year ? parseInt(year) : null,
    );
    this.success({ has_submitted: hasSubmitted });
  }
}

module.exports = RatingResultController;