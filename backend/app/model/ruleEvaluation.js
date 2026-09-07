/**
 * RuleEvaluation Model - 规则评估（自动评分）
 * 用户申请规则时提交评估凭证，系统满足条件后自动评分
 */
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const RuleEvaluationSchema = new Schema({
    // 关联的申请记录
    ruleApprovalId: { 
      type: Schema.Types.ObjectId, 
      ref: 'RuleApproval', 
      required: true 
    },
    // 关联规则
    ruleId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Rule', 
      required: true 
    },
    // 申请人
    userId: { 
      type: String, 
      required: true 
    },
    userName: { 
      type: String, 
      default: '' 
    },
    // 小区
    communityId: { 
      type: String, 
      default: '' 
    },
    // 图片凭证（最多9张）
    images: [{ 
      type: String 
    }],
    // 评估状态
    status: { 
      type: String, 
      enum: ['pending', 'scored', 'rejected'], 
      default: 'pending' 
    },
    // 获得积分（审批通过后获得）
    points: { 
      type: Number, 
      default: 0 
    },
    // 自动评分标记（是否满足自动评分条件）
    autoScored: { 
      type: Boolean, 
      default: false 
    },
    // 评分备注
    remark: { 
      type: String, 
      default: '' 
    },
    // 评估时间
    scoredAt: { 
      type: Date 
    }
  }, { 
    timestamps: true 
  });

  // 索引优化查询
  RuleEvaluationSchema.index({ userId: 1, communityId: 1 });
  RuleEvaluationSchema.index({ ruleApprovalId: 1 });
  RuleEvaluationSchema.index({ status: 1, communityId: 1 });

  return mongoose.model('RuleEvaluation', RuleEvaluationSchema);
};
