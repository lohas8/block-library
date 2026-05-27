/**
 * PropertyRatingService - 物业评价业务逻辑
 */
const Service = require('egg').Service;

class PropertyRatingService extends Service {
  /**
   * 评分统计（各评分项的平均分）
   */
  async getStats(communityId, year) {
    const y = year || new Date().getFullYear();
    const ratingKeys = ['service', 'repair', 'green'];
    const result = {};

    for (const key of ratingKeys) {
      const doc = await this.ctx.model.PropertyRating.aggregate([
        { $match: { community_id: communityId ? this.app.mongoose.Types.ObjectId(communityId) : null, rating_key: key, year: y } },
        { $group: { _id: null, avg: { $avg: '$score' }, count: { $sum: 1 } } },
      ]);
      if (doc.length > 0) {
        result[key] = { avg: Math.round(doc[0].avg * 10) / 10, count: doc[0].count };
      } else {
        result[key] = { avg: 0, count: 0 };
      }
    }

    return result;
  }

  /**
   * 提交评价
   */
  async create(data, userId) {
    const { community_id, rating_key, score } = data;
    const y = new Date().getFullYear();

    const existing = await this.ctx.model.PropertyRating.findOne({ community_id, user_id: userId, rating_key, year: y });
    if (existing) throw new Error('本年度已评价过此评分项');

    const rating = await this.ctx.model.PropertyRating.create({
      community_id,
      user_id: userId,
      rating_key,
      score,
      year: y,
    });

    return rating;
  }

  /**
   * 用户是否已评价某评分项
   */
  async hasRated(communityId, userId) {
    const y = new Date().getFullYear();
    const ratings = await this.ctx.model.PropertyRating.find({ community_id: communityId, user_id: userId, year: y });
    return ratings.reduce((acc, r) => { acc[r.rating_key] = true; return acc; }, {});
  }
}

module.exports = PropertyRatingService;