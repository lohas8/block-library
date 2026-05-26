/* eslint-disable */
const Controller = require('egg').Controller;

/**
 * CommentController - 评论控制器（瘦控制器，委托给 Service 层）
 * 职责：参数解析、权限校验、HTTP 响应、异常捕获
 * 业务逻辑：全部委托给 CommentService
 */
class CommentController extends Controller {
  // 评论列表
  async list() {
    const { ctx } = this;
    try {
      const { topic_id, sort = 'asc', page = 1, pageSize = 20 } = ctx.query;
      if (!topic_id) return ctx.fail('topic_id 不能为空');
      const result = await ctx.service.comment.getList({ topic_id, sort, page, pageSize });
      ctx.success(result);
    } catch (err) {
      ctx.fail('获取评论列表失败');
    }
  }

  // 发评论（全体已登录用户，议题不能是 closed 状态）
  async create() {
    const { ctx } = this;
    try {
      if (!ctx.state.user) return ctx.fail('请先登录');
      const { topic_id } = ctx.params;
      const { content } = ctx.request.body;
      if (!content || !content.trim()) return ctx.fail('评论内容不能为空');
      if (content.length > 2000) return ctx.fail('评论内容最多2000字');

      const comment = await ctx.service.comment.create({
        topic_id,
        content: content.trim(),
        author_id: ctx.state.user._id,
        author_name: ctx.state.user.name,
      });
      ctx.success(comment, '评论成功');
    } catch (err) {
      ctx.fail(err.message || '评论失败');
    }
  }

  // 删除评论（评论者本人 或 管理员）
  async delete() {
    const { ctx } = this;
    try {
      if (!ctx.state.user) return ctx.fail('请先登录');
      const { topic_id, id } = ctx.params;

      await ctx.service.comment.delete(id, topic_id, ctx.state.user._id, ctx.state.user.role);
      ctx.success(null, '评论已删除');
    } catch (err) {
      ctx.fail(err.message || '删除评论失败');
    }
  }
}

module.exports = CommentController;