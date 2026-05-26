/**
 * UserService - 用户模块业务逻辑层
 * 负责用户相关的业务逻辑、数据组装
 */
const Service = require('egg').Service;

class UserService extends Service {
  /**
   * 用户列表（管理员）
   */
  async getList({ page = 1, pageSize = 20 }) {
    const total = await this.ctx.model.User.countDocuments();
    const list = await this.ctx.model.User.find()
      .select('-password')
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ createdAt: -1 });
    return { list, total, page: parseInt(page), pageSize: parseInt(pageSize) };
  }

  /**
   * 用户详情
   */
  async getDetail(id) {
    const user = await this.ctx.model.User.findById(id).select('-password');
    if (!user) {
      throw new Error('用户不存在');
    }
    return user;
  }

  /**
   * 更新用户信息（只能改自己的，或 admin 改所有人）
   * operatorId: 当前操作用户ID
   * operatorRole: 当前用户角色
   */
  async update(id, data, operatorId, operatorRole) {
    // 权限校验：只能修改自己，或者 admin/super_admin 可以修改所有人
    if (String(id) !== String(operatorId) && operatorRole !== 'admin' && operatorRole !== 'super_admin') {
      throw new Error('无权限修改此用户信息');
    }

    const { name, phone, email } = data;
    const user = await this.ctx.model.User.findByIdAndUpdate(
      id,
      { name, phone, email },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new Error('用户不存在');
    }
    return user;
  }

  /**
   * 获取邀请我的人（基于邀请关系的实现）
   */
  async getInvitedBy(userId) {
    // 当前 User 模型没有 invitedBy 字段，这里按关联查询实现
    // 如果后续有邀请关系表，可在此扩展
    const user = await this.ctx.model.User.findById(userId).select('-password');
    if (!user) {
      throw new Error('用户不存在');
    }
    // 暂返回空数组，待邀请关系表实现后扩展
    return [];
  }

  /**
   * 获取我的邀请列表
   */
  async getInvites(userId) {
    const user = await this.ctx.model.User.findById(userId).select('-password');
    if (!user) {
      throw new Error('用户不存在');
    }
    // 暂返回空数组，待邀请关系表实现后扩展
    return [];
  }

  /**
   * 搜索用户（按姓名/用户名）
   */
  async search(keyword) {
    if (!keyword) {
      throw new Error('搜索关键字不能为空');
    }
    const list = await this.ctx.model.User.find({
      $or: [
        { name: new RegExp(keyword, 'i') },
        { username: new RegExp(keyword, 'i') },
      ],
    })
      .select('-password')
      .limit(20);
    return list;
  }

  /**
   * 修改用户积分（管理员）
   */
  async updatePoints(id, { points, action }) {
    const user = await this.ctx.model.User.findById(id);
    if (!user) {
      throw new Error('用户不存在');
    }

    if (action === 'add') {
      user.points += points;
    } else {
      if (user.points < points) {
        throw new Error('积分不足');
      }
      user.points -= points;
    }

    await user.save();
    return { points: user.points };
  }

  /**
   * 获取用户借阅记录
   */
  async getBorrowHistory(userId, { page = 1, pageSize = 10 }) {
    const total = await this.ctx.model.BorrowRecord.countDocuments({ userId });
    const list = await this.ctx.model.BorrowRecord.find({ userId })
      .populate('bookId')
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ borrowDate: -1 });
    return { list, total, page: parseInt(page), pageSize: parseInt(pageSize) };
  }
}

module.exports = UserService;