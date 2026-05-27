/**
 * PropertyRating Model - 物业评价
 * 每用户每年对每个评分项只能评一次
 */
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const PropertyRatingSchema = new Schema({
    // 所属小区
    community_id: { type: Schema.Types.ObjectId, required: true },
    // 评价用户
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // 评分项ID（如 'service', 'repair', 'green'）
    rating_key: { type: String, required: true },
    // 评分分值 1-5
    score: { type: Number, required: true, min: 1, max: 5 },
    // 评价年份
    year: { type: Number, required: true },
  }, { timestamps: true });

  // 每用户每评分项每年只能评一次
  PropertyRatingSchema.index({ community_id: 1, user_id: 1, rating_key: 1, year: 1 }, { unique: true });

  return mongoose.model('PropertyRating', PropertyRatingSchema);
};