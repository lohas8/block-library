// 规则管理模型
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const RuleSchema = new Schema({
    name: { type: String, required: true },
    content: { type: String, default: '' },
    points: { type: Number, default: 0 },  // 正数奖励，负数惩罚
    type: { 
      type: String, 
      enum: ['reward', 'punishment'], 
      default: 'reward' 
    },
    communityId: { type: String, default: '' },
    status: { 
      type: String, 
      enum: ['active', 'disabled'], 
      default: 'active' 
    },
  }, { 
    timestamps: true 
  });

  // 规则申请记录
  const RuleApprovalSchema = new Schema({
    ruleId: { type: Schema.Types.ObjectId, ref: 'Rule', required: true },
    userId: { type: String, required: true },
    userName: { type: String, default: '' },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending' 
    },
    communityId: { type: String, default: '' },
    remark: { type: String, default: '' },
  }, { 
    timestamps: true 
  });

  return {
    Rule: mongoose.model('Rule', RuleSchema),
    RuleApproval: mongoose.model('RuleApproval', RuleApprovalSchema),
  };
};
