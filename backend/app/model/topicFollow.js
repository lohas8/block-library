/* eslint-disable */
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const TopicFollowSchema = new Schema({
    topic_id: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  }, { timestamps: true });

  // 联合唯一索引，防止重复关注
  TopicFollowSchema.index({ topic_id: 1, user_id: 1 }, { unique: true });
  TopicFollowSchema.index({ topic_id: 1 });
  TopicFollowSchema.index({ user_id: 1 });

  return mongoose.model('TopicFollow', TopicFollowSchema);
};