// 工具共享服务
const Service = require('egg').Service;

class ToolService extends Service {
  // 工具列表
  async list(params = {}) {
    const { category, status, page = 1, pageSize = 10 } = params;
    const query = {};
    
    if (category) query.category = category;
    if (status) query.status = status;

    const skip = (page - 1) * pageSize;
    const [list, total] = await Promise.all([
      this.ctx.model.Tool.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      this.ctx.model.Tool.countDocuments(query),
    ]);

    return { list, total, page, pageSize };
  }

  // 工具详情
  async detail(id) {
    const tool = await this.ctx.model.Tool.findById(id).lean();
    if (!tool) {
      this.ctx.throw(404, '工具不存在');
    }
    return tool;
  }

  // 创建工具
  async create(data) {
    const tool = new this.ctx.model.Tool(data);
    await tool.save();
    return tool.toObject();
  }

  // 更新工具
  async update(id, data) {
    const tool = await this.ctx.model.Tool.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();
    
    if (!tool) {
      this.ctx.throw(404, '工具不存在');
    }
    return tool;
  }

  // 删除工具
  async delete(id) {
    const result = await this.ctx.model.Tool.findByIdAndDelete(id);
    if (!result) {
      this.ctx.throw(404, '工具不存在');
    }
    return { msg: '删除成功' };
  }

  // 分类列表
  async categories() {
    const cats = await this.ctx.model.Tool.distinct('category');
    return cats.filter(c => c); // 过滤空值
  }

  // 租用工具
  async rent({ toolId, userId, userName, days }) {
    const tool = await this.ctx.model.Tool.findById(toolId);
    if (!tool) {
      this.ctx.throw(404, '工具不存在');
    }
    if (tool.status === 'borrowed') {
      this.ctx.throw(400, '工具已被借出');
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);

    tool.status = 'borrowed';
    tool.borrower = userId;
    tool.borrowerName = userName;
    tool.dueDate = dueDate.toISOString().split('T')[0];
    tool.borrowedAt = new Date();

    await tool.save();
    return tool.toObject();
  }

  // 归还工具
  async Return(toolId) {
    const tool = await this.ctx.model.Tool.findById(toolId);
    if (!tool) {
      this.ctx.throw(404, '工具不存在');
    }
    if (tool.status === 'available') {
      this.ctx.throw(400, '工具未被借出');
    }

    tool.status = 'available';
    tool.borrower = null;
    tool.borrowerName = null;
    tool.dueDate = null;
    tool.borrowedAt = null;

    await tool.save();
    return tool.toObject();
  }

  // 统计
  async statistics() {
    const [total, available, borrowed] = await Promise.all([
      this.ctx.model.Tool.countDocuments(),
      this.ctx.model.Tool.countDocuments({ status: 'available' }),
      this.ctx.model.Tool.countDocuments({ status: 'borrowed' }),
    ]);

    return { totalTools: total, available, borrowed };
  }
}

module.exports = ToolService;
