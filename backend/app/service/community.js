// 小区管理服务
const Service = require('egg').Service;

class CommunityService extends Service {
  // 小区列表
  async list(params = {}) {
    const { status, page = 1, pageSize = 10 } = params;
    const query = {};
    
    if (status) query.status = status;

    const skip = (page - 1) * pageSize;
    const [list, total] = await Promise.all([
      this.ctx.model.Community.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      this.ctx.model.Community.countDocuments(query),
    ]);

    return { list, total, page, pageSize };
  }

  // 小区详情
  async detail(id) {
    const community = await this.ctx.model.Community.findById(id).lean();
    if (!community) {
      this.ctx.throw(404, '小区不存在');
    }
    return community;
  }

  // 创建小区
  async create(data) {
    const community = new this.ctx.model.Community(data);
    await community.save();
    return community.toObject();
  }

  // 更新小区
  async update(id, data) {
    const community = await this.ctx.model.Community.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();
    
    if (!community) {
      this.ctx.throw(404, '小区不存在');
    }
    return community;
  }

  // 删除小区
  async delete(id) {
    const result = await this.ctx.model.Community.findByIdAndDelete(id);
    if (!result) {
      this.ctx.throw(404, '小区不存在');
    }
    return { msg: '删除成功' };
  }
}

module.exports = CommunityService;
