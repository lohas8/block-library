/**
 * RuleEvaluationController - 规则评估控制器
 * 支持自动评分和图片凭证上传
 */
const Controller = require('egg').Controller;

class RuleEvaluationController extends Controller {
  /**
   * 创建评估记录
   * POST /api/rule-evaluations
   * body: { ruleApprovalId, ruleId, userId, userName, communityId, images }
   */
  async create() {
    const { ctx } = this;
    try {
      const evaluation = await ctx.service.ruleEvaluation.create(ctx.request.body);
      ctx.body = { code: 0, msg: '评估创建成功', data: evaluation };
    } catch (e) {
      ctx.body = { code: -1, msg: e.message, data: null };
    }
  }

  /**
   * 评估详情
   * GET /api/rule-evaluations/:id
   */
  async detail() {
    const { ctx } = this;
    try {
      const evaluation = await ctx.service.ruleEvaluation.detail(ctx.params.id);
      ctx.body = { code: 0, msg: 'success', data: evaluation };
    } catch (e) {
      ctx.body = { code: -1, msg: e.message, data: null };
    }
  }

  /**
   * 评估列表
   * GET /api/rule-evaluations?communityId=&status=&userId=&page=1&pageSize=10
   */
  async list() {
    const { ctx } = this;
    try {
      const result = await ctx.service.ruleEvaluation.list(ctx.query);
      ctx.body = { code: 0, msg: 'success', list: result.list, total: result.total };
    } catch (e) {
      ctx.body = { code: -1, msg: e.message, data: null };
    }
  }

  /**
   * 手动评分（管理员）
   * POST /api/rule-evaluations/:id/score
   * body: { points, remark }
   */
  async score() {
    const { ctx } = this;
    try {
      const { points, remark } = ctx.request.body;
      const evaluation = await ctx.service.ruleEvaluation.manualScore(ctx.params.id, points, remark);
      ctx.body = { code: 0, msg: '评分成功', data: evaluation };
    } catch (e) {
      ctx.body = { code: -1, msg: e.message, data: null };
    }
  }

  /**
   * 驳回评估（管理员）
   * POST /api/rule-evaluations/:id/reject
   * body: { remark }
   */
  async reject() {
    const { ctx } = this;
    try {
      const { remark } = ctx.request.body || {};
      const evaluation = await ctx.service.ruleEvaluation.reject(ctx.params.id, remark);
      ctx.body = { code: 0, msg: '已驳回', data: evaluation };
    } catch (e) {
      ctx.body = { code: -1, msg: e.message, data: null };
    }
  }

  /**
   * 上传图片凭证
   * POST /api/rule-evaluations/:id/images
   * body: { images: ['url1', 'url2'] }
   */
  async uploadImages() {
    const { ctx } = this;
    try {
      const { images } = ctx.request.body;
      if (!images || !Array.isArray(images)) {
        ctx.body = { code: -1, msg: 'images 参数必须是数组', data: null };
        return;
      }
      const evaluation = await ctx.service.ruleEvaluation.uploadImages(ctx.params.id, images);
      ctx.body = { code: 0, msg: '图片上传成功', data: evaluation };
    } catch (e) {
      ctx.body = { code: -1, msg: e.message, data: null };
    }
  }

  /**
   * 获取用户的评估记录
   * GET /api/rule-evaluations/user/:userId?communityId=
   */
  async getByUser() {
    const { ctx } = this;
    try {
      const { communityId } = ctx.query;
      const list = await ctx.service.ruleEvaluation.getByUser(ctx.params.userId, communityId);
      ctx.body = { code: 0, msg: 'success', list };
    } catch (e) {
      ctx.body = { code: -1, msg: e.message, data: null };
    }
  }
}

module.exports = RuleEvaluationController;
