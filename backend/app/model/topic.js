/* eslint-disable */
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const TopicSchema = new Schema({
    title: { type: String, required: true, maxLength: 100 },
    content: { type: String, required: true, maxLength: 5000 },
    // 状态流转：pending → accepted → processing → pending_verify → completed → closed
    status: {
      type: String,
      enum: ['pending', 'accepted', 'processing', 'pending_verify', 'completed', 'closed'],
      default: 'pending',
    },
    // 焦点议题（置顶）
    is_focused: { type: Boolean, default: false },
    focused_at: { type: Date },
    // 冗余计数字段，避免每次排序全表 count
    follow_count: { type: Number, default: 0 },
    comment_count: { type: Number, default: 0 },
    // 预计算热度分，用于排序
    hot_score: { type: Number, default: 0 },
    // 最后活跃时间（最后评论时间，用于时间衰减）
    last_activity_at: { type: Date, default: Date.now },
    // 作者
    author_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    author_name: { type: String, required: true },
    // 所属小区
    community_id: { type: Schema.Types.ObjectId },
    // 标签
    tags: [{ type: String }],
    // 图片附件
    images: [{ type: String }],
  }, { timestamps: true });

  // 复合索引：按小区+状态筛选、按热度/时间排序
  TopicSchema.index({ community_id: 1, status: 1 });
  TopicSchema.index({ community_id: 1, hot_score: -1 });
  TopicSchema.index({ community_id: 1, created_at: -1 });
  // 焦点议题专用索引
  TopicSchema.index({ is_focused: -1, focused_at: -1 });
  TopicSchema.index({ author_id: 1 });

  // 更新时间 last_activity_at（议题创建时默认创建时间）
  TopicSchema.pre('save', function(next) {
    if (this.isNew) {
      this.last_activity_at = this.createdAt || new Date();
    }
    next();
  });

  return mongoose.model('Topic', TopicSchema);
};