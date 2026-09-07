/**
 * RuleApproval Model - 规则申请记录
 * 拆分出来以满足 egg-mongoose 的 model 加载机制
 */
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

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

  return mongoose.model('RuleApproval', RuleApprovalSchema);
};
