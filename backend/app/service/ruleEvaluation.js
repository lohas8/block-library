/**
 * RuleEvaluationService - 规则评估业务逻辑
 * 支持自动评分：满足条件（如上传凭证图片）自动计算积分
 */
const Service = require('egg').Service;

class RuleEvaluationService extends Service {
  // 获取模型（Egg-mongoose 中 ctx.model 是对象）
  get Evaluation() {
    return this.ctx.model.RuleEvaluation;
  }
  get Rule() {
    return this.ctx.model.Rule;
  }
  get RuleApproval() {
    return this.ctx.model.RuleApproval;
  }

  /**
   * 创建评估记录（用户提交申请时）
   * @param {Object} data - { ruleApprovalId, ruleId, userId, userName, communityId, images }
   */
  async create(data) {
    const { ruleApprovalId, ruleId, userId, userName, communityId, images = [] } = data;
    
    // 检查是否已有评估记录
    const existing = await this.Evaluation.findOne({ ruleApprovalId });
    if (existing) {
      this.ctx.throw(400, '该申请已有评估记录');
    }

    // 获取规则信息
    const rule = await this.Rule.findById(ruleId);
    if (!rule) {
      this.ctx.throw(404, '规则不存在');
    }

    // 创建评估记录
    const evaluation = new this.Evaluation({
      ruleApprovalId,
      ruleId,
      userId,
      userName,
      communityId: communityId || rule.communityId,
      images,
      status: 'pending',
    });

    await evaluation.save();

    // 满足自动评分条件：上传了至少1张图片
    if (images && images.length > 0) {
      await this.autoScore(evaluation._id, rule);
      // 重新获取更新后的评估记录
      return await this.Evaluation.findById(evaluation._id).lean();
    }

    return evaluation.toObject();
  }

  /**
   * 自动评分逻辑
   * @param {ObjectId} evaluationId 
   * @param {Object} rule - 规则对象（包含 points）
   */
  async autoScore(evaluationId, rule) {
    const evaluation = await this.Evaluation.findById(evaluationId);
    if (!evaluation || evaluation.status !== 'pending') {
      return null;
    }

    // 自动评分条件：上传了凭证图片
    const hasImages = evaluation.images && evaluation.images.length > 0;
    
    if (hasImages) {
      evaluation.status = 'scored';
      evaluation.points = rule.points || 0; // 使用规则配置的积分
      evaluation.autoScored = true;
      evaluation.scoredAt = new Date();
      evaluation.remark = '系统自动评分：通过上传凭证自动获得积分';
      
      await evaluation.save();

      // 更新申请状态为已批准
      await this.RuleApproval.findByIdAndUpdate(evaluation.ruleApprovalId, { status: 'approved' });

      return evaluation.toObject();
    }

    return null;
  }

  /**
   * 手动评分（管理员操作）
   * @param {ObjectId} evaluationId 
   * @param {Number} points - 评分积分
   * @param {String} remark - 备注
   */
  async manualScore(evaluationId, points, remark = '') {
    const evaluation = await this.Evaluation.findById(evaluationId);
    if (!evaluation) {
      this.ctx.throw(404, '评估记录不存在');
    }

    evaluation.status = 'scored';
    evaluation.points = points;
    evaluation.autoScored = false;
    evaluation.scoredAt = new Date();
    evaluation.remark = remark || '管理员手动评分';
    
    await evaluation.save();

    // 更新申请状态
    await this.RuleApproval.findByIdAndUpdate(evaluation.ruleApprovalId, { status: 'approved' });

    return evaluation.toObject();
  }

  /**
   * 驳回评估
   * @param {ObjectId} evaluationId 
   * @param {String} remark 
   */
  async reject(evaluationId, remark = '') {
    const evaluation = await this.Evaluation.findById(evaluationId);
    if (!evaluation) {
      this.ctx.throw(404, '评估记录不存在');
    }

    evaluation.status = 'rejected';
    evaluation.remark = remark || '评估未通过';
    evaluation.scoredAt = new Date();
    
    await evaluation.save();

    // 更新申请状态为已拒绝
    await this.RuleApproval.findByIdAndUpdate(evaluation.ruleApprovalId, { status: 'rejected' });

    return evaluation.toObject();
  }

  /**
   * 获取评估详情
   */
  async detail(id) {
    const evaluation = await this.Evaluation.findById(id)
      .populate('ruleId')
      .populate('ruleApprovalId')
      .lean();
    
    if (!evaluation) {
      this.ctx.throw(404, '评估记录不存在');
    }
    return evaluation;
  }

  /**
   * 评估列表
   */
  async list(params = {}) {
    const { communityId, status, userId, page = 1, pageSize = 10 } = params;
    const query = {};
    
    // 确保分页参数是数字
    const pageNum = parseInt(page, 10) || 1;
    const pageSizeNum = parseInt(pageSize, 10) || 10;
    
    if (communityId) query.communityId = communityId;
    if (status) query.status = status;
    if (userId) query.userId = userId;

    const skip = (pageNum - 1) * pageSizeNum;
    const [list, total] = await Promise.all([
      this.Evaluation.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSizeNum)
        .populate('ruleId')
        .lean(),
      this.Evaluation.countDocuments(query),
    ]);

    return { list, total, page: pageNum, pageSize: pageSizeNum };
  }

  /**
   * 获取用户的评估记录
   */
  async getByUser(userId, communityId) {
    const query = { userId };
    if (communityId) query.communityId = communityId;
    
    return this.Evaluation.find(query)
      .sort({ createdAt: -1 })
      .populate('ruleId')
      .lean();
  }

  /**
   * 上传图片凭证
   */
  async uploadImages(id, images) {
    const evaluation = await this.Evaluation.findById(id);
    if (!evaluation) {
      this.ctx.throw(404, '评估记录不存在');
    }

    // 最多9张图片
    const newImages = [...(evaluation.images || []), ...images].slice(0, 9);
    evaluation.images = newImages;
    await evaluation.save();

    // 如果之前未评分，尝试自动评分
    if (evaluation.status === 'pending') {
      const rule = await this.Rule.findById(evaluation.ruleId);
      if (rule && newImages.length > 0) {
        await this.autoScore(evaluation._id, rule);
        // 重新获取更新后的评估记录
        const updated = await this.Evaluation.findById(id).lean();
        return updated;
      }
    }

    return evaluation.toObject();
  }
}

module.exports = RuleEvaluationService;
