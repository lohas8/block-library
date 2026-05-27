/**
 * RatingCategoryService - 评价配置管理
 */
const Service = require('egg').Service;

class RatingCategoryService extends Service {
  async getList(communityId) {
    const query = { enabled: true };
    if (communityId) query.community_id = communityId;
    return this.ctx.model.RatingCategory.find(query).sort({ order: 1 });
  }

  async create(data) {
    const { community_id, name, items } = data;
    const category = await this.ctx.model.RatingCategory.create({
      community_id,
      name,
      items: (items || []).map((item, i) => ({
        item_key: item.item_key,
        item_name: item.item_name,
        order: i,
      })),
      order: 0,
    });
    return category;
  }

  async update(id, data) {
    const { name, items, enabled } = data;
    const update = {};
    if (name !== undefined) update.name = name;
    if (enabled !== undefined) update.enabled = enabled;
    if (items !== undefined) {
      update.items = items.map((item, i) => ({
        item_key: item.item_key,
        item_name: item.item_name,
        order: i,
      }));
    }
    return this.ctx.model.RatingCategory.findByIdAndUpdate(id, update, { new: true });
  }

  async delete(id) {
    return this.ctx.model.RatingCategory.findByIdAndDelete(id);
  }
}

module.exports = RatingCategoryService;