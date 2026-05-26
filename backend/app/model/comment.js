/* eslint-disable */
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const CommentSchema = new Schema({
    topic_id: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    content: { type: String, required: true, maxLength: 2000 },
    author_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    author_name: { type: String, required: true },
    // 软删除
    is_deleted: { type: Boolean, default: false },
  }, { timestamps: true });

  CommentSchema.index({ topic_id: 1, created_at: 1 });
  CommentSchema.index({ author_id: 1 });

  return mongoose.model('Comment', CommentSchema);
};