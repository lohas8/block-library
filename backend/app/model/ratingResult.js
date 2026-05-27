/**
 * RatingResult Model - 物业评价结果（业主提交）
 * 每次提交包含对所有小项的评分
 */
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const RatingResultSchema = new Schema({
    // 所属小区
    community_id: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
    // 评价用户
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // 评价年份
    year: { type: Number, required: true },
    // 每小项的评分 { item_key: score(1-5) }
    scores: { type: Map, of: { type: Number, min: 1, max: 5 } },
    // 各评分项独立存储（方便统计）
    ratings: [{
      category_id: { type: Schema.Types.ObjectId, ref: 'RatingCategory' },
      category_name: { type: String },
      item_key: { type: String },
      item_name: { type: String },
      score: { type: Number, min: 1, max: 5 },
    }],
    // 提交时间
    submitted_at: { type: Date, default: Date.now },
  }, { timestamps: true });

  // 每用户每年只能提交一次
  RatingResultSchema.index({ community_id: 1, user_id: 1, year: 1 }, { unique: true });
  RatingResultSchema.index({ community_id: 1, year: 1 });

  return mongoose.model('RatingResult', RatingResultSchema);
};