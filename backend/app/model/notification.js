/* eslint-disable */
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const NotificationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, default: 'info' },  // info, warning, success
    read: { type: Boolean, default: false },
  }, { timestamps: true });

  return mongoose.model('Notification', NotificationSchema);
};
