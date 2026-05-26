/* eslint-disable */
const { BaseController, NotFoundError, ForbiddenError, ValidationError } = require('../core/base_controller');

/**
 * TopicController - 议题控制器（瘦控制器）
 * 职责：参数解析、权限校验、HTTP 响应
 * 业务逻辑：委托给 TopicService
 */
class TopicController extends BaseController {
  // 议题列表
  async list() {
    try {
      const { page, pageSize, status, sort, community_id } = this.ctx.query;
      const result = await this.ctx.service.topic.getList({
        status, sort, page, pageSize, community_id,
      });
      this.success(result);
    } catch (err) {
      this.fail(err.message || '获取议题列表失败');
    }
  }

  // 议题详情
  async detail() {
    try {
      const { id } = this.ctx.params;
      const userId = this.ctx.state.user?._id;
      const topic = await this.ctx.service.topic.getDetail(id, userId);
      if (!topic) throw new NotFoundError('议题不存在');
      this.success(topic);
    } catch (err) {
      if (err instanceof NotFoundError) {
        this.fail(err.message, 404);
      } else {
        this.fail(err.message || '获取议题详情失败');
      }
    }
  }

  // 创建议题（业主权限）
  async create() {
    try {
      this.requireAuth();
      const { title, content, community_id, tags, images } = this.ctx.request.body;
      if (!title?.trim()) throw new ValidationError('标题不能为空');
      if (!content?.trim()) throw new ValidationError('内容不能为空');
      if (title.length > 100) throw new ValidationError('标题最多100字');
      if (content.length > 5000) throw new ValidationError('内容最多5000字');

      const topic = await this.ctx.service.topic.create({
        title: title.trim(),
        content: content.trim(),
        community_id,
        tags: tags || [],
        images: images || [],
        author_id: this.ctx.state.user._id,
        author_name: this.ctx.state.user.name,
      });
      this.success(topic, '创建议题成功');
    } catch (err) {
      this.fail(err.message || '创建议题失败');
    }
  }

  // 修改议题状态（管理员）
  async updateStatus() {
    try {
      this.requireAdmin();
      const { id } = this.ctx.params;
      const { status } = this.ctx.request.body;
      if (!status) throw new ValidationError('状态不能为空');

      const topic = await this.ctx.service.topic.updateStatus(id, status);
      if (!topic) throw new NotFoundError('议题不存在');
      this.success(topic, '状态更新成功');
    } catch (err) {
      this.fail(err.message || '更新状态失败');
    }
  }

  // 设置/取消焦点议题（管理员）
  async setFocus() {
    try {
      this.requireAdmin();
      const { id } = this.ctx.params;
      const { is_focused } = this.ctx.request.body;
      if (typeof is_focused !== 'boolean') throw new ValidationError('is_focused 参数错误');

      const topic = await this.ctx.service.topic.setFocus(id, is_focused);
      if (!topic) throw new NotFoundError('议题不存在');
      this.success(topic, is_focused ? '已设为焦点议题' : '已取消焦点议题');
    } catch (err) {
      this.fail(err.message || '设置焦点议题失败');
    }
  }

  // 关注/取消关注（全体已登录用户）
  async follow() {
    try {
      this.requireAuth();
      const { id } = this.ctx.params;
      const { action } = this.ctx.request.body;
      if (!action || !['follow', 'unfollow'].includes(action)) {
        throw new ValidationError('action 参数错误');
      }

      const result = await this.ctx.service.topic.follow(id, this.ctx.state.user._id, action);
      if (!result) throw new NotFoundError('议题不存在');
      this.success(result, action === 'follow' ? '关注成功' : '取消关注成功');
    } catch (err) {
      this.fail(err.message || '关注操作失败');
    }
  }

  // 刷新热度分（管理员）
  async refreshHotScores() {
    try {
      this.requireAdmin();
      await this.ctx.service.topic.refreshHotScores();
      this.success(null, '热度分刷新完成');
    } catch (err) {
      this.fail('刷新热度分失败');
    }
  }
}

module.exports = TopicController;