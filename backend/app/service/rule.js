// 规则管理服务
const Service = require('egg').Service;

class RuleService extends Service {
  // 获取模型（Egg-mongoose 中 ctx.model 是对象，直接用 ctx.model.Rule 访问）
  get Rule() {
    return this.ctx.model.Rule;
  }
  get RuleApproval() {
    return this.ctx.model.RuleApproval;
  }

  // 规则列表
  async list(params = {}) {
    const { communityId, status, page = 1, pageSize = 10 } = params;
    const query = {};
    
    if (communityId) query.communityId = communityId;
    if (status) query.status = status;

    const skip = (page - 1) * pageSize;
    const [list, total] = await Promise.all([
      this.Rule.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      this.Rule.countDocuments(query),
    ]);

    return { list, total, page, pageSize };
  }

  // 规则详情
  async detail(id) {
    const rule = await this.Rule.findById(id).lean();
    if (!rule) {
      throw new Error('规则不存在');
    }
    return rule;
  }

  // 创建规则
  async create(data) {
    const rule = new this.Rule(data);
    await rule.save();
    return rule.toObject();
  }

  // 更新规则
  async update(id, data) {
    const rule = await this.Rule.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();
    
    if (!rule) {
      throw new Error('规则不存在');
    }
    return rule;
  }

  // 删除规则
  async delete(id) {
    const result = await this.Rule.findByIdAndDelete(id);
    if (!result) {
      throw new Error('规则不存在');
    }
    // 同时删除相关申请
    await this.RuleApproval.deleteMany({ ruleId: id });
    return { msg: '删除成功' };
  }

  // 申请规则（用户发起）
  async apply(ruleId, userId, userName, data = {}) {
    const rule = await this.Rule.findById(ruleId);
    if (!rule) {
      throw new Error('规则不存在');
    }

    // 检查是否有待处理的申请
    const existing = await this.RuleApproval.findOne({
      ruleId,
      userId,
      status: 'pending',
    });
    if (existing) {
      throw new Error('已有待处理的申请');
    }

    const approval = new this.RuleApproval({
      ruleId,
      userId,
      userName,
      communityId: rule.communityId,
      ...data,
    });
    await approval.save();
    return approval.toObject();
  }

  // 批准申请
  async approve(approvalId) {
    const approval = await this.RuleApproval.findById(approvalId);
    if (!approval) {
      throw new Error('申请不存在');
    }
    if (approval.status !== 'pending') {
      throw new Error('申请已被处理');
    }

    approval.status = 'approved';
    await approval.save();
    return approval.toObject();
  }

  // 拒绝申请
  async reject(approvalId, remark = '') {
    const approval = await this.RuleApproval.findById(approvalId);
    if (!approval) {
      throw new Error('申请不存在');
    }
    if (approval.status !== 'pending') {
      throw new Error('申请已被处理');
    }

    approval.status = 'rejected';
    approval.remark = remark;
    await approval.save();
    return approval.toObject();
  }

  // 申请列表
  async listApprovals(params = {}) {
    const { communityId, status, page = 1, pageSize = 10 } = params;
    const query = {};
    
    if (communityId) query.communityId = communityId;
    if (status) query.status = status;

    const skip = (page - 1) * pageSize;
    const [list, total] = await Promise.all([
      this.RuleApproval.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate('ruleId')
        .lean(),
      this.RuleApproval.countDocuments(query),
    ]);

    return { list, total, page, pageSize };
  }

  // 获取用户已申请的规则
  async getAppliedRules(userId) {
    const approvals = await this.RuleApproval.find({ userId })
      .sort({ createdAt: -1 })
      .populate('ruleId')
      .lean();
    return approvals;
  }
}

module.exports = RuleService;
