/**
 * RatingCategoryService - 评价配置管理
 */
const Service = require('egg').Service;

class RatingCategoryService extends Service {
  async getList(communityId, includeDisabled = false) {
    const query = {};
    if (communityId) query.community_id = communityId;
    if (!includeDisabled) query.enabled = true;
    return this.ctx.model.RatingCategory.find(query).sort({ order: 1 });
  }

  async create(data) {
    const { community_id, name, icon, color, items, order } = data;
    const category = await this.ctx.model.RatingCategory.create({
      community_id,
      name,
      icon: icon || '📋',
      color: color || '#2DCCB6',
      items: (items || []).map((item, i) => ({
        item_key: item.item_key,
        item_name: item.item_name,
        order: item.order !== undefined ? item.order : i,
      })),
      order: order || 0,
    });
    return category;
  }

  async update(id, data) {
    const { name, icon, color, items, enabled, order } = data;
    const update = {};
    if (name !== undefined) update.name = name;
    if (icon !== undefined) update.icon = icon;
    if (color !== undefined) update.color = color;
    if (enabled !== undefined) update.enabled = enabled;
    if (order !== undefined) update.order = order;
    if (items !== undefined) {
      update.items = items.map((item, i) => ({
        item_key: item.item_key,
        item_name: item.item_name,
        order: item.order !== undefined ? item.order : i,
      }));
    }
    return this.ctx.model.RatingCategory.findByIdAndUpdate(id, update, { new: true });
  }

  async delete(id) {
    return this.ctx.model.RatingCategory.findByIdAndDelete(id);
  }

  async addItem(categoryId, item) {
    const cat = await this.ctx.model.RatingCategory.findById(categoryId);
    if (!cat) throw new Error('分类不存在');
    cat.items.push({
      item_key: item.item_key,
      item_name: item.item_name,
      order: item.order !== undefined ? item.order : cat.items.length,
    });
    await cat.save();
    return cat;
  }

  async updateItem(categoryId, itemKey, data) {
    const cat = await this.ctx.model.RatingCategory.findById(categoryId);
    if (!cat) throw new Error('分类不存在');
    const item = cat.items.find(i => i.item_key === itemKey);
    if (!item) throw new Error('小项不存在');
    if (data.item_name !== undefined) item.item_name = data.item_name;
    if (data.order !== undefined) item.order = data.order;
    await cat.save();
    return cat;
  }

  async removeItem(categoryId, itemKey) {
    const cat = await this.ctx.model.RatingCategory.findById(categoryId);
    if (!cat) throw new Error('分类不存在');
    cat.items = cat.items.filter(i => i.item_key !== itemKey);
    await cat.save();
    return cat;
  }

  // 初始化种子数据（四大类）
  async seedDefaults(communityId) {
    const existing = await this.ctx.model.RatingCategory.countDocuments({ community_id: communityId });
    if (existing > 0) return { seeded: false };

    const defaults = [
      {
        name: '安保', icon: '🔒', color: '#2DCCB6', order: 0,
        items: [
          { item_key: 'security_patrol', item_name: '保安巡逻频次' },
          { item_key: 'security_access', item_name: '门禁管理' },
          { item_key: 'security_response', item_name: '突发事件响应' },
          { item_key: 'security_camera', item_name: '监控覆盖' },
          { item_key: 'security_parking', item_name: '车辆管理' },
        ],
      },
      {
        name: '环境', icon: '🌿', color: '#1A7F6F', order: 1,
        items: [
          { item_key: 'env_green', item_name: '绿化养护' },
          { item_key: 'env_trash', item_name: '垃圾分类' },
          { item_key: 'env_clean', item_name: '道路清洁' },
          { item_key: 'env_landscape', item_name: '景观维护' },
          { item_key: 'env_public', item_name: '公共区域卫生' },
        ],
      },
      {
        name: '保洁', icon: '🧹', color: '#F4A261', order: 2,
        items: [
          { item_key: 'clean_hallway', item_name: '楼道清洁' },
          { item_key: 'clean_elevator', item_name: '电梯清洁' },
          { item_key: 'clean_garbage', item_name: '垃圾清运' },
          { item_key: 'clean_disinfect', item_name: '公共设施消毒' },
          { item_key: 'clean_basement', item_name: '地下室清洁' },
        ],
      },
      {
        name: '服务', icon: '👔', color: '#8B5CF6', order: 3,
        items: [
          { item_key: 'service_front', item_name: '前台服务态度' },
          { item_key: 'service_repair', item_name: '报修响应速度' },
          { item_key: 'service_complaint', item_name: '投诉处理效率' },
          { item_key: 'service_notice', item_name: '公告通知透明度' },
          { item_key: 'service_fee', item_name: '费用公示' },
        ],
      },
    ];

    for (const d of defaults) {
      await this.ctx.model.RatingCategory.create({ community_id: communityId, ...d });
    }
    return { seeded: true, count: defaults.length };
  }
}

module.exports = RatingCategoryService;