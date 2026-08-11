// 小区管理模型
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const CommunitySchema = new Schema({
    name: { type: String, required: true },
    address: { type: String, default: '' },
    adminName: { type: String, default: '' },
    status: { 
      type: String, 
      enum: ['active', 'disabled'], 
      default: 'active' 
    },
  }, { 
    timestamps: true 
  });

  return mongoose.model('Community', CommunitySchema);
};
