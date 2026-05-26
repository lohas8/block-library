/* eslint-disable */
const Controller = require('egg').Controller;

/**
 * TopicController - 议题控制器（瘦控制器，委托给 Service 层）
 * 职责：参数解析、权限校验、HTTP 响应、异常捕获
 * 业务逻辑：全部委托给 TopicService
 */
class TopicController extends Controller {
  // 议题列表
  async list() {
    const { ctx } = this;
    try {
      const { page = 1, pageSize = 10, status, sort = 'hot', community_id } = ctx.query;
      const result = await ctx.service.topic.getList({ status, sort, page, pageSize, community_id });
      ctx.success(result);
    } catch (err) {
      ctx.fail('获取议题列表失败');
    }
  }

  // 议题详情
  async detail() {
    const { ctx } = this;
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user?._id;
      const topic = await ctx.service.topic.getDetail(id, userId);
      if (!topic) return ctx.fail('议题不存在');
      ctx.success(topic);
    } catch (err) {
      ctx.fail('获取议题详情失败');
    }
  }

  // 创建议题（业主权限）
  async create() {
    const { ctx } = this;
    try {
      if (!ctx.state.user) return ctx.fail('请先登录');
      const { title, content, community_id, tags, images } = ctx.request.body;
      if (!title || !content) return ctx.fail('标题和内容不能为空');

      const topic = await ctx.service.topic.create({
        title,
        content,
        community_id,
        tags,
        images,
        author_id: ctx.state.user._id,
        author_name: ctx.state.user.name,
      });
      ctx.success(topic, '创建议题成功');
    } catch (err) {
      ctx.fail(err.message || '创建议题失败');
    }
  }

  // 修改议题状态（管理员权限）
  async updateStatus() {
    const { ctx } = this;
    try {
      if (ctx.state.user?.role !== 'admin' && ctx.state.user?.role !== 'super_admin') {
        return ctx.fail('无权限，只有管理员可以修改状态');
      }
      const { id } = ctx.params;
      const { status } = ctx.request.body;
      if (!status) return ctx.fail('状态不能为空');

      const topic = await ctx.service.topic.updateStatus(id, status);
      if (!topic) return ctx.fail('议题不存在');
      ctx.success(topic, '状态更新成功');
    } catch (err) {
      ctx.fail(err.message || '更新状态失败');
    }
  }

  // 设置/取消焦点议题（管理员权限）
  async setFocus() {
    const { ctx } = this;
    try {
      if (ctx.state.user?.role !== 'admin' && ctx.state.user?.role !== 'super_admin') {
        return ctx.fail('无权限，只有管理员可以设置焦点议题');
      }
      const { id } = ctx.params;
      const { is_focused } = ctx.request.body;

      const topic = await ctx.service.topic.setFocus(id, is_focused);
      if (!topic) return ctx.fail('议题不存在');
      ctx.success(topic, is_focused ? '已设为焦点议题' : '已取消焦点议题');
    } catch (err) {
      ctx.fail(err.message || '设置焦点议题失败');
    }
  }

  // 关注/取消关注（全体已登录用户）
  async follow() {
    const { ctx } = this;
    try {
      if (!ctx.state.user) return ctx.fail('请先登录');
      const { id } = ctx.params;
      const { action } = ctx.request.body;
      if (!action || !['follow', 'unfollow'].includes(action)) {
        return ctx.fail('action 参数错误');
      }

      const result = await ctx.service.topic.follow(id, ctx.state.user._id, action);
      if (!result) return ctx.fail('议题不存在');
      ctx.success(result, action === 'follow' ? '关注成功' : '取消关注成功');
    } catch (err) {
      ctx.fail(err.message || '关注操作失败');
    }
  }

  // 刷新热度分（管理员）
  async refreshHotScores() {
    const { ctx } = this;
    try {
      if (ctx.state.user?.role !== 'admin' && ctx.state.user?.role !== 'super_admin') {
        return ctx.fail('无权限');
      }
      await ctx.service.topic.refreshHotScores();
      ctx.success(null, '热度分刷新完成');
    } catch (err) {
      ctx.fail('刷新热度分失败');
    }
  }
}

module.exports = TopicController;