/* eslint-disable */
const Controller = require('egg').Controller;

class CommentController extends Controller {
  // 评论列表
  async list() {
    const { ctx } = this;
    const { topic_id } = ctx.query;
    const { page = 1, pageSize = 20, sort = 'asc' } = ctx.query;

    const query = { topic_id, is_deleted: false };
    const total = await ctx.model.Comment.countDocuments(query);
    const list = await ctx.model.Comment.find(query)
      .select('content author_id author_name is_deleted created_at')
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ created_at: sort === 'asc' ? 1 : -1 });

    ctx.success({ list, total, page: parseInt(page), pageSize: parseInt(pageSize) });
  }

  // 发评论
  async create() {
    const { ctx } = this;
    const { topic_id } = ctx.params;
    const { content } = ctx.request.body;

    if (!ctx.state.user) return ctx.fail('请先登录');

    const topic = await ctx.model.Topic.findById(topic_id);
    if (!topic) return ctx.fail('议题不存在');
    if (topic.status === 'closed') return ctx.fail('该议题已关闭，无法评论');

    const comment = await ctx.model.Comment.create({
      topic_id,
      content,
      author_id: ctx.state.user._id,
      author_name: ctx.state.user.name,
    });

    // 更新议题统计
    topic.comment_count += 1;
    topic.last_activity_at = new Date();
    // 重新计算热度
    const hours = (Date.now() - new Date(topic.createdAt).getTime()) / (1000 * 60 * 60);
    const decay = Math.exp(-0.15 * hours);
    topic.hot_score = Math.round((topic.follow_count * 0.6 + topic.comment_count * 0.4) * decay * 100) / 100;
    await topic.save();

    ctx.success(comment, '评论成功');
  }

  // 删除评论
  async delete() {
    const { ctx } = this;
    const { topic_id, id } = ctx.params;

    const comment = await ctx.model.Comment.findById(id);
    if (!comment || comment.is_deleted) return ctx.fail('评论不存在');

    // 权限：评论者本人或管理员
    const user = ctx.state.user;
    if (!user || (String(comment.author_id) !== String(user._id) && user.role !== 'admin')) {
      return ctx.fail('无权限删除此评论');
    }

    comment.is_deleted = true;
    await comment.save();

    // 更新议题评论数
    await ctx.model.Topic.findByIdAndUpdate(topic_id, {
      $inc: { comment_count: -1 },
    });

    ctx.success(null, '评论已删除');
  }
}

module.exports = CommentController;