/* eslint-disable */
const { BaseController } = require('../core/base_controller');

class UserController extends BaseController {
  // 用户注册
  async register() {
    const { ctx } = this;
    const { username, password, name, phone, email } = ctx.request.body;

    if (!username || !password || !name) {
      return ctx.fail('请填写必要信息');
    }

    // 检查用户名是否已存在
    const existUser = await ctx.model.User.findOne({ username });
    if (existUser) {
      return ctx.fail('用户名已存在');
    }

    const user = await ctx.model.User.create({
      username,
      password,
      name,
      phone,
      email,
      points: ctx.config.points.defaultPoints,
    });

    ctx.success({ id: user._id, username: user.username, name: user.name }, '注册成功');
  }

  // 用户登录
  async login() {
    const { ctx } = this;
    const { username, password } = ctx.request.body;

    const user = await ctx.model.User.findOne({ username });
    if (!user) {
      return ctx.fail('用户名或密码错误');
    }

    if (!user.comparePassword(password)) {
      return ctx.fail('用户名或密码错误');
    }

    // 生成 token（简化处理，实际应使用 JWT）
    const token = Buffer.from(`${user._id}:${user.username}`).toString('base64');

    ctx.success({
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
      ctx.success(user);
    } catch (e) {
      ctx.fail(e.message);
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
      ctx.success(user, '更新成功');
    } catch (e) {
      ctx.fail(e.message);
    }
  }

  // 获取用户列表（管理员）
  async list() {
    const { ctx } = this;
    const { page = 1, pageSize = 10 } = ctx.query;

    try {
      const result = await ctx.service.user.getList({ page, pageSize });
      ctx.success(result);
    } catch (e) {
      ctx.fail(e.message);
    }
  }

  // 修改用户积分（管理员）
  async updatePoints() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { points, action } = ctx.request.body;

    try {
      const result = await ctx.service.user.updatePoints(id, { points, action });
      ctx.success({ points: result.points }, '积分更新成功');
    } catch (e) {
      ctx.fail(e.message);
    }
  }

  // 获取借阅记录
  async borrowHistory() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { page = 1, pageSize = 10 } = ctx.query;

    try {
      const result = await ctx.service.user.getBorrowHistory(id, { page, pageSize });
      ctx.success(result);
    } catch (e) {
      ctx.fail(e.message);
    }
  }
}

module.exports = UserController;