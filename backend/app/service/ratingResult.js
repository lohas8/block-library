/**
 * RatingResultService - 物业评价结果（业主提交）
 */
const Service = require('egg').Service;

class RatingResultService extends Service {
  /**
   * 评分统计（各小项平均分）
   */
  async getStats(communityId, year) {
    const y = year || new Date().getFullYear();
    const results = await this.ctx.model.RatingResult.find({
      community_id: communityId,
      year: y,
    });

    // 按小项聚合
    const itemStats = {};
    results.forEach(r => {
      r.ratings.forEach(rating => {
        if (!itemStats[rating.item_key]) {
          itemStats[rating.item_key] = { total: 0, count: 0, item_name: rating.item_name, category_name: rating.category_name };
        }
        itemStats[rating.item_key].total += rating.score;
        itemStats[rating.item_key].count += 1;
      });
    });

    // 计算平均分
    const stats = Object.entries(itemStats).map(([key, val]) => ({
      item_key: key,
      item_name: val.item_name,
      category_name: val.category_name,
      avg: Math.round((val.total / val.count) * 10) / 10,
      count: val.count,
    }));

    return {
      year: y,
      total_raters: results.length,
      items: stats,
    };
  }

  /**
   * 提交评价（一次性提交所有小项）
   */
  async submit(data, userId) {
    const { community_id, year, scores } = data;
    const y = year || new Date().getFullYear();

    // 每用户每年只能提交一次
    const existing = await this.ctx.model.RatingResult.findOne({
      community_id, user_id: userId, year: y,
    });
    if (existing) throw new Error('本年度已提交过评价，请勿重复提交');

    // 获取配置，拉平各小项名称
    const categories = await this.ctx.model.RatingCategory.find({
      community_id, enabled: true,
    }).sort({ order: 1 });

    // 将 scores (Map 或 object) 转为评分数组
    const allRatings = [];
    categories.forEach(cat => {
      cat.items.forEach(item => {
        const score = scores[item.item_key] || scores[item.item_key] || 0;
        if (score > 0) {
          allRatings.push({
            category_id: cat._id,
            category_name: cat.name,
            item_key: item.item_key,
            item_name: item.item_name,
            score: parseInt(score),
          });
        }
      });
    });

    const result = await this.ctx.model.RatingResult.create({
      community_id,
      user_id: userId,
      year: y,
      scores,
      ratings: allRatings,
    });

    return result;
  }

  /**
   * 检查用户是否已评价
   */
  async hasSubmitted(communityId, userId, year) {
    const y = year || new Date().getFullYear();
    const result = await this.ctx.model.RatingResult.findOne({
      community_id, user_id: userId, year: y,
    });
    return !!result;
  }
}

module.exports = RatingResultService;