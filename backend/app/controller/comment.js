/* eslint-disable */
const { BaseController, NotFoundError, ValidationError } = require('../core/base_controller');

/**
 * CommentController - 评论控制器（瘦控制器）
 * 职责：参数解析、权限校验、HTTP 响应
 * 业务逻辑：委托给 CommentService
 */
class CommentController extends BaseController {
  // 评论列表
  async list() {
    try {
      const { topic_id, sort = 'asc', page, pageSize } = this.ctx.query;
      if (!topic_id) throw new ValidationError('topic_id 不能为空');

      const result = await this.ctx.service.comment.getList({ topic_id, sort, page, pageSize });
      this.success(result);
    } catch (err) {
      this.fail(err.message || '获取评论列表失败');
    }
  }

  // 发评论（全体已登录用户，议题不能是 closed 状态）
  async create() {
    try {
      this.requireAuth();
      const { topic_id } = this.ctx.params;
      const { content } = this.ctx.request.body;

      if (!content?.trim()) throw new ValidationError('评论内容不能为空');
      if (content.length > 2000) throw new ValidationError('评论内容最多2000字');

      const comment = await this.ctx.service.comment.create({
        topic_id,
        content: content.trim(),
        author_id: this.ctx.state.user._id,
        author_name: this.ctx.state.user.name,
      });
      this.success(comment, '评论成功');
    } catch (err) {
      this.fail(err.message || '评论失败');
    }
  }

  // 删除评论（评论者本人 或 管理员）
  async delete() {
    try {
      const user = this.requireAuth();
      const { topic_id, id } = this.ctx.params;

      await this.ctx.service.comment.delete(id, topic_id, user._id, user.role);
      this.success(null, '评论已删除');
    } catch (err) {
      if (err.message === '评论不存在') {
        this.fail('评论不存在', 404);
      } else {
        this.fail(err.message || '删除评论失败');
      }
    }
  }
}

module.exports = CommentController;