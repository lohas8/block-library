/**
 * BaseController - 所有控制器的基类
 * 统一错误处理 + 统一响应格式 + 统一分页参数解析
 *
 * 规范：
 * - 业务异常使用 app.core.exceptions 中的类
 * - 所有 Controller extends BaseController
 * - try/catch 统一在每个 action 中处理
 */
const { Controller } = require('egg');
const {
  AppError,
  ForbiddenError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
  ConflictError,
} = require('./exceptions');

class BaseController extends Controller {
  /**
   * 统一成功响应
   * @param {*} data 响应数据
   * @param {string} msg 提示信息
   */
  success(data, msg = 'success') {
    this.ctx.body = {
      code: 0,
      msg,
      data,
    };
    this.ctx.status = 200;
  }

  /**
   * 统一失败响应
   * @param {string} msg 错误信息
   * @param {number} code 错误码（默认 -1）
   */
  fail(msg, code = -1) {
    this.ctx.body = {
      code,
      msg,
      data: null,
    };
    this.ctx.status = 200;
  }

  /**
   * 获取分页参数（自动从 query 中读取）
   * @param {object} options
   * @param {number} options.defaultPageSize
   * @param {number} options.maxPageSize
   */
  getPageParams(options = {}) {
    const { defaultPageSize = 10, maxPageSize = 100 } = options;
    const { page = 1, pageSize = defaultPageSize } = this.ctx.query;
    return {
      page: Math.max(1, parseInt(page) || 1),
      pageSize: Math.min(maxPageSize, parseInt(pageSize) || defaultPageSize),
    };
  }

  /**
   * 检查当前用户是否已登录（未登录直接抛异常）
   */
  requireAuth() {
    if (!this.ctx.state.user) {
      throw new UnauthorizedError();
    }
    return this.ctx.state.user;
  }

  /**
   * 检查是否为管理员（admin 或 super_admin）
   */
  requireAdmin() {
    const user = this.requireAuth();
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      throw new ForbiddenError('仅管理员可操作');
    }
    return user;
  }

  /**
   * 解析 body 中的分页参数
   */
  getBodyPageParams(options = {}) {
    const { defaultPageSize = 10, maxPageSize = 100 } = options;
    const body = this.ctx.request.body || {};
    const { page = 1, pageSize = defaultPageSize } = body;
    return {
      page: Math.max(1, parseInt(page) || 1),
      pageSize: Math.min(maxPageSize, parseInt(pageSize) || defaultPageSize),
    };
  }
}

module.exports = {
  BaseController,
  AppError,
  ForbiddenError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
  ConflictError,
};