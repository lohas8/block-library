/* eslint-disable */
const { BaseController } = require('../core/base_controller');

class UserController extends BaseController {
  // 用户注册
  async register() {
    const { ctx } = this;
    const { username, password, name, phone, email } = ctx.request.body;

    if (!username || !password || !name) {
      return this.fail('请填写必要信息', -1, 400);
    }

    // 检查用户名是否已存在
    const existUser = await ctx.model.User.findOne({ username });
    if (existUser) {
      return this.fail('用户名已存在', -1, 400);
    }

    const user = await ctx.model.User.create({
      username,
      password,
      name,
      phone,
      email,
      points: 0,
      role: ctx.request.body.role || 'user',
    });

    const token = Buffer.from(`${user._id}:${user.username}:${user.role}`).toString('base64');
    this.success({ id: user._id, username: user.username, name: user.name, token }, '注册成功');
  }

  // 用户登录
  async login() {
    const { ctx } = this;
    const { username, password } = ctx.request.body;

    const user = await ctx.model.User.findOne({ username });
    if (!user) {
      return this.fail('用户名或密码错误');
    }

    if (!user.comparePassword(password)) {
      return this.fail('用户名或密码错误');
    }

    // 生成 token: base64(userId:username:role)
    const token = Buffer.from(`${user._id}:${user.username}:${user.role}`).toString('base64');

    this.success({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        points: user.points,
        role: user.role,
      },
    }, '登录成功');
  }

  // 获取用户信息
  async detail() {
    const { ctx } = this;
    const { id } = ctx.params;

    try {
      const user = await ctx.service.user.getDetail(id);
      this.success(user);
    } catch (e) {
      this.fail(e.message);
    }
  }

  // 更新用户信息
  async update() {
    const { ctx } = this;
    const { id } = ctx.params;
    const data = ctx.request.body;
    const operator = ctx.state.user || {};

    try {
      const user = await ctx.service.user.update(id, data, operator.id, operator.role);
      this.success(user, '更新成功');
    } catch (e) {
      this.fail(e.message);
    }
  }

  // 获取用户列表（管理员）
  async list() {
    this.requireAdmin();
    const { ctx } = this;
    const { page = 1, pageSize = 10 } = ctx.query;

    try {
      const result = await ctx.service.user.getList({ page, pageSize });
      this.success(result);
    } catch (e) {
      this.fail(e.message);
    }
  }

  // 修改用户积分（管理员）
  async updatePoints() {
    this.requireAdmin();
    const { ctx } = this;
    const { id } = ctx.params;
    const { points, action } = ctx.request.body;

    try {
      const result = await ctx.service.user.updatePoints(id, { points, action });
      this.success({ points: result.points }, '积分更新成功');
    } catch (e) {
      this.fail(e.message);
    }
  }

  // 获取借阅记录
  async borrowHistory() {
    this.requireAuth();
    const { ctx } = this;
    const { id } = ctx.params;
    const { page = 1, pageSize = 10 } = ctx.query;

    try {
      const result = await ctx.service.user.getBorrowHistory(id, { page, pageSize });
      this.success(result);
    } catch (e) {
      this.fail(e.message);
    }
  }

  // 获取邀请我的人
  async getInvitedBy() {
    const { ctx } = this;
    const { id } = ctx.params;

    try {
      const result = await ctx.service.user.getInvitedBy(id);
      ctx.success(result);
    } catch (e) {
      ctx.fail(e.message);
    }
  }

  // 获取我的邀请列表
  async getInvites() {
    const { ctx } = this;
    const { id } = ctx.params;

    try {
      const result = await ctx.service.user.getInvites(id);
      ctx.success({ list: result });
    } catch (e) {
      ctx.fail(e.message);
    }
  }

  // 获取用户参与的规则申请
  async getAppliedRules() {
    const { ctx } = this;
    const { id } = ctx.params;

    try {
      const result = await ctx.service.user.getAppliedRules(id);
      ctx.success({ list: result });
    } catch (e) {
      ctx.fail(e.message);
    }
  }
}

module.exports = UserController;