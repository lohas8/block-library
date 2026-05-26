/**
 * TopicService - 议事模块业务逻辑层
 * 负责议题相关的业务逻辑、数据组装、跨模型操作
 */
const Service = require('egg').Service;

class TopicService extends Service {
  /**
   * 计算热度分
   * hot_score = (follow×0.6 + comment×0.4) × e^(-λ×hours)
   * λ = 0.15（半衰期约4.6小时）
   */
  calcHotScore(followCount, commentCount, createdAt) {
    const hours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    const lambda = 0.15;
    const decay = Math.exp(-lambda * hours);
    const score = (followCount * 0.6 + commentCount * 0.4) * decay;
    return Math.round(score * 100) / 100;
  }

  /**
   * 议题列表（支持状态筛选 + 热度/时间排序）
   * 返回：焦点议题（置顶） + 普通议题（分页）
   */
  async getList({ status, sort = 'hot', page = 1, pageSize = 10, community_id }) {
    const query = {};
    if (status) query.status = status;
    if (community_id) query.community_id = community_id;

    // 焦点议题组（置顶，按 focused_at 倒序）
    const focusQuery = { ...query, is_focused: true };
    const focusList = await this.ctx.model.Topic.find(focusQuery)
      .select('title status is_focused focused_at follow_count comment_count hot_score author_name created_at last_activity_at')
      .sort({ focused_at: -1 });

    // 非焦点议题
    const excludeIds = focusList.map(t => t._id);
    const normalQuery = { ...query, is_focused: false, _id: { $nin: excludeIds } };

    let sortOption = {};
    if (sort === 'hot') {
      sortOption = { hot_score: -1 };
    } else {
      sortOption = { created_at: -1 };
    }

    const total = await this.ctx.model.Topic.countDocuments(normalQuery);
    const normalList = await this.ctx.model.Topic.find(normalQuery)
      .select('title status is_focused follow_count comment_count hot_score author_name created_at last_activity_at')
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort(sortOption);

    return {
      list: [...focusList, ...normalList],
      total: focusList.length + total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    };
  }

  /**
   * 议题详情（含当前用户关注状态）
   */
  async getDetail(id, userId) {
    const topic = await this.ctx.model.Topic.findById(id);
    if (!topic) return null;

    // 检查当前用户是否已关注
    let is_followed = false;
    if (userId) {
      const follow = await this.ctx.model.TopicFollow.findOne({ topic_id: id, user_id: userId });
      is_followed = !!follow;
    }

    return { ...topic.toObject(), is_followed };
  }

  /**
   * 创建议题
   */
  async create({ title, content, community_id, tags, images, author_id, author_name }) {
    const topic = await this.ctx.model.Topic.create({
      title,
      content,
      community_id,
      tags: tags || [],
      images: images || [],
      author_id,
      author_name,
      status: 'pending',
      hot_score: 0,
      follow_count: 0,
      comment_count: 0,
      is_focused: false,
    });
    return topic;
  }

  /**
   * 更新议题状态（管理员）
   */
  async updateStatus(id, status) {
    const topic = await this.ctx.model.Topic.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );
    return topic;
  }

  /**
   * 设置/取消焦点议题（管理员）
   */
  async setFocus(id, is_focused) {
    const update = { is_focused };
    if (is_focused) update.focused_at = new Date();
    const topic = await this.ctx.model.Topic.findByIdAndUpdate(id, update, { new: true });
    return topic;
  }

  /**
   * 关注/取消关注议题
   * 返回更新后的关注数和热度分
   */
  async follow(topicId, userId, action) {
    const topic = await this.ctx.model.Topic.findById(topicId);
    if (!topic) return null;

    if (action === 'follow') {
      await this.ctx.model.TopicFollow.findOneAndUpdate(
        { topic_id: topicId, user_id: userId },
        { topic_id: topicId, user_id: userId },
        { upsert: true, new: true }
      );
      topic.follow_count += 1;
    } else {
      await this.ctx.model.TopicFollow.deleteOne({ topic_id: topicId, user_id: userId });
      topic.follow_count = Math.max(0, topic.follow_count - 1);
    }

    topic.hot_score = this.calcHotScore(topic.follow_count, topic.comment_count, topic.createdAt);
    await topic.save();
    return { follow_count: topic.follow_count, hot_score: topic.hot_score };
  }

  /**
   * 刷新热度分（定时任务或批量调用）
   */
  async refreshHotScores() {
    const topics = await this.ctx.model.Topic.find({});
    for (const topic of topics) {
      topic.hot_score = this.calcHotScore(topic.follow_count, topic.comment_count, topic.createdAt);
      await topic.save();
    }
  }
}

module.exports = TopicService;