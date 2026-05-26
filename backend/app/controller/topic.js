/* eslint-disable */
const Controller = require('egg').Controller;

class TopicController extends Controller {
  // 计算热度分
  calcHotScore(followCount, commentCount, createdAt) {
    const hours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    const lambda = 0.15;
    const decay = Math.exp(-lambda * hours);
    const score = (followCount * 0.6 + commentCount * 0.4) * decay;
    return Math.round(score * 100) / 100;
  }

  // 议题列表
  async list() {
    const { ctx } = this;
    const { page = 1, pageSize = 10, status, sort = 'hot', community_id } = ctx.query;

    const query = {};
    if (status) query.status = status;
    if (community_id) query.community_id = community_id;

    // 先取焦点议题（按置顶时间倒序）
    const focusQuery = { ...query, is_focused: true };
    const focusList = await ctx.model.Topic.find(focusQuery)
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

    const total = await ctx.model.Topic.countDocuments(normalQuery);
    const normalList = await ctx.model.Topic.find(normalQuery)
      .select('title status is_focused follow_count comment_count hot_score author_name created_at last_activity_at')
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort(sortOption);

    const list = [...focusList, ...normalList];

    ctx.success({
      list,
      total: focusList.length + total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  }

  // 议题详情
  async detail() {
    const { ctx } = this;
    const { id } = ctx.params;

    const topic = await ctx.model.Topic.findById(id);
    if (!topic) return ctx.fail('议题不存在');

    // 检查当前用户是否已关注
    let is_followed = false;
    if (ctx.state.user) {
      const follow = await ctx.model.TopicFollow.findOne({ topic_id: id, user_id: ctx.state.user._id });
      is_followed = !!follow;
    }

    ctx.success({ ...topic.toObject(), is_followed });
  }

  // 创建议题
  async create() {
    const { ctx } = this;
    const { title, content, community_id, tags, images } = ctx.request.body;

    // 权限检查：必须是业主（role=user 且已认证）
    if (!ctx.state.user) return ctx.fail('请先登录');

    const topic = await ctx.model.Topic.create({
      title,
      content,
      community_id,
      tags: tags || [],
      images: images || [],
      author_id: ctx.state.user._id,
      author_name: ctx.state.user.name,
      status: 'pending',
      hot_score: 0,
    });

    ctx.success(topic, '创建议题成功');
  }

  // 修改状态（管理员）
  async updateStatus() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { status } = ctx.request.body;

    if (ctx.state.user?.role !== 'admin') return ctx.fail('无权限');

    const topic = await ctx.model.Topic.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );
    if (!topic) return ctx.fail('议题不存在');

    ctx.success(topic, '状态更新成功');
  }

  // 设置/取消焦点议题（管理员）
  async setFocus() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { is_focused } = ctx.request.body;

    if (ctx.state.user?.role !== 'admin') return ctx.fail('无权限');

    const update = { is_focused };
    if (is_focused) update.focused_at = new Date();

    const topic = await ctx.model.Topic.findByIdAndUpdate(id, update, { new: true });
    if (!topic) return ctx.fail('议题不存在');

    ctx.success(topic, is_focused ? '已设为焦点议题' : '已取消焦点议题');
  }

  // 关注/取消关注
  async follow() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { action } = ctx.request.body;

    if (!ctx.state.user) return ctx.fail('请先登录');

    const topic = await ctx.model.Topic.findById(id);
    if (!topic) return ctx.fail('议题不存在');

    if (action === 'follow') {
      await ctx.model.TopicFollow.findOneAndUpdate(
        { topic_id: id, user_id: ctx.state.user._id },
        { topic_id: id, user_id: ctx.state.user._id },
        { upsert: true, new: true }
      );
      topic.follow_count += 1;
    } else {
      await ctx.model.TopicFollow.deleteOne({ topic_id: id, user_id: ctx.state.user._id });
      topic.follow_count = Math.max(0, topic.follow_count - 1);
    }

    topic.hot_score = this.calcHotScore(topic.follow_count, topic.comment_count, topic.createdAt);
    await topic.save();

    ctx.success({ follow_count: topic.follow_count, hot_score: topic.hot_score }, action === 'follow' ? '关注成功' : '取消关注成功');
  }
}

module.exports = TopicController;