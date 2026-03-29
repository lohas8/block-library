/* eslint-disable */
const Controller = require('egg').Controller;

class UserController extends Controller {
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

    const user = await ctx.model.User.findById(id).select('-password');
    if (!user) {
      return ctx.fail('用户不存在');
    }

    ctx.success(user);
  }

  // 更新用户信息
  async update() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { name, phone, email } = ctx.request.body;

    const user = await ctx.model.User.findByIdAndUpdate(
      id,
      { name, phone, email },
      { new: true }
    ).select('-password');

    if (!user) {
      return ctx.fail('用户不存在');
    }

    ctx.success(user, '更新成功');
  }

  // 获取用户列表（管理员）
  async list() {
    const { ctx } = this;
    const { page = 1, pageSize = 10 } = ctx.query;

    const total = await ctx.model.User.countDocuments();
    const list = await ctx.model.User.find()
      .select('-password')
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ createdAt: -1 });

    ctx.success({ list, total, page: parseInt(page), pageSize: parseInt(pageSize) });
  }

  // 修改用户积分（管理员）
  async updatePoints() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { points, action } = ctx.request.body;  // action: add 或 subtract

    const user = await ctx.model.User.findById(id);
    if (!user) {
      return ctx.fail('用户不存在');
    }

    if (action === 'add') {
      user.points += points;
    } else {
      if (user.points < points) {
        return ctx.fail('积分不足');
      }
      user.points -= points;
    }

    await user.save();
    ctx.success({ points: user.points }, '积分更新成功');
  }

  // 获取借阅记录
  async borrowHistory() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { page = 1, pageSize = 10 } = ctx.query;

    const total = await ctx.model.BorrowRecord.countDocuments({ userId: id });
    const list = await ctx.model.BorrowRecord.find({ userId: id })
      .populate('bookId')
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ borrowDate: -1 });

    ctx.success({ list, total, page: parseInt(page), pageSize: parseInt(pageSize) });
  }
}

module.exports = UserController;
