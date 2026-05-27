/**
 * VoteRecord Model - 投票记录（防止重复投票）
 */
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const VoteRecordSchema = new Schema({
    // 关联投票
    vote_id: { type: Schema.Types.ObjectId, ref: 'Vote', required: true },
    // 投票用户
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // 选择的选项ID（multi时逗号分隔的多个ID）
    selected_item_ids: { type: String, required: true },
    // 投票时间
    voted_at: { type: Date, default: Date.now },
  }, { timestamps: true });

  // 联合唯一索引：同一用户对同一投票只能投一次
  VoteRecordSchema.index({ vote_id: 1, user_id: 1 }, { unique: true });

  return mongoose.model('VoteRecord', VoteRecordSchema);
};