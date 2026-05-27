/**
 * RatingCategory Model - 物业评价配置（管理员配置）
 * 评价大项 + 小项，由管理员在后台配置
 */
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const RatingCategorySchema = new Schema({
    // 所属小区
    community_id: { type: Schema.Types.ObjectId, ref: 'Community' },
    // 大项名称（如"服务态度"、"环境卫生"、"设施维护"）
    name: { type: String, required: true, maxLength: 30 },
    // 排序
    order: { type: Number, default: 0 },
    // 启用/停用
    enabled: { type: Boolean, default: true },
    // 小项列表
    items: [{
      // 小项ID
      item_key: { type: String, required: true },
      // 小项名称
      item_name: { type: String, required: true },
      // 排序
      order: { type: Number, default: 0 },
    }],
  }, { timestamps: true });

  RatingCategorySchema.index({ community_id: 1, order: 1 });

  return mongoose.model('RatingCategory', RatingCategorySchema);
};