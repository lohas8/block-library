/**
 * CommentService - 评论模块业务逻辑层
 * 负责评论相关的业务逻辑、数据组装
 */
const Service = require('egg').Service;

class CommentService extends Service {
  /**
   * 评论列表（支持分页 + 时间正序/倒序）
   * 只返回未删除的评论
   */
  async getList({ topic_id, sort = 'asc', page = 1, pageSize = 20 }) {
    const query = { topic_id, is_deleted: false };
    const total = await this.ctx.model.Comment.countDocuments(query);
    const list = await this.ctx.model.Comment.find(query)
      .select('content author_id author_name created_at')
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ created_at: sort === 'asc' ? 1 : -1 });
    return { list, total, page: parseInt(page), pageSize: parseInt(pageSize) };
  }

  /**
   * 发评论（同时更新议题统计）
   */
  async create({ topic_id, content, author_id, author_name }) {
    // 检查议题是否存在且未关闭
    const topic = await this.ctx.model.Topic.findById(topic_id);
    if (!topic) {
      throw new Error('议题不存在');
    }
    if (topic.status === 'closed') {
      throw new Error('该议题已关闭，无法评论');
    }

    const comment = await this.ctx.model.Comment.create({
      topic_id,
      content,
      author_id,
      author_name,
    });

    // 更新议题统计
    topic.comment_count += 1;
    topic.last_activity_at = new Date();
    // 重新计算热度分
    const TopicService = require('./topic');
    const topicService = new TopicService(this.ctx);
    const hours = (Date.now() - new Date(topic.createdAt).getTime()) / (1000 * 60 * 60);
    const decay = Math.exp(-0.15 * hours);
    topic.hot_score = Math.round((topic.follow_count * 0.6 + topic.comment_count * 0.4) * decay * 100) / 100;
    await topic.save();

    return comment;
  }

  /**
   * 删除评论（软删除）
   * 权限：评论者本人 或 管理员
   */
  async delete(commentId, topicId, userId, userRole) {
    const comment = await this.ctx.model.Comment.findById(commentId);
    if (!comment || comment.is_deleted) {
      throw new Error('评论不存在');
    }

    // 权限校验
    if (String(comment.author_id) !== String(userId) && userRole !== 'admin' && userRole !== 'super_admin') {
      throw new Error('无权限删除此评论');
    }

    comment.is_deleted = true;
    comment.updated_at = new Date();
    await comment.save();

    // 更新议题评论数
    await this.ctx.model.Topic.findByIdAndUpdate(topicId, {
      $inc: { comment_count: -1 },
    });

    return true;
  }

  /**
   * 获取议题的所有评论（不含软删除）
   */
  async getByTopicId(topicId) {
    return this.ctx.model.Comment.find({ topic_id: topicId, is_deleted: false })
      .select('content author_id author_name created_at')
      .sort({ created_at: 1 });
  }
}

module.exports = CommentService;