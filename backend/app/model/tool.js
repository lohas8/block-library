// 工具共享模型
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const ToolSchema = new Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, default: '' },
    description: { type: String, default: '' },
    depositPoints: { type: Number, required: true, default: 0 },
    rentPointsPerDay: { type: Number, required: true, default: 0 },
    status: { 
      type: String, 
      enum: ['available', 'borrowed'], 
      default: 'available' 
    },
    owner: { type: String, required: true },       // 拥有者ID
    ownerName: { type: String, required: true },  // 拥有者名称
    borrower: { type: String, default: null },   // 借用人ID
    borrowerName: { type: String, default: null },// 借用人名称
    dueDate: { type: String, default: null },    // 归还日期
    borrowedAt: { type: Date, default: null },    // 借出时间
  }, { 
    timestamps: true 
  });

  return mongoose.model('Tool', ToolSchema);
};
