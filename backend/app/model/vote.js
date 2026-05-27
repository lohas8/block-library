/**
 * Vote Model - 投票模块
 * 支持二选一投票和多选投票
 */
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const VoteSchema = new Schema({
    // 投票标题
    title: { type: String, required: true, maxLength: 100 },
    // 投票说明
    content: { type: String, maxLength: 2000 },
    // 所属小区
    community_id: { type: Schema.Types.ObjectId },
    // 投票类型：binary=二选一，multi=多选
    vote_type: { type: String, enum: ['binary', 'multi'], default: 'binary' },
    // 状态：active=进行中，closed=已结束
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
    // 截止时间
    deadline: { type: Date },
    // 创建人（管理员）
    created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    created_by_name: { type: String },
    // 冗余计数字段
    total_votes: { type: Number, default: 0 },
    // 是否关联议事议题（可选）
    topic_id: { type: Schema.Types.ObjectId, ref: 'Topic' },
  }, { timestamps: true });

  VoteSchema.index({ community_id: 1, status: 1 });
  VoteSchema.index({ status: 1, created_at: -1 });

  return mongoose.model('Vote', VoteSchema);
};