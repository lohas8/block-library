/**
 * VoteItem Model - 投票选项
 */
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const VoteItemSchema = new Schema({
    // 关联投票
    vote_id: { type: Schema.Types.ObjectId, ref: 'Vote', required: true },
    // 选项标题（如"同意"/"反对"或"方案A"/"方案B"）
    label: { type: String, required: true, maxLength: 50 },
    // 选项颜色（前端展示用）
    color: { type: String, default: '#4caf50' },
    // 排序顺序
    order: { type: Number, default: 0 },
    // 得票数（冗余）
    vote_count: { type: Number, default: 0 },
  }, { timestamps: true });

  VoteItemSchema.index({ vote_id: 1 });

  return mongoose.model('VoteItem', VoteItemSchema);
};