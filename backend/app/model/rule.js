/**
 * Rule Model - 规则管理
 */
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

  return mongoose.model('Rule', RuleSchema);
};
